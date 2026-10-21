import pytest
from fastapi.testclient import TestClient
from database import Base, engine, SessionLocal
from main import app
from config import settings
from models import PushSubscription

client = TestClient(app)
AUTH_HEADERS = {"Authorization": f"Bearer {settings.APP_TOKEN}"}


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield


def test_get_vapid_public_key():
    resp = client.get("/api/push/vapid-public-key", headers=AUTH_HEADERS)
    assert resp.status_code == 200
    assert "publicKey" in resp.json()
    assert len(resp.json()["publicKey"]) > 20


def test_push_subscription_lifecycle():
    endpoint = "https://fcm.googleapis.com/fcm/send/test-token-12345"
    payload = {
        "endpoint": endpoint,
        "keys": {
            "p256dh": "dummy-p256dh-key",
            "auth": "dummy-auth-key",
        },
    }

    # Subscribe
    sub_resp = client.post("/api/push/subscribe", json=payload, headers=AUTH_HEADERS)
    assert sub_resp.status_code == 200
    assert sub_resp.json().get("success") is True

    # Test Broadcast
    test_resp = client.post("/api/push/test", headers=AUTH_HEADERS)
    assert test_resp.status_code == 200
    assert test_resp.json().get("success") is True

    # Unsubscribe
    unsub_resp = client.post(
        "/api/push/unsubscribe",
        json={"endpoint": endpoint},
        headers=AUTH_HEADERS,
    )
    assert unsub_resp.status_code == 200
    assert unsub_resp.json().get("success") is True
