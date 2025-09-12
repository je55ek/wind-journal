import datetime
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app import api
from app.core import db, security
from app.core.users import User


@pytest_asyncio.fixture(autouse=True)
async def session() -> AsyncGenerator[AsyncSession, None]:
    connection = await db.engine.connect()
    transaction = await connection.begin()
    session = AsyncSession(bind=connection, join_transaction_mode="create_savepoint")

    @asynccontextmanager
    async def mock_get_session():
        yield session

    gs = db.get_session
    db.get_session = mock_get_session

    yield session

    db.get_session = gs
    await session.close()
    await transaction.rollback()
    await connection.close()


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(
        transport=ASGITransport(app=api.app), base_url="http://testserver"
    ) as client:
        yield client


@pytest_asyncio.fixture
async def admin_user(session: AsyncSession) -> User:
    user = User(
        name="Admin",
        email="admin@test.com",
        hashed_password="fakehashedpassword",
        admin=True,
    )

    session.add(user)

    return user


@pytest_asyncio.fixture
async def user(session: AsyncSession) -> User:
    user = User(
        name="Test User", email="test@test.com", hashed_password="fakehashedpassword"
    )

    session.add(user)

    return user


@pytest.fixture
def user_token(user: User) -> str:
    return security.create_access_token(user.id, datetime.timedelta(minutes=30))
