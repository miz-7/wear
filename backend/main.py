from fastapi import FastAPI, File, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
import shutil

app = FastAPI()

app.mount("/static", StaticFiles(directory="uploads"), name="static")
# Reactから接続できるようにするための設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

#保存先のフォルダを確認（なければ作成)
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

#保存した画像をブラウザから見れるようにする
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name = "uploads")

@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    # 保存する場所とファイル名を決定
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    # 画像を実際に保存する
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return{"message": "保存", "filename":file.filename, "url":f"/uploads/{file.filename}"}


JSON_FILE = "shops.json"

class Shop(BaseModel):
    name: str
    lat: float
    lng: float
    price: str
    genre: str
    image: Optional[str] = None


@app.get("/shops") #send for js
def get_shops():
    # jsonファイルを読み込んで、そのまま返す
    with open("shops.json", "r", encoding="utf-8") as f:
        data = json.load(f)
        return data

@app.post("/shops") #given from js
def add_shop(shop: Shop): #届いたデータを、Shop というルールに通してから、shop という名前の変数に入れて
    shops = [] #[ ] (リスト)に{ } (オブジェクト/辞書(message))が届くとエラーになる
    if os.path.exists(JSON_FILE):
        with open(JSON_FILE, "r", encoding="utf-8") as f:
            shops = json.load(f)
    #届いた1軒(shop)を辞書にして、リスト(shops)に追加する
    shops.append(shop.dict())                                       #r = 読み取り（Read）w = 上書き保存（Write）f = ファイルのあだ名（File）

    with open(JSON_FILE, "w", encoding="utf-8") as f:
        json.dump(shops, f, indent=4, ensure_ascii=False)          # indent=4 で見やすくし、ensure_ascii=False で日本語を守る

    return {"message": "保存に成功しました！"}
