from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ShopLikeModel, ShopModel, UserModel
from app.routers.auth import get_current_user
from app.schemas import Shop
from app.security import decode_access_token

router = APIRouter(prefix="/shops", tags=["shops"])


def get_optional_user(request: Request, db: Session):
    token = request.cookies.get("access_token")

    if token is None:
        return None

    user_id = decode_access_token(token)

    if user_id is None:
        return None

    return db.query(UserModel).filter(UserModel.id == user_id).first()


@router.get("", response_model=List[Shop])
def get_shops(request: Request, db: Session = Depends(get_db)):
    current_user = get_optional_user(request, db)

    shops = db.query(ShopModel).all()
    result = []

    for shop in shops:
        likes_count = (
            db.query(ShopLikeModel)
            .filter(ShopLikeModel.shop_id == shop.id)
            .count()
        )

        liked_by_me = False

        if current_user:
            liked_by_me = (
                db.query(ShopLikeModel)
                .filter(
                    ShopLikeModel.shop_id == shop.id,
                    ShopLikeModel.user_id == current_user.id,
                )
                .first()
                is not None
            )

        result.append({
            "id": shop.id,
            "name": shop.name,
            "lat": shop.lat,
            "lng": shop.lng,
            "price": shop.price,
            "genre": shop.genre,
            "image": shop.image,
            "comment": shop.comment,
            "user_id": shop.user_id,
            "is_owner": bool(current_user and shop.user_id == current_user.id),
            "likes_count": likes_count,
            "liked_by_me": liked_by_me,
        })

    return result


@router.post("")
def add_shop(
    shop: Shop,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_shop = ShopModel(
        name=shop.name,
        lat=shop.lat,
        lng=shop.lng,
        price=shop.price,
        genre=shop.genre,
        image=shop.image,
        comment=shop.comment,
        user_id=current_user.id,
    )

    db.add(new_shop)
    db.commit()
    db.refresh(new_shop)

    return {
        "id": new_shop.id,
        "name": new_shop.name,
        "lat": new_shop.lat,
        "lng": new_shop.lng,
        "price": new_shop.price,
        "genre": new_shop.genre,
        "image": new_shop.image,
        "comment": new_shop.comment,
        "user_id": new_shop.user_id,
        "is_owner": True,
        "likes_count": 0,
        "liked_by_me": False,
    }


@router.post("/{shop_id}/like")
def toggle_like_shop(
    shop_id: int,
    request: Request,
    db: Session = Depends(get_db),
):
    current_user = get_optional_user(request, db)

    if current_user is None:
        raise HTTPException(status_code=401, detail="ログインしてください")

    shop = db.query(ShopModel).filter(ShopModel.id == shop_id).first()

    if shop is None:
        raise HTTPException(status_code=404, detail="お店が見つかりません")

    existing_like = (
        db.query(ShopLikeModel)
        .filter(
            ShopLikeModel.shop_id == shop_id,
            ShopLikeModel.user_id == current_user.id,
        )
        .first()
    )

    if existing_like:
        db.delete(existing_like)
        liked_by_me = False
    else:
        new_like = ShopLikeModel(
            shop_id=shop_id,
            user_id=current_user.id,
        )
        db.add(new_like)
        liked_by_me = True

    db.commit()

    likes_count = (
        db.query(ShopLikeModel)
        .filter(ShopLikeModel.shop_id == shop_id)
        .count()
    )

    return {
        "shop_id": shop_id,
        "likes_count": likes_count,
        "liked_by_me": liked_by_me,
    }


@router.delete("/{shop_id}")
def delete_shop(
        shop_id: int,
        current_user: UserModel = Depends(get_current_user),
        db: Session = Depends(get_db),
    ):
        shop = db.query(ShopModel).filter(ShopModel.id == shop_id).first()

        if shop is None:
            raise HTTPException(status_code=404, detail="お店が見つかりません")

        if shop.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="自分の投稿だけ削除できます")

        db.query(ShopLikeModel).filter(ShopLikeModel.shop_id == shop_id).delete()
        db.delete(shop)
        db.commit()

        return {
            "message": "削除しました",
            "shop_id": shop_id,
        }