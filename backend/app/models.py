from sqlalchemy import Column, Float, Integer, String

from app.database import Base


class ShopModel(Base):
    __tablename__ = "shops"

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

