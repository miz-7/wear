from fastapi import FastAPI, File, UploadFile, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import shutil
from typing import Optional, List

# --- DB用の設定セクション ---
# SQLAlchemy: PythonでSQLを直感的に扱うためのライブラリ
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# 1. データベースへの接続設定
# sqlite:///./shops.db は「カレントディレクトリの shops.db というファイルを使う」という意味
SQLALCHEMY_DATABASE_URL = "sqlite:///./shops.db"

# Engine: データベースへの接続を管理する中心的なオブジェクト
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

# SessionLocal: データベースとの「対話窓口（セッション）」を作るためのクラス
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base: 全てのテーブルモデルが継承する基底クラス（これを使ってテーブルを定義する）
Base = declarative_base()

# 2. テーブルの設計図 (ORモデル)
# このクラスがそのままデータベースの「shops」テーブルになる
class ShopModel(Base):
    __tablename__ = "shops" # 実際のテーブル名
    
    # 各カラム（列）の定義
    id = Column(Integer, primary_key=True, index=True) # 自動採番されるID
    name = Column(String)    # 店名
    lat = Column(Float)     # 緯度
    lng = Column(Float)     # 経度
    price = Column(String)  # 価格帯
    genre = Column(String)  # ジャンル（ヴィンテージ、レギュラーなど）
    image = Column(String, nullable=True) # 画像パス（空でもOK）

# 3. データベースファイルの生成
# コード実行時に「shops.db」がなければ、上記設計図（Base）を元に自動作成する
Base.metadata.create_all(bind=engine)

# 依存注入（Dependency Injection）用の関数
# APIが呼び出されるたびにDB接続を開き、終わったら自動で閉じる仕組み
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# -----------------------

app = FastAPI()

# --- 静的ファイル（画像）の設定 ---
# アップロードされた画像をブラウザから「http://localhost:8000/uploads/xxx.jpg」で見るための設定
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# CORS設定: React（別ポート）からのアクセスを許可する
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydanticモデル: Reactとやり取りするデータの「型」を定義
# フロントエンドから送られてくるJSONのバリデーション（チェック）を行う
class Shop(BaseModel):
    name: str
    lat: float
    lng: float
    price: str
    genre: str
    image: Optional[str] = None

    class Config:
        # これをTrueにすると、SQLAlchemyのモデル（ShopModel）をPydantic（Shop）に自動変換できる
        orm_mode = True

# --- APIエンドポイント（処理の入り口） ---

# 画像アップロード機能
@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    # uploadsフォルダに送られてきたファイルを保存する
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    # 保存した場所のURLをフロントに返す
    return {"url": f"/uploads/{file.filename}"}

# データ取得機能（GET）
@app.get("/shops", response_model=List[Shop])
def get_shops(db: Session = Depends(get_db)):
    # DBのshopsテーブルから全てのレコードを取得して返す
    return db.query(ShopModel).all()

# データ登録機能（POST）
@app.post("/shops")
def add_shop(shop: Shop, db: Session = Depends(get_db)):
    # 1. フロントから届いたデータ（shop）を、DB用の型（ShopModel）に入れ替える
    new_shop = ShopModel(
        name=shop.name,
        lat=shop.lat,
        lng=shop.lng,
        price=shop.price,
        genre=shop.genre,
        image=shop.image
    )
    # 2. データベースに追加して保存（コミット）
    db.add(new_shop)
    db.commit()
    # 3. 最新の状態（IDなど）を反映させる
    db.refresh(new_shop)
    return {"message": "DBに保存成功!"}