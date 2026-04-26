from fastapi import FastAPI, File, UploadFile, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import shutil
from typing import Optional, List

# --- DB用の設定を追加 ---
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# 1. DBファイルの場所を指定 (sqlite)
SQLALCHEMY_DATABASE_URL = "sqlite:///./shops.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 2. テーブルの設計図 (DBの構造)
class ShopModel(Base):
    __tablename__ = "shops"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    price = Column(String)
    genre = Column(String)
    image = Column(String, nullable=True)

# 3. 実際にDBファイルを作成する
Base.metadata.create_all(bind=engine)

# DBセッションを取得するための関数
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# -----------------------

app = FastAPI()

# 既存の静的ファイル設定
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydanticモデル (Reactとのやり取り用)
class Shop(BaseModel):
    name: str
    lat: float
    lng: float
    price: str
    genre: str
    image: Optional[str] = None

    class Config:
        orm_mode = True

# --- エンドポイントの修正 ---

@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"url": f"/uploads/{file.filename}"}

@app.get("/shops", response_model=List[Shop])
def get_shops(db: Session = Depends(get_db)):
    # JSONの代わりにDBから全件取得する
    return db.query(ShopModel).all()

@app.post("/shops")
def add_shop(shop: Shop, db: Session = Depends(get_db)):
    # JSONへの書き込みの代わりに、DBへ保存する
    new_shop = ShopModel(
        name=shop.name,
        lat=shop.lat,
        lng=shop.lng,
        price=shop.price,
        genre=shop.genre,
        image=shop.image
    )
    db.add(new_shop)
    db.commit()
    db.refresh(new_shop)
    return {"message": "DBに保存成功！"}