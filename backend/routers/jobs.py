from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from database import get_db
from models import Item, JobMeta
from schemas import ItemOut, JobStatusUpdate
from auth import verify_app_token
from services.scraper import run_news_digest_job, run_job_radar_job

router = APIRouter(prefix="/api/jobs", tags=["Jobs"], dependencies=[Depends(verify_app_token)])


@router.patch("/{id}/status", response_model=ItemOut)
def update_job_status(id: str, payload: JobStatusUpdate, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == id).first()
    if not item or not item.job_meta:
        raise HTTPException(status_code=404, detail="Job item not found")

    valid_statuses = ["new", "saved", "applied", "interview", "rejected"]
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    item.job_meta.status = payload.status
    db.commit()
    db.refresh(item)

    return ItemOut(
        id=item.id,
        type=item.type,
        title=item.title,
        summary=item.summary,
        content=item.content,
        source_url=item.source_url,
        source_name=item.source_name,
        category=item.category,
        is_read=item.is_read,
        is_favorite=item.is_favorite,
        is_archived=item.is_archived,
        created_at=item.created_at,
        tags=[t.name for t in item.tags],
        job_meta=item.job_meta,
        dedupe_hash=item.dedupe_hash,
    )


@router.post("/run/{job_type}")
async def trigger_job_run(job_type: str = Path(..., regex="^(news|jobs)$")):
    if job_type == "news":
        count = await run_news_digest_job()
        return {
            "new_items": count,
            "summary": f"{count} خبر تحلیلی جدید واکشی و ذخیره گردید."
        }
    else:
        count = await run_job_radar_job()
        return {
            "new_items": count,
            "summary": f"{count} موقعیت شغلی متناسب توسط هوش مصنوعی ارزیابی و ثبت شد."
        }
