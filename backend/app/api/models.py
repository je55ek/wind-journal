from pydantic import BaseModel


class Message(BaseModel):
    message: str


class PageParams(BaseModel):
    count: int
    cursor: str | None
