from typing import Optional

from pydantic import BaseModel, ConfigDict


class Shop(BaseModel):
    name: str
    lat: float
    lng: float
    price: str
    genre: str
    image: Optional[str] = None
    comment: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
