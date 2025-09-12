from dataclasses import dataclass

from pydantic import BaseModel
from sqlakeyset.asyncio import select_page
from sqlalchemy import Select
from sqlalchemy.ext.asyncio import (
    AsyncAttrs,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

engine = create_async_engine(str(settings().SQLALCHEMY_DATABASE_URI))
get_session = async_sessionmaker(engine, expire_on_commit=False)


class Base(AsyncAttrs, DeclarativeBase):
    pass


@dataclass
class Page[T](BaseModel):
    items: list[T]
    after: str | None
    before: str | None


async def keyset_paginate[T](
    session: AsyncSession,
    selectable: Select[tuple[T]],
    page_size: int,
    cursor: str | None = None,
) -> Page[T]:
    page = await select_page(session, selectable, per_page=page_size, page=cursor)
    return Page(
        items=[row[0] for row in page],  # type: ignore
        after=page.paging.bookmark_next if page.paging.has_next else None,
        before=page.paging.bookmark_previous if page.paging.has_previous else None,
    )
