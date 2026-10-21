from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Profile
from schemas import ProfileOut, ProfileUpdate
from auth import verify_app_token

router = APIRouter(prefix="/api/profile", tags=["Profile"], dependencies=[Depends(verify_app_token)])


@router.get("", response_model=ProfileOut)
def get_profile(db: Session = Depends(get_db)):
    prof = db.query(Profile).filter(Profile.id == "singleton_profile").first()
    if not prof:
        prof = Profile(
            id="singleton_profile",
            full_name="محمد‌رضا حسینی",
            bio="مهندس ارشد نرم‌افزار، علاقه‌مند به هوش مصنوعی مولد و سیستم‌های توزیع‌شده.",
            skills=["Python", "FastAPI", "React", "TypeScript", "PostgreSQL", "Docker"],
            preferred_locations=["Remote", "Tehran", "Europe (Remote)"],
            remote_preference="remote_only",
            min_salary_usd=65000,
            keywords_include=["Senior", "Staff", "Lead", "AI"],
            keywords_exclude=["Junior", "Wordpress"],
            news_interests=["AI", "System Architecture", "Web Development"],
        )
        db.add(prof)
        db.commit()
        db.refresh(prof)
    return prof


@router.put("", response_model=ProfileOut)
def update_profile(updates: ProfileUpdate, db: Session = Depends(get_db)):
    prof = db.query(Profile).filter(Profile.id == "singleton_profile").first()
    if not prof:
        prof = Profile(id="singleton_profile")
        db.add(prof)

    if updates.full_name is not None:
        prof.full_name = updates.full_name
    if updates.bio is not None:
        prof.bio = updates.bio
    if updates.skills is not None:
        prof.skills = updates.skills
    if updates.preferred_locations is not None:
        prof.preferred_locations = updates.preferred_locations
    if updates.remote_preference is not None:
        prof.remote_preference = updates.remote_preference
    if updates.min_salary_usd is not None:
        prof.min_salary_usd = updates.min_salary_usd
    if updates.keywords_include is not None:
        prof.keywords_include = updates.keywords_include
    if updates.keywords_exclude is not None:
        prof.keywords_exclude = updates.keywords_exclude
    if updates.news_interests is not None:
        prof.news_interests = updates.news_interests

    db.commit()
    db.refresh(prof)
    return prof
