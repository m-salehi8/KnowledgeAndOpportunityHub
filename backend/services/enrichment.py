import re
import logging
import httpx
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Item, Tag, Category
from ai import get_ai_provider
from config import settings

logger = logging.getLogger(__name__)

URL_REGEX = re.compile(
    r"https?://(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_\+.~#?&//=]*"
)


def extract_url(text: str) -> Optional[str]:
    match = URL_REGEX.search(text)
    return match.group(0) if match else None


async def fetch_article_text(url: str) -> Tuple[str, str]:
    """Fetches URL and extracts main article body using trafilatura."""
    try:
        async with httpx.AsyncClient(timeout=12.0, follow_redirects=True) as client:
            resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0 (compatible; KnowledgeHubBot/1.0)"})
            if resp.status_code == 200:
                html = resp.text
                import trafilatura
                extracted = trafilatura.extract(html, include_links=False, include_images=False)
                if extracted and len(extracted.strip()) > 100:
                    return extracted.strip(), url
    except Exception as e:
        logger.warning(f"Failed to extract article from {url}: {e}")
    return "", url


async def enrich_item_background(item_id: str, telegram_chat_id: Optional[int] = None) -> None:
    """Background task to enrich an item with AI and optionally reply to Telegram."""
    db: Session = SessionLocal()
    try:
        item = db.query(Item).filter(Item.id == item_id).first()
        if not item:
            logger.error(f"Item {item_id} not found for enrichment.")
            return

        # Check if there is a URL in the text/content
        content_to_analyze = item.content or item.summary
        extracted_url = extract_url(content_to_analyze) or item.source_url

        article_text = ""
        if extracted_url:
            article_text, _ = await fetch_article_text(extracted_url)

        full_context = f"{content_to_analyze}\n\n{article_text}".strip()

        ai = get_ai_provider()
        enrichment = await ai.enrich(full_context, extracted_url)

        # Update item
        item.title = enrichment.title
        item.summary = enrichment.summary
        item.category = enrichment.category
        if extracted_url and not item.source_url:
            item.source_url = extracted_url

        # Ensure category exists
        cat = db.query(Category).filter(Category.name == enrichment.category).first()
        if not cat:
            cat = Category(name=enrichment.category)
            db.add(cat)

        # Attach tags
        for tag_name in enrichment.tags:
            clean_tag = tag_name.strip().replace("#", "")
            if clean_tag:
                tag_obj = db.query(Tag).filter(Tag.name == clean_tag).first()
                if not tag_obj:
                    tag_obj = Tag(name=clean_tag)
                    db.add(tag_obj)
                if tag_obj not in item.tags:
                    item.tags.append(tag_obj)

        db.commit()
        logger.info(f"Successfully enriched item {item_id}: {item.title}")

        # Send Telegram confirmation if originated from Telegram
        if telegram_chat_id and settings.TELEGRAM_BOT_TOKEN:
            tags_str = " ".join([f"#{t.name}" for t in item.tags])
            reply_text = (
                f"✅ ذخیره و تحلیل گردید:\n\n"
                f"📌 {item.title}\n"
                f"🏷 {item.category} | {tags_str}\n\n"
                f"📝 {item.summary}"
            )
            async with httpx.AsyncClient(timeout=8.0) as client:
                await client.post(
                    f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage",
                    json={
                        "chat_id": telegram_chat_id,
                        "text": reply_text,
                    },
                )
    except Exception as e:
        logger.error(f"Error enriching item {item_id}: {e}", exc_info=True)
    finally:
        db.close()
