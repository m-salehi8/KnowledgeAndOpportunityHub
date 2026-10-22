from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Any
from datetime import datetime


class JobMetaBase(BaseModel):
    company: str = ""
    location: str = "Remote"
    remote: bool = True
    salary_text: Optional[str] = None
    match_score: int = 0
    match_reason: str = ""
    status: str = "new"


class JobMetaOut(JobMetaBase):
    id: str
    item_id: str
    model_config = ConfigDict(from_attributes=True)


class ItemBase(BaseModel):
    type: str  # telegram, news, job, email
    title: str
    summary: str = ""
    content: str = ""
    source_url: Optional[str] = None
    source_name: str = ""
    category: str = "عمومی"
    is_read: bool = False
    is_favorite: bool = False
    is_archived: bool = False


class ItemCreate(ItemBase):
    tags: List[str] = []
    job_meta: Optional[JobMetaBase] = None
    raw_payload: Optional[dict] = None
    dedupe_hash: Optional[str] = None


class ItemUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    is_read: Optional[bool] = None
    is_favorite: Optional[bool] = None
    is_archived: Optional[bool] = None
    tags: Optional[List[str]] = None


class ItemOut(ItemBase):
    id: str
    created_at: datetime
    tags: List[str] = []
    job_meta: Optional[JobMetaOut] = None
    dedupe_hash: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ItemsListResponse(BaseModel):
    items: List[ItemOut]
    total: int
    has_more: bool


class JobStatusUpdate(BaseModel):
    status: str  # new, saved, applied, interview, rejected


class SourceBase(BaseModel):
    name: str
    url: str
    kind: str = "rss"  # rss, job_api, telegram_channel, newsletter
    enabled: bool = True


class SourceCreate(SourceBase):
    pass


class SourceUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    kind: Optional[str] = None
    enabled: Optional[bool] = None


class SourceOut(SourceBase):
    id: str
    last_fetched_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class ProfileBase(BaseModel):
    full_name: str = "محمد‌رضا حسینی"
    bio: str = ""
    skills: List[str] = []
    preferred_locations: List[str] = []
    remote_preference: str = "remote_only"
    min_salary_usd: int = 65000
    keywords_include: List[str] = []
    keywords_exclude: List[str] = []
    news_interests: List[str] = []


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    preferred_locations: Optional[List[str]] = None
    remote_preference: Optional[str] = None
    min_salary_usd: Optional[int] = None
    keywords_include: Optional[List[str]] = None
    keywords_exclude: Optional[List[str]] = None
    news_interests: Optional[List[str]] = None


class ProfileOut(ProfileBase):
    id: str
    model_config = ConfigDict(from_attributes=True)


class SettingsBase(BaseModel):
    notifications_enabled: bool = True
    news_digest_time: str = "07:30"
    job_radar_time: str = "08:00"
    min_job_score_notify: int = 80


class SettingsUpdate(BaseModel):
    notifications_enabled: Optional[bool] = None
    news_digest_time: Optional[str] = None
    job_radar_time: Optional[str] = None
    min_job_score_notify: Optional[int] = None


class SettingsOut(SettingsBase):
    model_config = ConfigDict(from_attributes=True)


class PushSubscriptionCreate(BaseModel):
    endpoint: str
    keys: dict = Field(..., description="Contains p256dh and auth keys")


class HubStatsOut(BaseModel):
    total_items: int
    unread_count: int
    telegram_count: int
    news_count: int
    jobs_count: int
    email_count: int
    high_match_jobs: int
    saved_count: int


# Webhook payloads
class EmailWebhookPayload(BaseModel):
    subject: Optional[str] = "No Subject"
    body: Optional[str] = ""
    from_address: Optional[str] = Field(None, alias="from")
    message_id: Optional[str] = None
    html: Optional[str] = None
    text: Optional[str] = None


# AI response schemas
class AIEnrichmentResult(BaseModel):
    title: str
    summary: str
    tags: List[str]
    category: str
    language: str = "fa"


class AIJobScoreResult(BaseModel):
    score: int = Field(..., ge=0, le=100)
    reason: str


class ProjectOut(BaseModel):
    id: str
    title: str
    short_desc: str = ""
    full_desc: str = ""
    category: str = "fullstack"
    status: str = "active"
    tech_stack: List[str] = []
    progress_percent: int = 70
    impact_score: int = 88
    ai_summary: str = ""
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    created_at: datetime
    is_favorite: bool = True
    stars_count: int = 0
    source_channel: Optional[str] = None
    telegram_sender: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
