import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from database import Base, engine, SessionLocal
from main import app
from config import settings

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield


def test_telegram_webhook_invalid_secret_rejected():
    payload = {"message": {"message_id": 123, "chat": {"id": 999}, "text": "hello"}}
    resp = client.post(
        "/webhooks/telegram",
        json=payload,
        headers={"X-Telegram-Bot-Api-Secret-Token": "wrong_secret"},
    )
    assert resp.status_code == 403


def test_telegram_webhook_valid_message_enqueued():
    payload = {
        "message": {
            "message_id": 99881,
            "chat": {"id": 12345},
            "from": {"id": settings.TELEGRAM_OWNER_ID or 12345, "username": "testuser"},
            "text": "Check this new repo: https://github.com/fastapi/fastapi",
        }
    }

    with patch("services.enrichment.enrich_item_background") as mock_enrich:
        resp = client.post(
            "/webhooks/telegram",
            json=payload,
            headers={"X-Telegram-Bot-Api-Secret-Token": settings.TELEGRAM_WEBHOOK_SECRET},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("ok") is True
        assert data.get("status") in ["queued_for_enrichment", "already_exists"]
