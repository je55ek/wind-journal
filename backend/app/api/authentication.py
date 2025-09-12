from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, Field

from app.api.deps import DatabaseSession
from app.api.models import Message
from app.core import config, users
from app.core.exceptions import DoesNotExist, Unauthorized

router = APIRouter(tags=["authentication"])
settings = config.settings()


class ResetPassword(BaseModel):
    token: str
    password: str = Field(min_length=8, max_length=40)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post(settings.LOGIN_ENDPOINT)
async def login(
    session: DatabaseSession, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> Token:
    """
    Exchange a username and password for an access token.
    """
    try:
        access_token = await users.create_token(
            session, email=form_data.username, password=form_data.password
        )
        return Token(access_token=access_token)
    except (DoesNotExist, Unauthorized):
        raise HTTPException(
            status_code=401,
            detail=f"User {form_data.username} with specified password does not exist",
        )


@router.post("/password-recovery/{email}")
async def recover_password(session: DatabaseSession, email: str) -> Message:
    """
    Send an email to reset a forgotten password.

    If there is no user with the specified email, then this is a no-op and no error is returned.
    """
    try:
        await users.request_password_reset(session, email)
    except DoesNotExist:
        pass

    return Message(
        message=f"An email has been sent to #{email} if a user exists for that email address"
    )


@router.post(settings.PASSWORD_RESET_ENDPOINT)
async def reset_password(session: DatabaseSession, body: ResetPassword) -> Message:
    """
    Reset a user's password.
    """
    try:
        await users.reset_password(session, body.token, body.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="User does not exist")

    return Message(message="Password updated successfully")
