from fastapi import APIRouter

from app.api import authentication, users

api_router = APIRouter()


@api_router.get("/health")
async def health() -> bool:
    return True


api_router.include_router(authentication.router)
api_router.include_router(users.router)
