import json
import logging
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from pywebpush import webpush, WebPushException
from config import settings
from models import PushSubscription

logger = logging.getLogger(__name__)


def send_web_push(subscription: PushSubscription, payload: Dict[str, Any]) -> bool:
    if not settings.VAPID_PRIVATE_KEY:
        logger.info("VAPID_PRIVATE_KEY not configured, simulating push delivery.")
        return True

    subscription_info = {
        "endpoint": subscription.endpoint,
        "keys": {
            "p256dh": subscription.p256dh,
            "auth": subscription.auth,
        },
    }

    try:
        webpush(
            subscription_info=subscription_info,
            data=json.dumps(payload),
            vapid_private_key=settings.VAPID_PRIVATE_KEY,
            vapid_claims={"sub": settings.VAPID_CLAIMS_EMAIL},
        )
        return True
    except WebPushException as ex:
        logger.error(f"WebPush failed for {subscription.endpoint}: {ex}")
        # If subscription expired (404/410), caller can clean it up
        return False


def broadcast_push(db: Session, title: str, body: str, url: str = "/") -> int:
    subscriptions = db.query(PushSubscription).all()
    if not subscriptions:
        logger.info("No active push subscriptions found.")
        return 0

    payload = {
        "title": title,
        "body": body,
        "url": url,
        "icon": "/pwa-192x192.png",
        "badge": "/pwa-192x192.png",
    }

    successful = 0
    stale_ids = []

    for sub in subscriptions:
        success = send_web_push(sub, payload)
        if success:
            successful += 1
        else:
            stale_ids.append(sub.id)

    # Clean up stale/unregistered push subscriptions
    if stale_ids:
        db.query(PushSubscription).filter(PushSubscription.id.in_(stale_ids)).delete(synchronize_session=False)
        db.commit()

    return successful
