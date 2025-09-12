from datetime import UTC, datetime, timedelta
from typing import Any

import jwt
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext

from app.core import config

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


ALGORITHM = "HS256"


def create_access_token(subject: Any, expires_delta: timedelta) -> str:
    expire = datetime.now(UTC) + expires_delta
    to_encode: dict[str, Any] = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(
        to_encode, config.settings().SECRET_KEY, algorithm=ALGORITHM
    )
    return encoded_jwt


def create_password_reset_token(sub: str) -> str:
    settings = config.settings()
    now = datetime.now(UTC)
    expires = now + timedelta(hours=settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS)
    payload: dict[str, Any] = {"exp": expires.timestamp(), "nbf": now, "sub": sub}
    secret: str = settings.SECRET_KEY
    algo: str = ALGORITHM
    a: str = jwt.encode(payload, secret, algorithm=algo)
    return a


def decode_access_token(token: str) -> Any | None:
    payload = jwt.decode(token, config.settings().SECRET_KEY, algorithms=[ALGORITHM])
    return payload.get("sub")


def decode_password_reset_token(token: str) -> str | None:
    settings = config.settings()
    try:
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return str(decoded_token["sub"])
    except InvalidTokenError:
        return None


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
