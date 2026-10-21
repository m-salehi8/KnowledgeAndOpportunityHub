import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from models import Profile, AppSettingsModel, Source
from routers import webhooks, items, jobs, metadata, sources, profile, settings as app_settings, push
from services.scheduler import start_scheduler, shutdown_scheduler

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("hub_backend")


def init_db_defaults():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Seed Profile
        if not db.query(Profile).filter(Profile.id == "singleton_profile").first():
            db.add(
                Profile(
                    id="singleton_profile",
                    full_name="محمد‌رضا حسینی",
                    bio="مهندس ارشد نرم‌افزار، علاقه‌مند به هوش مصنوعی مولد و معماری سیستم‌های توزیع‌شده.",
                    skills=["Python", "FastAPI", "React", "TypeScript", "PostgreSQL", "Docker", "Gemini AI"],
                    preferred_locations=["Remote", "Tehran", "Europe (Remote)"],
                    remote_preference="remote_only",
                    min_salary_usd=65000,
                    keywords_include=["Senior", "Staff", "Lead", "AI", "Full-Stack"],
                    keywords_exclude=["Junior", "Wordpress", "PHP 5"],
                    news_interests=["AI & LLMs", "Distributed Systems", "Frontend Architecture"],
                )
            )

        # Seed Settings
        if not db.query(AppSettingsModel).filter(AppSettingsModel.id == "singleton_settings").first():
            db.add(
                AppSettingsModel(
                    id="singleton_settings",
                    notifications_enabled=True,
                    news_digest_time="07:30",
                    job_radar_time="08:00",
                    min_job_score_notify=80,
                )
            )

        # Seed Initial Sources
        if db.query(Source).count() == 0:
            db.add_all([
                Source(
                    name="Hacker News Frontpage",
                    url="https://news.ycombinator.com/rss",
                    kind="rss",
                    enabled=True,
                ),
                Source(
                    name="GitHub Trending (Python & TS)",
                    url="https://github-trends.vercel.app/rss",
                    kind="rss",
                    enabled=True,
                ),
                Source(
                    name="RemoteOK Job Feed",
                    url="https://remoteok.com/api?tag=engineer",
                    kind="job_api",
                    enabled=True,
                ),
            ])

        db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database and defaults...")
    init_db_defaults()
    logger.info("Starting scheduler...")
    start_scheduler()
    yield
    logger.info("Shutting down scheduler...")
    shutdown_scheduler()


app = FastAPI(
    title="Knowledge & Opportunity Hub API",
    description="Backend API for personal AI knowledge curator, daily news digest, and scored job radar.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(webhooks.router)
app.include_router(items.router)
app.include_router(jobs.router)
app.include_router(metadata.router)
app.include_router(sources.router)
app.include_router(profile.router)
app.include_router(app_settings.router)
app.include_router(push.router)


@app.get("/healthz")
def healthz():
    return {"status": "ok", "app": "Knowledge & Opportunity Hub Backend"}


@app.get("/")
def root():
    return {
        "message": "Knowledge & Opportunity Hub API is running",
        "docs": "/docs",
        "health": "/healthz",
    }
