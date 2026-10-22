import time
from typing import Optional

from fastapi import APIRouter, Body, Depends
from sqlalchemy.orm import Session

from auth import verify_app_token
from config import settings
from database import get_db
from services.telegram_projects import (
    _store_project,
    get_bot_username,
    poll_telegram_projects,
    project_to_dict,
)

router = APIRouter(prefix="/api/telegram", tags=["Telegram Projects"], dependencies=[Depends(verify_app_token)])


@router.get("/status")
async def telegram_status():
    return {
        "bot_username": await get_bot_username(),
        "owner_chat_id": str(settings.TELEGRAM_OWNER_ID or ""),
        "connected": bool(settings.TELEGRAM_BOT_TOKEN),
    }


@router.post("/sync-projects")
async def sync_projects():
    return await poll_telegram_projects()


@router.post("/simulate-project")
async def simulate_project(text: Optional[str] = Body(None, embed=True), db: Session = Depends(get_db)):
    sample_text = text or (
        "یک موتور وب‌اسکرپینگ توزیع‌شده با Python و Playwright برای استخراج روزانه فرصت‌های شغلی "
        "و تحلیل آن‌ها با مدل Gemini.\nمعماری میکروسرویس با صف پیام Celery، کش Redis و دیتابیس PostgreSQL.\n"
        "فرانت‌اند با React 19 و Tailwind CSS.\n"
        "https://github.com/mamadreza8138/distributed-crawler-agent"
    )
    dedupe = f"sim_{int(time.time() * 1000)}"
    message = {
        "message_id": dedupe,
        "from": {"id": settings.TELEGRAM_OWNER_ID},
        "chat": {"id": settings.TELEGRAM_OWNER_ID},
        "text": sample_text,
    }
    project = await _store_project(db, message, sample_text, dedupe)
    return {
        "project": project_to_dict(project),
        "message": f"پروژه «{project.title}» با موفقیت از پیام تلگرام پردازش شد.",
    }
