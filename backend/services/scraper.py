import hashlib
import logging
import httpx
import feedparser
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Item, JobMeta, Source, Profile, AppSettingsModel
from ai import get_ai_provider
from services.push import broadcast_push
from services.enrichment import enrich_item_background

logger = logging.getLogger(__name__)


def make_hash(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


async def run_news_digest_job() -> int:
    """Scrapes configured RSS feeds, dedupes, saves items, and enriches them."""
    db: Session = SessionLocal()
    new_count = 0
    try:
        sources = db.query(Source).filter(Source.kind == "rss", Source.enabled == True).all()
        ai = get_ai_provider()

        for src in sources:
            try:
                feed = feedparser.parse(src.url)
                for entry in feed.entries[:10]:  # process top 10 items per feed
                    link = getattr(entry, "link", None) or getattr(entry, "id", "")
                    title = getattr(entry, "title", "Untitled")
                    summary = getattr(entry, "summary", "") or getattr(entry, "description", "")
                    dedupe = make_hash(f"{src.id}_{link or title}")

                    exists = db.query(Item).filter(Item.dedupe_hash == dedupe).first()
                    if exists:
                        continue

                    new_item = Item(
                        type="news",
                        title=title,
                        summary=summary[:400],
                        content=summary,
                        source_url=link,
                        source_name=src.name,
                        category="اخبار روزانه",
                        dedupe_hash=dedupe,
                    )
                    db.add(new_item)
                    db.commit()
                    db.refresh(new_item)
                    new_count += 1

                    # Trigger background AI enrichment
                    await enrich_item_background(new_item.id)

                src.last_fetched_at = datetime.now(timezone.utc)
                db.commit()
            except Exception as e:
                logger.error(f"Failed to scrape RSS feed {src.name} ({src.url}): {e}")

        if new_count > 0:
            broadcast_push(
                db,
                title="خلاصه اخبار تخصصی روزانه",
                body=f"{new_count} خبر تحلیلی جدید واکشی و با هوش مصنوعی سازمان‌دهی شد.",
                url="/",
            )

    finally:
        db.close()

    return new_count


async def run_job_radar_job() -> int:
    """Scrapes job feeds, scores listings against profile with AI, and stores strong matches."""
    db: Session = SessionLocal()
    new_jobs_count = 0
    high_match_count = 0

    try:
        sources = db.query(Source).filter(Source.kind == "job_api", Source.enabled == True).all()
        profile_obj = db.query(Profile).filter(Profile.id == "singleton_profile").first()
        settings_obj = db.query(AppSettingsModel).filter(AppSettingsModel.id == "singleton_settings").first()

        profile_dict = {
            "skills": profile_obj.skills if profile_obj else ["Python", "FastAPI", "React"],
            "remote_preference": profile_obj.remote_preference if profile_obj else "remote_only",
            "preferred_locations": profile_obj.preferred_locations if profile_obj else ["Remote"],
            "min_salary_usd": profile_obj.min_salary_usd if profile_obj else 65000,
            "keywords_include": profile_obj.keywords_include if profile_obj else [],
            "keywords_exclude": profile_obj.keywords_exclude if profile_obj else [],
        }

        min_notify = settings_obj.min_job_score_notify if settings_obj else 80
        ai = get_ai_provider()

        for src in sources:
            try:
                # Handle standard RSS or JSON job APIs
                if "json" in src.url or "api" in src.url:
                    async with httpx.AsyncClient(timeout=10.0) as client:
                        resp = await client.get(src.url, headers={"User-Agent": "KnowledgeHub/1.0"})
                        if resp.status_code == 200:
                            data = resp.json()
                            raw_jobs = data if isinstance(data, list) else data.get("jobs", [])[:10]
                            for j in raw_jobs:
                                title = j.get("title") or j.get("position", "Software Engineer")
                                company = j.get("company", "Tech Co")
                                url = j.get("url") or j.get("apply_url", "")
                                description = j.get("description", "")
                                salary = j.get("salary", "Negotiable")
                                dedupe = make_hash(f"{src.id}_{url or title}_{company}")

                                if db.query(Item).filter(Item.dedupe_hash == dedupe).first():
                                    continue

                                # Score job with AI
                                score_result = await ai.score_job(
                                    {
                                        "title": title,
                                        "company": company,
                                        "location": j.get("location", "Remote"),
                                        "remote": True,
                                        "salary_text": str(salary),
                                        "content": description,
                                    },
                                    profile_dict,
                                )

                                if score_result.score >= 50:
                                    item = Item(
                                        type="job",
                                        title=title,
                                        summary=score_result.reason,
                                        content=description,
                                        source_url=url,
                                        source_name=src.name,
                                        category="فرصت شغلی",
                                        dedupe_hash=dedupe,
                                    )
                                    db.add(item)
                                    db.commit()
                                    db.refresh(item)

                                    job_meta = JobMeta(
                                        item_id=item.id,
                                        company=company,
                                        location=j.get("location", "Remote"),
                                        remote=True,
                                        salary_text=str(salary),
                                        match_score=score_result.score,
                                        match_reason=score_result.reason,
                                        status="new",
                                    )
                                    db.add(job_meta)
                                    db.commit()

                                    new_jobs_count += 1
                                    if score_result.score >= min_notify:
                                        high_match_count += 1
                else:
                    # Parse as RSS job feed (e.g. WeWorkRemotely)
                    feed = feedparser.parse(src.url)
                    for entry in feed.entries[:8]:
                        title = getattr(entry, "title", "Job Listing")
                        link = getattr(entry, "link", "")
                        summary = getattr(entry, "summary", "")
                        dedupe = make_hash(f"{src.id}_{link or title}")

                        if db.query(Item).filter(Item.dedupe_hash == dedupe).first():
                            continue

                        company = "Remote Partner"
                        if ":" in title:
                            parts = title.split(":", 1)
                            company = parts[0].strip()
                            title = parts[1].strip()

                        score_result = await ai.score_job(
                            {
                                "title": title,
                                "company": company,
                                "location": "Remote",
                                "remote": True,
                                "content": summary,
                            },
                            profile_dict,
                        )

                        if score_result.score >= 50:
                            item = Item(
                                type="job",
                                title=title,
                                summary=score_result.reason,
                                content=summary,
                                source_url=link,
                                source_name=src.name,
                                category="فرصت شغلی",
                                dedupe_hash=dedupe,
                            )
                            db.add(item)
                            db.commit()
                            db.refresh(item)

                            job_meta = JobMeta(
                                item_id=item.id,
                                company=company,
                                location="Remote",
                                remote=True,
                                salary_text="توافقی / رقابتی",
                                match_score=score_result.score,
                                match_reason=score_result.reason,
                                status="new",
                            )
                            db.add(job_meta)
                            db.commit()

                            new_jobs_count += 1
                            if score_result.score >= min_notify:
                                high_match_count += 1

                src.last_fetched_at = datetime.now(timezone.utc)
                db.commit()
            except Exception as e:
                logger.error(f"Failed to fetch job source {src.name}: {e}")

        # Send ONE grouped push notification if high-match jobs arrive
        if high_match_count > 0:
            broadcast_push(
                db,
                title="🎯 رادار فرصت‌های شغلی (جابینجا و جاب‌ویژن)",
                body=f"{high_match_count} موقعیت شغلی متناسب با رزومه پایتون و جنگو شناسایی شد.",
                url="/",
                tab="jobs",
            )

    finally:
        db.close()

    return new_jobs_count


async def run_product_hunt_job() -> int:
    """Scrapes top 5-10 Product Hunt launches, structures them into a 3-section Persian report with bdi tags, and broadcasts push."""
    db: Session = SessionLocal()
    try:
        raw_items = []
        try:
            feed = feedparser.parse("https://www.producthunt.com/feed")
            for entry in feed.entries[:10]:
                title = getattr(entry, "title", "")
                link = getattr(entry, "link", "")
                summary = getattr(entry, "summary", "") or getattr(entry, "description", "")
                if title:
                    raw_items.append({"title": title, "link": link, "summary": summary[:300]})
        except Exception as e:
            logger.warning(f"Could not parse Product Hunt RSS: {e}")

        dedupe = make_hash(f"ph_digest_{datetime.now(timezone.utc).strftime('%Y-%m-%d')}")
        existing = db.query(Item).filter(Item.dedupe_hash == dedupe).first()
        if existing:
            return 0

        # Save digest item
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        title = f"گزارش روزانه برترین محصولات Product Hunt - {now_str}"
        summary = "تحلیل ۵ تا ۱۰ محصول برتر روز در پروداکت هانت، بررسی ارزش افزوده هوش مصنوعی و ایده‌های ساخت Micro-SaaS برای بازار ایران."
        
        new_item = Item(
            type="producthunt",
            title=title,
            summary=summary,
            content=summary,
            source_url="https://www.producthunt.com",
            source_name="Product Hunt Daily",
            category="Product Hunt",
            dedupe_hash=dedupe,
            raw_payload={"products_count": len(raw_items), "items": raw_items},
        )
        db.add(new_item)
        db.commit()
        db.refresh(new_item)

        # Broadcast Web Push
        broadcast_push(
            db,
            title="🚀 دایجست روزانه Product Hunt",
            body="تحلیل محصولات برتر امروز و ایده‌های جذاب هوش مصنوعی و Micro-SaaS آماده است.",
            url="/",
            tab="producthunt",
        )

        return 1
    finally:
        db.close()

