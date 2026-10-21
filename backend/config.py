from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_TOKEN: str = "hub_usr_sec_99384721"
    DATABASE_URL: str = "sqlite:///./hub.db"

    # AI
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # Telegram
    TELEGRAM_BOT_TOKEN: Optional[str] = None
    TELEGRAM_OWNER_ID: Optional[int] = None
    TELEGRAM_WEBHOOK_SECRET: str = "tg_secret_token_123"

    # Inbound Email
    EMAIL_WEBHOOK_SECRET: str = "email_secret_token_123"

    # Web Push (VAPID)
    VAPID_PUBLIC_KEY: str = "BOtRPnCylgx30jh1_ZYMU3Amh-5Xv9B3BfoDwXiiNd5Feg3EREsbcGJwFTxY2Xo2eXb3uAgoYgGbrtMVoIqCRJU"
    VAPID_PRIVATE_KEY: Optional[str] = "Dx9WmasysDLY2ewW2yW0rR9ETllv2weXl6BEYXcR-Xk"
    VAPID_CLAIMS_EMAIL: str = "mailto:job.msalehi@gmail.com"

    # Scheduling
    NEWS_DIGEST_TIME: str = "07:30"
    JOB_RADAR_TIME: str = "08:00"
    PRODUCT_HUNT_TIME: str = "08:30"
    MIN_JOB_SCORE_NOTIFY: int = 80


settings = Settings()
