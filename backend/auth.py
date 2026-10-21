from fastapi import Header, HTTPException, status
from config import settings


def verify_app_token(authorization: str = Header(...)) -> bool:
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format. Expected 'Bearer <token>'.",
        )

    token = authorization.split(" ", 1)[1].strip()
    if token != settings.APP_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or expired APP_TOKEN.",
        )

    return True
