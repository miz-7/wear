from sqlalchemy import Column, Integer, String, Float, ForeignKey, UniqueConstraint

from app.database import Base



class ShopModel(Base):
    __tablename__ = "shops"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    price = Column(String)
    genre = Column(String)
    image = Column(String, nullable=True)
    comment = Column(String, nullable=True)

class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

class ShopLikeModel(Base):
    __tablename__ = "shop_likes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    shop_id = Column(Integer, ForeignKey("shops.id"), nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "shop_id", name="unique_user_shop_like"),
    )

