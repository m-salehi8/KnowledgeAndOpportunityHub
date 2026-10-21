from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import AppSettingsModel
from schemas import SettingsOut, SettingsUpdate
from auth import verify_app_token

router = APIRouter(prefix="/api/settings", tags=["Settings"], dependencies=[Depends(verify_app_token)])


@router.get("", response_model=SettingsOut)
def get_settings(db: Session = Depends(get_db)):
    st = db.query(AppSettingsModel).filter(AppSettingsModel.id == "singleton_settings").first()
    if not st:
        st = AppSettingsModel(
            id="singleton_settings",
            notifications_enabled=True,
            news_digest_time="07:30",
            job_radar_time="08:00",
            min_job_score_notify=80,
        )
        db.add(st)
        db.commit()
        db.refresh(st)
    return st


@router.put("", response_model=SettingsOut)
def update_settings(updates: SettingsUpdate, db: Session = Depends(get_db)):
    st = db.query(AppSettingsModel).filter(AppSettingsModel.id == "singleton_settings").first()
    if not st:
        st = AppSettingsModel(id="singleton_settings")
        db.add(st)

    if updates.notifications_enabled is not None:
        st.notifications_enabled = updates.notifications_enabled
    if updates.news_digest_time is not None:
        st.news_digest_time = updates.news_digest_time
    if updates.job_radar_time is not None:
        st.job_radar_time = updates.job_radar_time
    if updates.min_job_score_notify is not None:
        st.min_job_score_notify = updates.min_job_score_notify

    db.commit()
    db.refresh(st)
    return st
