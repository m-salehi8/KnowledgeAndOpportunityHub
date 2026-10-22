import asyncio
import hashlib
import json
import logging
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import httpx
from sqlalchemy.orm import Session

from config import settings
from database import SessionLocal
from models import BotState, Item, Project

logger = logging.getLogger(__name__)

# Prevent HTTP client access logs from exposing the bot token embedded in the API URL.
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)

_poll_lock = asyncio.Lock()
_bot_username_cache: Optional[str] = None

GITHUB_RE = re.compile(r"https?://(?:www\.)?github\.com/[^\s<>\"']+", re.IGNORECASE)
URL_RE = re.compile(r"https?://[^\s<>\"']+", re.IGNORECASE)

TECH_KEYWORDS = [
    ("python", "Python"), ("fastapi", "FastAPI"), ("django", "Django"),
    ("react", "React"), ("next.js", "Next.js"), ("nextjs", "Next.js"),
    ("typescript", "TypeScript"), ("javascript", "JavaScript"),
    ("node", "Node.js"), ("postgres", "PostgreSQL"), ("sqlite", "SQLite"),
    ("redis", "Redis"), ("docker", "Docker"), ("kubernetes", "Kubernetes"),
    ("claude", "Claude"), ("codex", "Codex"), ("gemini", "Gemini"),
    ("llm", "LLM"), ("playwright", "Playwright"), ("tailwind", "Tailwind CSS"),
    ("telegram", "Telegram Bot"), ("github", "GitHub"), ("celery", "Celery"),
]

OFFSET_KEY = "telegram_projects_offset"

PROJECT_HINTS = [
    "project", "پروژه", "app", "application", "اپلیکیشن", "اپ ", "ربات", "bot",
    "platform", "پلتفرم", "website", "سایت", "web", "وب", "api", "service",
    "سرویس", "system", "سیستم", "tool", "ابزار", "library", "کتابخانه",
    "framework", "فریم‌ورک", "software", "نرم‌افزار", "برنامه", "کد", "code",
    "ai", "هوش مصنوعی", "llm", "machine learning", "یادگیری ماشین",
    "database", "دیتابیس", "backend", "frontend", "بک‌اند", "فرانت‌اند",
    "microservice", "میکروسرویس", "automation", "اتوماسیون", "scraper",
    "اسکرپر", "cli", "extension", "افزونه", "plugin", "پلاگین", "saas",
    "startup", "استارتاپ", "github", "open source", "متن‌باز",
]

def _looks_like_project(text: str) -> bool:
    if GITHUB_RE.search(text):
        return True
    low = text.lower()
    return any(hint in low for hint in PROJECT_HINTS)



def _api_url(method: str) -> str:
    return f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/{method}"


async def _telegram_request(method: str, payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=25.0) as client:
        resp = await client.post(_api_url(method), json=payload or {})
        try:
            data = resp.json()
        except Exception:
            logger.error("Telegram %s returned non-JSON response: %s", method, resp.text[:300])
            return {"ok": False, "description": "invalid_telegram_response"}
        if not data.get("ok"):
            logger.warning("Telegram %s failed: %s", method, data)
        return data


async def send_telegram_message(chat_id: Any, text: str) -> None:
    if not settings.TELEGRAM_BOT_TOKEN:
        return
    await _telegram_request(
        "sendMessage",
        {"chat_id": chat_id, "text": text, "parse_mode": "HTML", "disable_web_page_preview": True},
    )


async def get_bot_username() -> str:
    global _bot_username_cache
    if _bot_username_cache:
        return _bot_username_cache
    if not settings.TELEGRAM_BOT_TOKEN:
        return "knowledgehubpwabot"
    data = await _telegram_request("getMe")
    if data.get("ok"):
        _bot_username_cache = data.get("result", {}).get("username") or "knowledgehubpwabot"
    else:
        _bot_username_cache = "knowledgehubpwabot"
    return _bot_username_cache


def _clean_url(url: str) -> str:
    return url.rstrip(").,،;!؟?'\"")


def _heuristic_extract(text: str) -> Dict[str, Any]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    first_line = lines[0] if lines else "پروژه ثبت‌شده از تلگرام"
    title = first_line[:120]

    github_match = GITHUB_RE.search(text)
    github_url = _clean_url(github_match.group(0)) if github_match else ""

    live_url = ""
    for match in URL_RE.finditer(text):
        candidate = _clean_url(match.group(0))
        low = candidate.lower()
        if "github.com" in low or "t.me/" in low or "telegram." in low:
            continue
        live_url = candidate
        break

    low = text.lower()
    if any(word in low for word in ["ai", "هوش مصنوعی", "claude", "codex", "llm", "gemini"]):
        category = "ai"
    elif any(word in low for word in ["داده", "data", "analytics", "pipeline"]):
        category = "data"
    elif any(word in low for word in ["موبایل", "mobile", "ios", "android", "flutter"]):
        category = "mobile"
    elif any(word in low for word in ["ابزار", "tool", "cli", "extension", "افزونه"]):
        category = "tools"
    else:
        category = "fullstack"

    if any(word in low for word in ["production", "پروداکشن", "منتشر شده", "لایو"]):
        status = "production"
    elif any(word in low for word in ["open source", "open-source", "متن باز", "متن‌باز"]):
        status = "opensource"
    elif any(word in low for word in ["concept", "ایده", "طرح اولیه"]):
        status = "concept"
    else:
        status = "active"

    tech_stack: List[str] = []
    for keyword, label in TECH_KEYWORDS:
        if keyword in low and label not in tech_stack:
            tech_stack.append(label)
    if not tech_stack:
        tech_stack = ["Python", "FastAPI", "React", "PostgreSQL", "Docker"]

    short_desc = " ".join(text.split())[:220]
    if len(short_desc) == 220:
        short_desc += "..."

    return {
        "title": title,
        "short_desc": short_desc,
        "full_desc": text.strip(),
        "category": category,
        "status": status,
        "tech_stack": tech_stack,
        "progress_percent": 70,
        "impact_score": 88,
        "ai_summary": f"پروژه استخراج‌شده از پیام تلگرام؛ تمرکز بر {', '.join(tech_stack[:3])}.",
        "github_url": github_url,
        "live_url": live_url,
    }


def _gemini_extract(text: str) -> Dict[str, Any]:
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    prompt = f"""شما یک معمار نرم‌افزار ارشد هستید. پیام زیر را تحلیل کنید و مشخصات پروژه را استخراج کنید.
پاسخ را فقط به صورت JSON با این ساختار بدهید:
{{
  "title": "عنوان حرفه‌ای پروژه",
  "short_desc": "خلاصه یک یا دو جمله‌ای",
  "full_desc": "شرح کامل پروژه",
  "category": "ai" | "fullstack" | "data" | "tools" | "mobile",
  "status": "active" | "production" | "opensource" | "concept",
  "tech_stack": ["..."],
  "progress_percent": 70,
  "impact_score": 88,
  "ai_summary": "جمع‌بندی یک‌خطی",
  "github_url": "",
  "live_url": ""
}}

متن پیام:
{text[:8000]}
"""
    models: List[str] = []
    for model_name in [settings.GEMINI_MODEL, "gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite"]:
        if model_name and model_name not in models:
            models.append(model_name)

    last_error: Optional[Exception] = None
    for model_name in models:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json", temperature=0.2),
            )
            data = json.loads(response.text or "{}")
            if not data.get("title"):
                raise ValueError("Gemini response missing title")
            valid_categories = {"ai", "fullstack", "data", "tools", "mobile"}
            valid_statuses = {"active", "production", "opensource", "concept"}
            data["category"] = data.get("category") if data.get("category") in valid_categories else "fullstack"
            data["status"] = data.get("status") if data.get("status") in valid_statuses else "active"
            data.setdefault("tech_stack", [])
            data.setdefault("progress_percent", 70)
            data.setdefault("impact_score", 88)
            data.setdefault("ai_summary", "")
            data.setdefault("github_url", "")
            data.setdefault("live_url", "")
            return data
        except Exception as exc:
            last_error = exc
            logger.warning("Gemini model %s failed for project extraction: %s", model_name, exc)

    raise last_error or RuntimeError("Gemini project extraction failed")


async def extract_project(text: str) -> Dict[str, Any]:
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip() and settings.GEMINI_API_KEY != "your-gemini-api-key-here":
        try:
            return await asyncio.to_thread(_gemini_extract, text)
        except Exception as exc:
            logger.warning("Gemini project extraction failed, using heuristic: %s", exc)
    return _heuristic_extract(text)


def _forward_dedupe(message: Dict[str, Any]) -> str:
    origin = message.get("forward_origin") or {}
    if origin.get("type") == "channel":
        chat = origin.get("chat") or {}
        if chat.get("id") and origin.get("message_id"):
            return f"fwd_{chat['id']}_{origin['message_id']}"
    if message.get("forward_from_chat") and message.get("forward_from_message_id"):
        chat = message["forward_from_chat"]
        return f"fwd_{chat.get('id')}_{message.get('forward_from_message_id')}"
    chat_id = (message.get("chat") or {}).get("id")
    return f"msg_{chat_id}_{message.get('message_id')}"


def project_to_dict(project: Project) -> Dict[str, Any]:
    created = project.created_at
    if created.tzinfo is None:
        created = created.replace(tzinfo=timezone.utc)
    return {
        "id": project.id,
        "title": project.title,
        "short_desc": project.short_desc,
        "full_desc": project.full_desc,
        "category": project.category,
        "status": project.status,
        "tech_stack": project.tech_stack or [],
        "progress_percent": project.progress_percent,
        "impact_score": project.impact_score,
        "ai_summary": project.ai_summary,
        "github_url": project.github_url,
        "live_url": project.live_url,
        "created_at": created.isoformat(),
        "is_favorite": bool(project.is_favorite),
        "stars_count": project.stars_count or 0,
        "source_channel": project.source_channel,
        "telegram_sender": project.telegram_sender,
    }


async def _store_project(db: Session, message: Dict[str, Any], text: str, dedupe: str) -> Optional[Project]:
    extracted = await extract_project(text)
    sender_id = str((message.get("from") or {}).get("id", ""))
    username = await get_bot_username()

    project = Project(
        title=extracted["title"][:500],
        short_desc=extracted.get("short_desc", "")[:2000],
        full_desc=extracted.get("full_desc", text)[:20000],
        category=extracted.get("category", "fullstack"),
        status=extracted.get("status", "active"),
        tech_stack=extracted.get("tech_stack") or [],
        progress_percent=int(extracted.get("progress_percent", 70) or 70),
        impact_score=int(extracted.get("impact_score", 88) or 88),
        ai_summary=extracted.get("ai_summary", ""),
        github_url=(extracted.get("github_url") or None),
        live_url=(extracted.get("live_url") or None),
        created_at=datetime.now(timezone.utc),
        is_favorite=True,
        stars_count=5,
        source_channel="telegram",
        telegram_sender=sender_id,
        telegram_dedupe=dedupe,
    )
    db.add(project)

    item = Item(
        type="telegram",
        title=f"پروژه جدید از تلگرام: {project.title}",
        summary=project.short_desc,
        content=(
            f"پیام دریافتی از تلگرام ({sender_id}):\n\n{text}\n\n"
            f"تحلیل پروژه:\nتکنولوژی‌ها: {', '.join(project.tech_stack or [])}\n"
            f"دسته: {project.category}\nامتیاز فنی: {project.impact_score}/100"
        ),
        source_name=f"ربات تلگرام: @{username}",
        source_url=f"https://t.me/{username}",
        category="پروژه‌ها و ایده‌ها",
        is_favorite=True,
        raw_payload=message,
        dedupe_hash=hashlib.sha256(f"tg_project_{dedupe}".encode("utf-8")).hexdigest(),
    )
    db.add(item)
    db.commit()
    db.refresh(project)
    return project


async def poll_telegram_projects() -> Dict[str, Any]:
    if not settings.TELEGRAM_BOT_TOKEN:
        return {
            "synced_count": 0,
            "new_projects": [],
            "message": "توکن ربات تلگرام تنظیم نشده است.",
        }

    async with _poll_lock:
        db = SessionLocal()
        new_projects: List[Project] = []
        last_update_id = 0
        try:
            state = db.get(BotState, OFFSET_KEY)
            offset = int(state.value) if state and state.value else 0

            data = await _telegram_request(
                "getUpdates",
                {
                    "offset": offset,
                    "limit": 100,
                    "timeout": 0,
                    "allowed_updates": ["message", "edited_message"],
                },
            )
            if not data.get("ok"):
                return {
                    "synced_count": 0,
                    "new_projects": [],
                    "message": "دریافت پیام‌ها از تلگرام ناموفق بود.",
                }

            updates = data.get("result") or []
            for update in updates:
                last_update_id = max(last_update_id, int(update.get("update_id", 0)))
                message = update.get("message") or update.get("edited_message")
                if not message:
                    continue

                sender_id = (message.get("from") or {}).get("id")
                if settings.TELEGRAM_OWNER_ID and sender_id != settings.TELEGRAM_OWNER_ID:
                    logger.warning("Ignoring Telegram project message from unauthorized sender %s", sender_id)
                    continue

                text = (message.get("text") or message.get("caption") or "").strip()
                if not text:
                    continue

                chat_id = (message.get("chat") or {}).get("id")
                if text == "/start":
                    await send_telegram_message(
                        chat_id,
                        "سلام! ربات هاب پروژه فعال است.\n"
                        "هر ایده، توضیح پروژه یا لینک مخزن گیت‌هاب را برای من بفرستید تا تحلیل و در بخش «پروژه‌ها» ذخیره شود.",
                    )
                    continue

                if not _looks_like_project(text):
                    logger.info("Skipping Telegram message that does not look like a project: %s", text[:80])
                    continue

                dedupe = _forward_dedupe(message)
                existing = db.query(Project).filter(Project.telegram_dedupe == dedupe).first()
                if existing:
                    continue

                try:
                    project = await _store_project(db, message, text, dedupe)
                except Exception as exc:
                    db.rollback()
                    logger.error("Failed to store Telegram project: %s", exc, exc_info=True)
                    continue

                new_projects.append(project)
                await send_telegram_message(
                    chat_id,
                    "✅ پروژه در هاب ثبت شد!\n\n"
                    f"📌 {project.title}\n"
                    f"📂 دسته: {project.category}\n"
                    f"🛠 {', '.join((project.tech_stack or [])[:5])}\n"
                    f"📈 پیشرفت: {project.progress_percent}٪\n"
                    f"⭐ امتیاز: {project.impact_score}/100",
                )

            if updates:
                if state is None:
                    state = BotState(key=OFFSET_KEY, value="")
                    db.add(state)
                state.value = str(last_update_id + 1)
                db.commit()

            if new_projects:
                message_text = f"{len(new_projects)} پروژه جدید از تلگرام خوانده و در بخش پروژه‌ها ذخیره شد."
            elif updates:
                message_text = "پیام جدید قابل ثبت در بخش پروژه‌ها پیدا نشد."
            else:
                message_text = "پیام جدیدی در ربات تلگرام موجود نیست."

            return {
                "synced_count": len(new_projects),
                "new_projects": [project_to_dict(p) for p in new_projects],
                "message": message_text,
            }
        finally:
            db.close()
