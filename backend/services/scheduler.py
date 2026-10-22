import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from services.scraper import run_news_digest_job, run_job_radar_job, run_product_hunt_job
from services.telegram_projects import poll_telegram_projects
from config import settings

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


def start_scheduler():
    try:
        # Default: 07:30 for News Digest
        news_hour, news_minute = map(int, settings.NEWS_DIGEST_TIME.split(":"))
        scheduler.add_job(
            run_news_digest_job,
            CronTrigger(hour=news_hour, minute=news_minute),
            id="daily_news_digest",
            replace_existing=True,
        )

        # Default: 08:00 for Job Radar (Jobinja & Jobvision)
        job_hour, job_minute = map(int, settings.JOB_RADAR_TIME.split(":"))
        scheduler.add_job(
            run_job_radar_job,
            CronTrigger(hour=job_hour, minute=job_minute),
            id="daily_job_radar",
            replace_existing=True,
        )

        # Default: 08:30 for Product Hunt Daily
        ph_hour, ph_minute = map(int, settings.PRODUCT_HUNT_TIME.split(":"))
        scheduler.add_job(
            run_product_hunt_job,
            CronTrigger(hour=ph_hour, minute=ph_minute),
            id="daily_product_hunt",
            replace_existing=True,
        )

        if settings.TELEGRAM_BOT_TOKEN:
            scheduler.add_job(
                poll_telegram_projects,
                IntervalTrigger(seconds=20),
                id="telegram_project_poll",
                replace_existing=True,
                max_instances=1,
                coalesce=True,
            )

        scheduler.start()
        logger.info(
            f"APScheduler started. News at {settings.NEWS_DIGEST_TIME}, Jobs at {settings.JOB_RADAR_TIME}, "
            f"Product Hunt at {settings.PRODUCT_HUNT_TIME}, "
            f"Telegram polling: {'enabled' if settings.TELEGRAM_BOT_TOKEN else 'disabled'}."
        )
    except Exception as e:
        logger.error(f"Failed to start APScheduler: {e}")


def shutdown_scheduler():
    if scheduler.running:
        scheduler.shutdown()
