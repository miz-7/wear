from typing import Optional

from pydantic import BaseModel, ConfigDict


class Shop(BaseModel):
    id: Optional[int] = None
    name: str
    lat: float
    lng: float
    price: str
    genre: str
    image: Optional[str] = None
    comment: Optional[str] = None
    user_id: Optional[int] = None
    is_owner: bool = False
    likes_count: int = 0
    liked_by_me: bool = False

    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    model_config = ConfigDict(from_attributes=True)
