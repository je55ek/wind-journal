from fastapi import FastAPI, HTTPException, Request
from fastapi.routing import APIRoute
from starlette.middleware.cors import CORSMiddleware

from app.api.routes import api_router
from app.core import config
from app.core.exceptions import Unauthorized


def custom_generate_unique_id(route: APIRoute) -> str:
    match route.tags:
        case [first_tag, *_]:
            return f"{first_tag}-{route.name}"
        case _:
            return route.name


_settings = config.settings()


app = FastAPI(
    title=_settings.PROJECT_NAME,
    openapi_url=f"{_settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
)


@app.exception_handler(Unauthorized)
async def unauthorized_exception_handler(_: Request, __: Unauthorized):
    return HTTPException(status_code=403)


if _settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=_settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


app.include_router(api_router, prefix=_settings.API_V1_STR)
