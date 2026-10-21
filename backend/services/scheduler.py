import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from services.scraper import run_news_digest_job, run_job_radar_job
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

        # Default: 08:00 for Job Radar
        job_hour, job_minute = map(int, settings.JOB_RADAR_TIME.split(":"))
        scheduler.add_job(
            run_job_radar_job,
            CronTrigger(hour=job_hour, minute=job_minute),
            id="daily_job_radar",
            replace_existing=True,
        )

        scheduler.start()
        logger.info(f"APScheduler started. News at {settings.NEWS_DIGEST_TIME}, Jobs at {settings.JOB_RADAR_TIME}.")
    except Exception as e:
        logger.error(f"Failed to start APScheduler: {e}")


def shutdown_scheduler():
    if scheduler.running:
        scheduler.shutdown()
