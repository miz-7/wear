import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';
import { MdMyLocation } from 'react-icons/md';

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
      onMapClick(e.latlng);
    }
  });
  return null;
}

const genreOptions = [
  "ヴィンテージ",
  "ストリート",
  "カジュアル",
  "モード",
  "韓国系",
  "アメカジ",
  "その他"
];


// サイドメニューのコンポーネント
const SideMenu = ({ isOpen, onClose, shops, onShopClick, onOpenNews, onOpenShopList}) => {
  if (!isOpen) return null;
  
  return (
    <>
      <div onClick={onClose} className="menu-overlay" />
      <div className="side-menu">
        <div className="menu-header">
          <h3>メニュー</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <ul className="menu-list">
          <li className="menu-item"
          onClick={() => {
            onOpenNews();
            onClose();
          }}
          >新着投稿</li>
          <li 
            className="menu-item"
            onClick={()=> {
              onOpenShopList();
              onClose();
            }}
          >
            マイショップ一覧
          </li>
          <li className="menu-item">お気に入り</li>
          <li className="menu-item">設定</li>
        </ul>
      </div>
    </>
  );
};

const NewsPanel = ({ isOpen, onClose, shops, onImageClick }) => {
  if (!isOpen) return null;

  const latestShops = [...shops].slice(-5).reverse();

  return (
    <>
      <div onClick={onClose} className="menu-overlay" />
      <div className="side-menu">
        <div className="menu-header">
          <h3>新着投稿</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <ul className="menu-list">
          {latestShops.length === 0 ? (
            <li className="menu-item">まだ投稿がありません</li>
          ) : (
            latestShops.map((shop, index) => (
              <li key={index} className="menu-item">
                <strong>{shop.name}</strong><br />
                価格帯: {shop.price}<br />
                ジャンル: {shop.genre}
                {shop.comment && (
                  <>
                    <br/>
                    コメント: {shop.comment}
                  </>
                )}
                {shop.image && (
                <img
                  src={"http://localhost:8000" + shop.image}
                  alt={shop.name}
                  onClick={() => onImageClick(shop.image)}
                  className="list-shop-image"
                />
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </>
  );
};

const ShopListPanel = ({ isOpen, onClose, shops, onImageClick }) => {
  if (!isOpen) return null;

  return (
    <>
      <div onClick={onClose} className="menu-overlay" />
      <div className="side-menu">
        <div className="menu-header">
          <h3>マイショップ一覧</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <ul className="menu-list">
          {shops.length === 0 ? (
            <li className="menu-item">まだ投稿がありません</li>
          ) : (
            shops.map((shop, index) => (
              <li key={index} className="menu-item">
                <strong>{shop.name}</strong><br />
                価格帯: {shop.price}<br />
                ジャンル: {shop.genre}<br />
                {shop.comment && (
                  <>
                    <br />
                    コメント: {shop.comment}
                  </>
                )}
 
                {shop.image && (
                  <img
                    src={`http://localhost:8000${shop.image}`}
                    alt={shop.name}
                    onClick={() => onImageClick(shop.image)}
                    className="list-shop-image"
                  />
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </>
  );
};
            


// --- ここに追加（App関数の外） ---
function CurrentLocationButton() {
  const map = useMap(); // これで地図を操る「コントローラー」をゲット

  const buttonRef = useRef(null);

  useEffect(() => {
    if (buttonRef.current) {
      L.DomEvent.disableClickPropagation(buttonRef.current);
    }
  }, []);


  const handleLocationClick = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], 15, { animate: true });
      },
      () => alert("位置情報を許可してください")
    );
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleLocationClick}
      style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: 'white',
        border: 'none',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <MdMyLocation size={32} color="#4285F4" />
    </button>
  );
}
function App() {
  const [shops, setShops] = useState([]); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShopListOpen, setIsShopListOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImg, setselectedImg] = useState(null);
  const [pendingShop, setPendingShop] = useState(null);
  const [isGenreSelectOpen, setIsGenreSelectOpen] = useState(false);

  // 富山大学付近の座標
  const position = [36.692, 137.187]; 

  // バックエンドから情報を取得
  useEffect(() => {
    fetch('http://127.0.0.1:8000/shops')
      .then(response => response.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setShops(data); 
        } else {
          setShops([]);
        }
      })
      .catch(error => console.error('通信に失敗しました:', error));
  }, []);

  // 地図クリック時の処理
  const handleMapClick = async (latLng) => {
    const shopName = prompt("お店の名前を入力してください");
    if (!shopName) return;

    const price = prompt("価格帯を入力してください（例：￥￥）");
    const comment = prompt("コメント");

    let imageUrl = "";
    if (selectedFile) {
      const formData = new FormData(); 
      formData.append("file", selectedFile);

      try {
        const res = await fetch('http://127.0.0.1:8000/upload-image', {
          method: 'POST',
          body: formData,
        });
        const upLoadData = await res.json();
        imageUrl = upLoadData.url;
      } catch (err) {
        console.error("画像送信失敗:", err);
      }
    }

    const baseShop = { 
      name: shopName,
      lat: latLng.lat, 
      lng: latLng.lng, 
      price: price || "未設定", 
      comment: comment || "",
      image: imageUrl
    };

    setPendingShop(baseShop);
    setIsGenreSelectOpen(true)
  };

  const handleGenreSelect = (genre) => {
      if (!pendingShop) return;

      const newShop = {
        ...pendingShop,
        genre: genre
      };

      fetch('http://127.0.0.1:8000/shops', {
        method: "POST",
        headers: {"Content-Type" : "application/json" },
        body: JSON.stringify(newShop)
      })
      .then(response => response.json())
      .then(data => {
        setShops((prevShops) => [...prevShops, newShop]);
        setPendingShop(null);
        setIsGenreSelectOpen(false);
        alert("データベースに保存しました");
      })
      .catch(error => console.error("保存に失敗しました", error));
    };
    

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <h1 style={{ textAlign: 'center' }}>富大周辺 古着屋マップ</h1>

      <button onClick={() => setIsMenuOpen(true)} className="menu-button">
        ☰ メニュー
      </button>

      <div style={{ padding: "10px", textAlign: 'center' }}>
        <p>①画像を選択 → ②地図をクリックしてお店を登録</p>
        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />
      </div>

      

      <MapContainer center={position} zoom={15} style={{ height: '80vh', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <CurrentLocationButton/>

        <LocationMarker onMapClick={handleMapClick} />

        {shops.map((shop, idx)=> (
          <Marker key={idx} position={[shop.lat, shop.lng]}>
            <Popup>
              <strong>{shop.name}</strong><br />
              価格帯: {shop.price}<br />
              ジャンル: {shop.genre}<br />
              {shop.comment && (
              <div style={{ marginTop: '5px', fontStyle: 'italic', color: '#555' }}>
              💬 {shop.comment}
              </div>
              )}
              {shop.image && (
                <img 
                  src={`http://localhost:8000${shop.image}`}
                  alt={shop.name}
                  onClick={() => setselectedImg(shop.image)} 
                  style={{ width: "100%", maxWidth: '200px', borderRadius: '8px', cursor: 'pointer'}} 
                />
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <SideMenu
       isOpen={isMenuOpen}
       onClose={() => setIsMenuOpen(false)}
       onOpenNews={() => setIsNewsOpen(true)} 
       onOpenShopList={() => setIsShopListOpen(true)}
       />

      <NewsPanel
       isOpen={isNewsOpen}
       onClose={() => setIsNewsOpen(false)}
       shops={shops}
       onImageClick={(image) => setselectedImg(image)}
      />

      <ShopListPanel
       isOpen={isShopListOpen}
       onClose={() => setIsShopListOpen(false)}
       shops={shops}
       onImageClick={(image) => setselectedImg(image)}
      />

      {isGenreSelectOpen && (
        <div className="menu-overlay">
          <div className="side-menu">
            <div className="menu-header">
              <h3>系統を選択</h3>
              <button
                onClick={() => {
                 setIsGenreSelectOpen(false);
                 setPendingShop(null);
                }}
                className="close-button"
              >
               ×
              </button>
           </div>

           <div className="genre-button-list">
             {genreOptions.map((genre) => (
                <button
                  key={genre}
                 className="genre-button"
                 onClick={() => handleGenreSelect(genre)}
               >
                  {genre}
                </button>
              ))}
           </div>
          </div>
       </div>
      )}


      {selectedImg && (
        <div
          onClick={() => setselectedImg(null)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 9999, cursor: 'zoom-out'
          }}
        >
          <img
            src={`http://localhost:8000${selectedImg}`}
            alt="拡大表示"
            style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '10px' }}
          />  
        </div>
      )}
    </div>
  );
}

export default App;