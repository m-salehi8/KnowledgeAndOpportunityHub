import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    Integer,
    DateTime,
    ForeignKey,
    JSON,
    Table,
)
from sqlalchemy.orm import relationship
from database import Base

# Many-to-Many association between Items and Tags
item_tags = Table(
    "item_tags",
    Base.metadata,
    Column("item_id", String, ForeignKey("items.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", String, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class Item(Base):
    __tablename__ = "items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    type = Column(String(32), nullable=False, index=True)  # telegram, news, job, email
    title = Column(String(512), nullable=False)
    summary = Column(Text, nullable=False, default="")
    content = Column(Text, nullable=False, default="")
    source_url = Column(String(1024), nullable=True)
    source_name = Column(String(256), nullable=False, default="")
    category = Column(String(128), nullable=False, default="عمومی", index=True)
    is_read = Column(Boolean, default=False, index=True)
    is_favorite = Column(Boolean, default=False, index=True)
    is_archived = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    raw_payload = Column(JSON, nullable=True)
    dedupe_hash = Column(String(256), unique=True, index=True, nullable=True)

    # Relationships
    job_meta = relationship("JobMeta", uselist=False, back_populates="item", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary=item_tags, back_populates="items")


class JobMeta(Base):
    __tablename__ = "job_metas"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    item_id = Column(String, ForeignKey("items.id", ondelete="CASCADE"), unique=True, nullable=False)
    company = Column(String(256), nullable=False, default="")
    location = Column(String(256), nullable=False, default="Remote")
    remote = Column(Boolean, default=True)
    salary_text = Column(String(256), nullable=True)
    match_score = Column(Integer, default=0, index=True)  # 0 - 100
    match_reason = Column(Text, default="")
    status = Column(String(32), default="new", index=True)  # new, saved, applied, interview, rejected

    item = relationship("Item", back_populates="job_meta")


class Tag(Base):
    __tablename__ = "tags"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(128), unique=True, index=True, nullable=False)

    items = relationship("Item", secondary=item_tags, back_populates="tags")


class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(128), unique=True, index=True, nullable=False)


class PushSubscription(Base):
    __tablename__ = "push_subscriptions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    endpoint = Column(String(1024), unique=True, nullable=False)
    p256dh = Column(String(256), nullable=False)
    auth = Column(String(128), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Source(Base):
    __tablename__ = "sources"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(256), nullable=False)
    url = Column(String(1024), nullable=False)
    kind = Column(String(64), nullable=False, default="rss")  # rss, job_api, telegram_channel, newsletter
    enabled = Column(Boolean, default=True)
    last_fetched_at = Column(DateTime, nullable=True)


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String, primary_key=True, default="singleton_profile")
    full_name = Column(String(256), default="محمد‌رضا حسینی")
    bio = Column(Text, default="")
    skills = Column(JSON, default=list)
    preferred_locations = Column(JSON, default=list)
    remote_preference = Column(String(32), default="remote_only")
    min_salary_usd = Column(Integer, default=65000)
    keywords_include = Column(JSON, default=list)
    keywords_exclude = Column(JSON, default=list)
    news_interests = Column(JSON, default=list)


class AppSettingsModel(Base):
    __tablename__ = "app_settings"

    id = Column(String, primary_key=True, default="singleton_settings")
    notifications_enabled = Column(Boolean, default=True)
    news_digest_time = Column(String(16), default="07:30")
    job_radar_time = Column(String(16), default="08:00")
    min_job_score_notify = Column(Integer, default=80)
