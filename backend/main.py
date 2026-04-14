from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os

app = FastAPI()

# Reactから接続できるようにするための設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

JSON_FILE = "shops.json"

class Shop(BaseModel):
    name: str
    lat: float
    lng: float
    price: str
    genre: str


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
