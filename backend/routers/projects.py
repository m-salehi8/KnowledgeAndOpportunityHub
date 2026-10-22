from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth import verify_app_token
from database import get_db
from models import Project
from schemas import ProjectOut

router = APIRouter(prefix="/api/projects", tags=["Projects"], dependencies=[Depends(verify_app_token)])


@router.get("", response_model=List[ProjectOut])
def list_projects(db: Session = Depends(get_db)):
    return db.query(Project).order_by(Project.created_at.desc()).all()
