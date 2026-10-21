from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Source
from schemas import SourceCreate, SourceUpdate, SourceOut
from auth import verify_app_token

router = APIRouter(prefix="/api/sources", tags=["Sources"], dependencies=[Depends(verify_app_token)])


@router.get("", response_model=List[SourceOut])
def list_sources(db: Session = Depends(get_db)):
    return db.query(Source).all()


@router.post("", response_model=SourceOut)
def create_source(payload: SourceCreate, db: Session = Depends(get_db)):
    new_src = Source(
        name=payload.name,
        url=payload.url,
        kind=payload.kind,
        enabled=payload.enabled,
    )
    db.add(new_src)
    db.commit()
    db.refresh(new_src)
    return new_src


@router.put("/{id}", response_model=SourceOut)
def update_source(id: str, updates: SourceUpdate, db: Session = Depends(get_db)):
    src = db.query(Source).filter(Source.id == id).first()
    if not src:
        raise HTTPException(status_code=404, detail="Source not found")

    if updates.name is not None:
        src.name = updates.name
    if updates.url is not None:
        src.url = updates.url
    if updates.kind is not None:
        src.kind = updates.kind
    if updates.enabled is not None:
        src.enabled = updates.enabled

    db.commit()
    db.refresh(src)
    return src


@router.delete("/{id}")
def delete_source(id: str, db: Session = Depends(get_db)):
    src = db.query(Source).filter(Source.id == id).first()
    if not src:
        raise HTTPException(status_code=404, detail="Source not found")
    db.delete(src)
    db.commit()
    return {"ok": True}
