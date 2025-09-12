import uuid
from typing import Annotated, Any

import pydantic as pyd
from fastapi import APIRouter, HTTPException, Query

from app.api.deps import CurrentUser, DatabaseSession
from app.api.models import PageParams
from app.core import db, users
from app.core.exceptions import AlreadyExists

router = APIRouter(prefix="/users", tags=["users"])


class UserCreate(pyd.BaseModel):
    email: pyd.EmailStr = pyd.Field(max_length=255)
    name: str = pyd.Field(max_length=255)
    password: str = pyd.Field(min_length=8, max_length=40)


class UserPublic(pyd.BaseModel):
    model_config = pyd.ConfigDict(from_attributes=True)

    email: pyd.EmailStr
    id: uuid.UUID
    name: str


class UserUpdate(pyd.BaseModel):
    email: pyd.EmailStr | None = pyd.Field(default=None, max_length=255)
    name: str | None = pyd.Field(default=None, max_length=255)
    password: str | None = pyd.Field(default=None, min_length=8, max_length=40)


@router.get("/")
async def get_users(
    session: DatabaseSession,
    current_user: CurrentUser,
    page_params: Annotated[PageParams, Query()],
) -> db.Page[UserPublic]:
    """
    Paginate through all users.

    Accessible only to administrators.
    """
    page = await users.get_all(
        session, current_user, page_params.cursor, page_params.count
    )
    return db.Page(
        items=[UserPublic.model_validate(user) for user in page.items],
        after=page.after,
        before=page.before,
    )


@router.post("/")
async def create_user(
    session: DatabaseSession, current_user: CurrentUser, body: UserCreate
) -> UserPublic:
    """
    Create a new user.

    Accessible only to administrators.
    """
    try:
        user = await users.create(session, current_user, **body.model_dump())
        return UserPublic.model_validate(user)
    except AlreadyExists as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me", response_model=UserPublic)
def get_me(current_user: CurrentUser) -> Any:
    """
    Return the currently authenticated user.
    """
    return current_user


@router.get("/{user_id}")
async def get_user(
    session: DatabaseSession, current_user: CurrentUser, user_id: uuid.UUID
) -> UserPublic:
    """
    Get a user by their ID.
    """
    user = await users.get_one(session, current_user, user_id)
    return UserPublic.model_validate(user)


@router.patch("/{user_id}")
async def update_user(
    session: DatabaseSession,
    current_user: CurrentUser,
    user_id: uuid.UUID,
    body: UserUpdate,
) -> UserPublic:
    """
    Update a user.
    """
    user = await users.update(session, current_user, user_id, body.model_dump())

    if not user:
        raise HTTPException(status_code=404)

    return UserPublic.model_validate(user)


@router.delete("/{user_id}")
async def delete_user(
    session: DatabaseSession, current_user: CurrentUser, user_id: uuid.UUID
) -> None:
    """
    Delete a user.
    """
    await users.delete(session, current_user, user_id)
