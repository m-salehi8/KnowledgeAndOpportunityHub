from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Tag, Category, Item, JobMeta
from schemas import HubStatsOut
from auth import verify_app_token

router = APIRouter(prefix="/api", tags=["Metadata"], dependencies=[Depends(verify_app_token)])


@router.get("/tags", response_model=List[str])
def get_all_tags(db: Session = Depends(get_db)):
    tags = db.query(Tag).all()
    return [t.name for t in tags]


@router.get("/categories", response_model=List[str])
def get_all_categories(db: Session = Depends(get_db)):
    cats = db.query(Category).all()
    return [c.name for c in cats]


@router.get("/stats", response_model=HubStatsOut)
def get_stats(db: Session = Depends(get_db)):
    base_query = db.query(Item).filter(Item.is_archived == False)
    total_items = base_query.count()
    unread_count = base_query.filter(Item.is_read == False).count()
    telegram_count = base_query.filter(Item.type == "telegram").count()
    news_count = base_query.filter(Item.type == "news").count()
    jobs_count = base_query.filter(Item.type == "job").count()
    email_count = base_query.filter(Item.type == "email").count()
    saved_count = base_query.filter(Item.is_favorite == True).count()

    high_match_jobs = (
        db.query(JobMeta)
        .join(Item)
        .filter(Item.is_archived == False, JobMeta.match_score >= 80)
        .count()
    )

    return HubStatsOut(
        total_items=total_items,
        unread_count=unread_count,
        telegram_count=telegram_count,
        news_count=news_count,
        jobs_count=jobs_count,
        email_count=email_count,
        high_match_jobs=high_match_jobs,
        saved_count=saved_count,
    )
