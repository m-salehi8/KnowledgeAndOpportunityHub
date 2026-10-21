import hashlib
import logging
from typing import Optional
from fastapi import APIRouter, Header, HTTPException, Request, BackgroundTasks, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Item
from schemas import EmailWebhookPayload
from config import settings
from services.enrichment import enrich_item_background

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


def make_hash(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


@router.post("/telegram")
async def telegram_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    x_telegram_bot_api_secret_token: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    # 1. Verify Secret Token header
    if settings.TELEGRAM_WEBHOOK_SECRET:
        if x_telegram_bot_api_secret_token != settings.TELEGRAM_WEBHOOK_SECRET:
            logger.warning("Unauthorized telegram webhook attempt: Invalid secret token.")
            raise HTTPException(status_code=403, detail="Invalid secret token")

    payload = await request.json()
    message = payload.get("message") or payload.get("channel_post") or payload.get("edited_message")

    if not message:
        return {"ok": True, "status": "ignored_no_message"}

    # 2. Verify Owner ID if configured
    from_user = message.get("from", {})
    user_id = from_user.get("id")
    if settings.TELEGRAM_OWNER_ID and user_id != settings.TELEGRAM_OWNER_ID:
        logger.warning(f"Unauthorized sender {user_id}. Expected {settings.TELEGRAM_OWNER_ID}.")
        return {"ok": True, "status": "ignored_unauthorized_user"}

    chat_id = message.get("chat", {}).get("id")
    message_id = message.get("message_id")

    # 3. Extract text content & caption
    text = message.get("text") or message.get("caption") or ""
    
    # Handle photos or documents
    if not text and "photo" in message:
        text = "[عکس بدون کپشن - ذخیره شده]"

    # Handle forward origin info
    forward_info = ""
    if "forward_origin" in message:
        f_type = message["forward_origin"].get("type")
        forward_info = f"\n[فوروارد شده از {f_type}]"
    elif "forward_from_chat" in message:
        c_title = message["forward_from_chat"].get("title") or message["forward_from_chat"].get("username", "")
        forward_info = f"\n[فوروارد شده از کانال {c_title}]"

    combined_text = f"{text}{forward_info}".strip()
    if not combined_text:
        return {"ok": True, "status": "empty_content"}

    # 4. Dedupe
    dedupe = make_hash(f"tg_{chat_id}_{message_id}")
    existing = db.query(Item).filter(Item.dedupe_hash == dedupe).first()
    if existing:
        return {"ok": True, "status": "already_exists", "item_id": existing.id}

    # 5. Fast insert (<50ms response to Telegram)
    first_line = combined_text.split("\n")[0][:120].strip() or "پیام جدید تلگرام"
    new_item = Item(
        type="telegram",
        title=first_line,
        summary=combined_text[:250],
        content=combined_text,
        source_name=f"Telegram: @{from_user.get('username') or from_user.get('first_name', 'Bot')}",
        category="تلگرام",
        raw_payload=payload,
        dedupe_hash=dedupe,
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    # 6. Background enrichment & bot reply
    background_tasks.add_task(enrich_item_background, new_item.id, chat_id)

    return {"ok": True, "status": "queued_for_enrichment", "item_id": new_item.id}


@router.post("/email")
async def email_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    x_webhook_secret: Optional[str] = Header(None),
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    # Verify shared secret
    auth_secret = x_webhook_secret or token
    if settings.EMAIL_WEBHOOK_SECRET and auth_secret != settings.EMAIL_WEBHOOK_SECRET:
        raise HTTPException(status_code=403, detail="Invalid email webhook secret")

    raw_json = await request.json()
    subject = raw_json.get("subject") or raw_json.get("Subject") or "No Subject"
    body = raw_json.get("body") or raw_json.get("text") or raw_json.get("stripped-text") or raw_json.get("html") or ""
    from_addr = raw_json.get("from") or raw_json.get("sender") or raw_json.get("From") or "Inbound Email"
    msg_id = raw_json.get("message_id") or raw_json.get("Message-Id") or f"em_{hash(subject + body[:50])}"

    dedupe = make_hash(f"email_{msg_id}")
    existing = db.query(Item).filter(Item.dedupe_hash == dedupe).first()
    if existing:
        return {"ok": True, "status": "already_exists", "item_id": existing.id}

    new_item = Item(
        type="email",
        title=subject,
        summary=body[:300].strip(),
        content=body,
        source_name=f"Email: {from_addr}",
        category="ایمیل هوشمند",
        raw_payload=raw_json,
        dedupe_hash=dedupe,
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    background_tasks.add_task(enrich_item_background, new_item.id, None)

    return {"ok": True, "status": "queued", "item_id": new_item.id}
