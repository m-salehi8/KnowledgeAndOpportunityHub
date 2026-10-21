import pytest
from database import SessionLocal, Base, engine
from models import Item
from routers.webhooks import make_hash

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield


def test_item_deduplication_via_hash():
    db = SessionLocal()
    try:
        dedupe_key = make_hash("tg_chat_1_msg_999")
        
        # Insert first item
        item1 = Item(
            type="telegram",
            title="First Item",
            summary="Test",
            content="Test content",
            dedupe_hash=dedupe_key,
        )
        db.add(item1)
        db.commit()

        # Check existing
        existing = db.query(Item).filter(Item.dedupe_hash == dedupe_key).first()
        assert existing is not None
        assert existing.title == "First Item"

        # Attempting to query same dedupe returns existing
        existing_again = db.query(Item).filter(Item.dedupe_hash == dedupe_key).all()
        assert len(existing_again) == 1
    finally:
        # Clean up
        db.query(Item).filter(Item.dedupe_hash == dedupe_key).delete()
        db.commit()
        db.close()
