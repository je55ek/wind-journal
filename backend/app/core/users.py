import datetime
import uuid
from typing import Any

import sqlalchemy as sql
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column

from app.core import config, db, emails, security
from app.core.exceptions import AlreadyExists, DoesNotExist, Unauthorized


class User(sql.orm.MappedAsDataclass, db.Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(sql.String(255), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(sql.String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(sql.String, nullable=False)
    id: Mapped[uuid.UUID] = mapped_column(
        sql.Uuid, primary_key=True, default_factory=uuid.uuid4
    )
    admin: Mapped[bool] = mapped_column(sql.Boolean, nullable=False, default=False)


async def create(
    session: AsyncSession,
    current_user: User,
    *,
    name: str,
    email: str,
    password: str,
    admin: bool = False,
) -> User:
    if not current_user.admin:
        raise Unauthorized()

    user = User(
        name=name,
        email=email,
        hashed_password=security.hash_password(password),
        admin=admin,
    )
    try:
        session.add(user)
    except sql.exc.IntegrityError:
        raise AlreadyExists(f"User with email {email} already exists")

    return user


async def create_token(session: AsyncSession, email: str, password: str) -> str:
    row = (
        await session.execute(
            sql.select(User.id, User.hashed_password).where(User.email == email)
        )
    ).first()

    if not row:
        raise DoesNotExist()

    if not security.verify_password(password, row.hashed_password):
        raise Unauthorized()

    return security.create_access_token(
        row.id,
        datetime.timedelta(minutes=config.settings().ACCESS_TOKEN_EXPIRE_MINUTES),
    )


async def delete(session: AsyncSession, current_user: User, user_id: uuid.UUID) -> None:
    if not current_user.admin and not current_user.id == user_id:
        raise Unauthorized()

    try:
        await session.execute(sql.delete(User).where(User.id == user_id))
    except sql.exc.IntegrityError:
        raise DoesNotExist(f"User with ID {user_id} does not exist")


async def get_all(
    session: AsyncSession,
    current_user: User,
    cursor: str | None = None,
    count: int = 50,
) -> db.Page[User]:
    if not current_user.admin:
        raise Unauthorized()

    return await db.keyset_paginate(
        session, sql.select(User).order_by(User.id), count, cursor
    )


async def get_from_token(session: AsyncSession, token: str) -> User:
    user_id = uuid.UUID(security.decode_access_token(token))
    user = await session.scalar(sql.select(User).where(User.id == user_id))

    if not user:
        raise DoesNotExist()

    return user


async def get_one(
    session: AsyncSession, current_user: User, user_id: uuid.UUID
) -> User | None:
    if not current_user.admin and current_user.id != user_id:
        raise Unauthorized()

    return await session.scalar(sql.select(User).where(User.id == user_id))


async def request_password_reset(session: AsyncSession, email: str) -> None:
    exists = await session.scalar(
        sql.select(sql.exists(User).where(User.email == email))
    )

    if not exists:
        raise DoesNotExist()

    token = security.create_password_reset_token(email)
    email_data = emails.render_reset_password_email(email, token)
    await emails.send_email(email_data, email)


async def reset_password(session: AsyncSession, token: str, password: str) -> None:
    email = security.decode_password_reset_token(token)

    if not email:
        raise ValueError("Invalid token")

    result = await session.execute(
        sql.update(User)
        .where(User.email == email)
        .values(hashed_password=security.hash_password(password))
    )

    if result.rowcount == 0:
        raise DoesNotExist()


async def update(
    session: AsyncSession,
    current_user: User,
    user_id: uuid.UUID,
    values: dict[str, Any],
) -> User | None:
    if not current_user.admin or current_user.id != user_id:
        raise Unauthorized()

    return await session.scalar(
        sql.update(User).returning(User).where(User.id == user_id).values(**values)
    )
