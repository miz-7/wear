import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leafletのアイコンバグ修正
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 地図クリックを監視する部品
function LocationMarker({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng); // 「クリックした時の情報(e)をちょうだい」
                            // 「その中から緯度経度(latlng)を取り出して、親に渡すね」
    }
  });
  return null;
}

function App() {
  // 【バケツの準備】
  // バックエンドから受け取った「お店のリスト」を保存しておくための変数です
  // Reactに「このデータは画面表示に関わる大切な状態（State）だよ」と教える関数です。
  // [shops, setShops]: 現在のデータそのもの（読み取り用）。,データを書き換えるための専用関数（更新用）。
  const [shops, setShops] = useState([]); 
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImg, setselectedImg] = useState(null);

  // 【地図の中心点】
  // 富山大学付近の座標を設定
  const position = [36.692, 137.187]; 

  // --- 【1. バックエンドから情報を「もらう」部分】 ---
  useEffect(() => {
    // fetchを使って、FastAPIのURL（8000番）に「データをください」とリクエストを送ります
    fetch('http://127.0.0.1:8000/shops') // main.py get(/shops) connect
      .then(response => response.json()) // 届いたデータをプログラムで使える形（JSON）に変換-> message
      .then(data => {
        console.log("バックエンドから届いたデータ:", data);
        
        // リスト（[]）の時だけバケツに入れる、というルールを徹底する
        if (data && Array.isArray(data)) {
          setShops(data); 
        } else {
          console.error("リストじゃないデータが届きました:", data);
          setShops([]); // リストじゃなければ空っぽにしてエラーを防ぐ
        }
      })
      .catch(error => console.error('通信に失敗しました:', error));
  }, []); // [] は「アプリが立ち上がった時に1回だけ実行する」という意味です

  // --- 【2. 地図をクリックした時の処理】 ---
  const handleMapClick = async(latLng) => {
    const shopName = prompt("お店の名前を入力してください");
    if (!shopName) return; // 名前が入力されなかったらここで終了 

    const price = prompt("価格帯を入力してください（例：￥￥）");
    const genre = prompt("系統を入力してください（例：ヴィンテージ）"); 
    // 画像アップロードの処理
    let imageUrl = "";
    if (selectedFile) {
      const formData = new FormData(); 
      formData.append("file", selectedFile); //file:name,selectedfile:中身

      try {
        const res = await fetch('http://127.0.0.1:8000/upload-image', {
          method: 'POST', // ①「送るから登録して！」というモードに切り替え
          body: formData, // ②「中身はこれだよ！」と実体を渡す
        });
        const upLoadData = await res.json(); //サーバーからの返事を、JavaScriptのオブジェクト（辞書形式）に翻訳
        imageUrl = upLoadData.url; //upLoadData: 翻訳が終わったデータが入る変数名
      } catch (err) {
        console.error("画像送信失敗:", err);
      }
    }
    const newShop = { 
      name: shopName,
      lat: latLng.lat, 
      lng: latLng.lng, 
      price: price || "未設定", 
      genre: genre || "未設定",
      image: imageUrl
  };
    // --- 【追加：Pythonの「箱」に情報を入れる部分】 ---
    // fetchを使って、今度は「データを保存して」とお願いを送ります
    fetch('http://127.0.0.1:8000/shops', {
      method: 'POST', // 「送る」という意味
      headers: { 'Content-Type': 'application/json' }, // 「荷物の中身はJSONだよ」と教える
      body: JSON.stringify(newShop) // 荷物を文字に変換して送る
    })
    .then(response => response.json())  //#pythonが無事に保存し終わって、保存したよという返事が戻ってきた後の処理
    .then(data => {
      console.log("保存した結果:", data);
      // ここでバケツを更新！ (handleMapClickの関数の中に書くのが正解) 
      setShops((prevShops) => [...prevShops, newShop]);
      alert("データベースに保存しました！（リロードしても消えません）");
    })
    .catch(error => console.error('保存に失敗しました:', error));

  }; // ここまでが handleMapClick の範囲

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <h1 style={{ textAlign: 'center' }}>マップ</h1>
      <div style={{ padding: "10px"}}>
        <p>①画像を選択 → ②地図をクリック</p>
        <input
        type="file"
        onChange={(e) => setSelectedFile(e.target.files[0])}
        />
      </div>
      <MapContainer center={position} zoom={15} style={{ height: '90vh', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* 地図クリックを監視する部品を設置。handleMapClickを渡す */}
        <LocationMarker onMapClick={handleMapClick} />

        {/* shopsの中身をループで回してピンを立てる */}
        {shops.map((shop, idx)=> (
          <Marker key={idx} position={[shop.lat, shop.lng]}>
            <Popup>
              <strong>{shop.name}</strong><br />
              価格帯: {shop.price}<br />
              ジャンル: {shop.genre}
              {shop.image && (
                <img 
                src={`http://localhost:8000${shop.image}`}
                alt={shop.name}
                onClick={() => setselectedImg(shop.image)} 
                style={{ width: "100%", maxWidth: '200px', borderRadius: '8px'}} 
                />
              )}
              </Popup>
          </Marker>
        ))}
      </MapContainer>

      {selectedImg && (
        <div
          onClick={() => setselectedImg(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            zIndex: 9999,
            cursor: 'zoom-out'
          }}
        >
          <img
            src={`http://localhost:8000${selectedImg}`}
            alt="拡大機能"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              borderRadius: '10px',
              boxShadow: '0 0 20px rgba(255,255,255,0.2)'
            }}
          />  
        </div>
      )}
    </div>
  );
}

export default App;