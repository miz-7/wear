from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ShopModel
from app.schemas import Shop

router = APIRouter(prefix="/shops", tags=["shops"])


@router.get("", response_model=List[Shop])
def get_shops(db: Session = Depends(get_db)):
    return db.query(ShopModel).all()


@router.post("")
def add_shop(shop: Shop, db: Session = Depends(get_db)):
    new_shop = ShopModel(
        name=shop.name,
        lat=shop.lat,
        lng=shop.lng,
        price=shop.price,
        genre=shop.genre,
        image=shop.image,
        comment=shop.comment,
    )
    db.add(new_shop)
    db.commit()
    db.refresh(new_shop)
    return {"message": "DBに保存成功！"}
