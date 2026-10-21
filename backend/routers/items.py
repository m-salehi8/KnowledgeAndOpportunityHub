from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import get_db
from models import Item, JobMeta, Tag, Category
from schemas import ItemOut, ItemsListResponse, ItemUpdate
from auth import verify_app_token
from services.enrichment import enrich_item_background

router = APIRouter(prefix="/api/items", tags=["Items"], dependencies=[Depends(verify_app_token)])


@router.get("", response_model=ItemsListResponse)
def list_items(
    type: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    is_favorite: Optional[bool] = Query(None),
    is_read: Optional[bool] = Query(None),
    is_archived: Optional[bool] = Query(None),
    min_score: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(Item)

    if type and type != "all":
        query = query.filter(Item.type == type)

    if category:
        query = query.filter(Item.category == category)

    if tag:
        query = query.filter(Item.tags.any(Tag.name.ilike(tag)))

    if is_favorite is not None:
        query = query.filter(Item.is_favorite == is_favorite)

    if is_read is not None:
        query = query.filter(Item.is_read == is_read)

    if is_archived is not None:
        query = query.filter(Item.is_archived == is_archived)

    if min_score is not None:
        query = query.join(Item.job_meta).filter(JobMeta.match_score >= min_score)

    if status and status != "all":
        query = query.join(Item.job_meta).filter(JobMeta.status == status)

    if q and q.strip():
        search_term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Item.title.ilike(search_term),
                Item.summary.ilike(search_term),
                Item.content.ilike(search_term),
                Item.source_name.ilike(search_term),
            )
        )

    total = query.count()
    items = query.order_by(Item.created_at.desc()).offset(offset).limit(limit).all()

    # Serialize tags into plain string list
    item_outs = []
    for it in items:
        out = ItemOut(
            id=it.id,
            type=it.type,
            title=it.title,
            summary=it.summary,
            content=it.content,
            source_url=it.source_url,
            source_name=it.source_name,
            category=it.category,
            is_read=it.is_read,
            is_favorite=it.is_favorite,
            is_archived=it.is_archived,
            created_at=it.created_at,
            tags=[t.name for t in it.tags],
            job_meta=it.job_meta,
            dedupe_hash=it.dedupe_hash,
        )
        item_outs.append(out)

    return ItemsListResponse(
        items=item_outs,
        total=total,
        has_more=offset + limit < total,
    )


@router.get("/{id}", response_model=ItemOut)
def get_item(id: str, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

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


@router.patch("/{id}", response_model=ItemOut)
def patch_item(id: str, updates: ItemUpdate, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if updates.title is not None:
        item.title = updates.title
    if updates.summary is not None:
        item.summary = updates.summary
    if updates.content is not None:
        item.content = updates.content
    if updates.category is not None:
        item.category = updates.category
    if updates.is_read is not None:
        item.is_read = updates.is_read
    if updates.is_favorite is not None:
        item.is_favorite = updates.is_favorite
    if updates.is_archived is not None:
        item.is_archived = updates.is_archived

    if updates.tags is not None:
        item.tags.clear()
        for tag_name in updates.tags:
            tag_name_clean = tag_name.strip().replace("#", "")
            if tag_name_clean:
                tag_obj = db.query(Tag).filter(Tag.name == tag_name_clean).first()
                if not tag_obj:
                    tag_obj = Tag(name=tag_name_clean)
                    db.add(tag_obj)
                item.tags.append(tag_obj)

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


@router.delete("/{id}")
def delete_item(id: str, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"ok": True}


@router.post("/{id}/reenrich", response_model=ItemOut)
async def reenrich_item(id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    await enrich_item_background(item.id, None)
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
