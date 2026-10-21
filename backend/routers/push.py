from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from database import get_db
from models import PushSubscription
from schemas import PushSubscriptionCreate
from auth import verify_app_token
from config import settings
from services.push import broadcast_push

router = APIRouter(prefix="/api/push", tags=["Push Notifications"], dependencies=[Depends(verify_app_token)])


@router.get("/vapid-public-key")
def get_vapid_public_key():
    return {"publicKey": settings.VAPID_PUBLIC_KEY}


@router.post("/subscribe")
def subscribe_push(payload: PushSubscriptionCreate, db: Session = Depends(get_db)):
    keys = payload.keys
    p256dh = keys.get("p256dh")
    auth = keys.get("auth")

    if not p256dh or not auth:
        raise HTTPException(status_code=400, detail="Missing required p256dh or auth key")

    sub = db.query(PushSubscription).filter(PushSubscription.endpoint == payload.endpoint).first()
    if not sub:
        sub = PushSubscription(
            endpoint=payload.endpoint,
            p256dh=p256dh,
            auth=auth,
        )
        db.add(sub)
    else:
        sub.p256dh = p256dh
        sub.auth = auth

    db.commit()
    return {"success": True}


@router.post("/unsubscribe")
def unsubscribe_push(endpoint: str = Body(..., embed=True), db: Session = Depends(get_db)):
    sub = db.query(PushSubscription).filter(PushSubscription.endpoint == endpoint).first()
    if sub:
        db.delete(sub)
        db.commit()
    return {"success": True}


@router.post("/test")
def test_push_notification(db: Session = Depends(get_db)):
    count = broadcast_push(
        db,
        title="هاب دانش و فرصت‌ها",
        body="اعلان تستی وب‌پوش با موفقیت دریافت شد! (Test push notification verified)",
        url="/",
    )
    return {
        "success": True,
        "message": f"اعلان برای {count} دستگاه فعال ارسال گردید." if count > 0 else "هیچ دستگاه فعالی ثبت نشده، اما سیستم پوش آماده است.",
    }
