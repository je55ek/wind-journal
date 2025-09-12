from typing import Annotated

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import config, db, users
from app.core.exceptions import DoesNotExist

_settings = config.settings()
_reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{_settings.API_V1_STR}#{_settings.LOGIN_ENDPOINT}"
)


async def get_db():
    async with db.get_session() as session:
        yield session


DatabaseSession = Annotated[AsyncSession, Depends(get_db)]


class TokenPayload(BaseModel):
    sub: str | None = None


async def get_current_user(
    session: DatabaseSession, token: Annotated[str, Depends(_reusable_oauth2)]
) -> users.User:
    try:
        return await users.get_from_token(session, token)
    except (InvalidTokenError, ValueError):
        raise HTTPException(status_code=401)
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")


CurrentUser = Annotated[users.User, Depends(get_current_user)]
