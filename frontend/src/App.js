import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';
import LocationMarker from './components/LocationMarker';
import SideMenu from './components/SideMenu';
import NewsPanel from './components/NewsPanel';
import ShopListPanel from './components/ShopListPanel';
import FilterPanel from './components/FilterPanel';
import GenreSelectPanel from './components/GenreSelectPanel';
import CurrentLocationButton from './components/CurrentLocationButton';
import ImageModal from './components/ImageModal';

// Leafletのアイコンバグ修正
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function App() {
  const [shops, setShops] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShopListOpen, setIsShopListOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImg, setselectedImg] = useState(null);
  const [pendingShop, setPendingShop] = useState(null);
  const [isGenreSelectOpen, setIsGenreSelectOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("すべて");
  const [isGenreFilterOpen, setIsGenreFilterOpen] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");


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
    setIsGenreSelectOpen(true);
  };

  const handleGenreSelect = (genre) => {
    if (!pendingShop) return;

    const newShop = {
      ...pendingShop,
      genre: genre
    };

    fetch('http://127.0.0.1:8000/shops', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

  const filteredShops =
    selectedGenre === "すべて"
      ? shops
      : shops.filter((shop) => shop.genre === selectedGenre);

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

        <CurrentLocationButton />

        <LocationMarker onMapClick={handleMapClick} />

        {filteredShops.map((shop, idx) => (
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
                  style={{ width: "100%", maxWidth: '200px', borderRadius: '8px', cursor: 'pointer' }}
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
        onOpenGenreFilter={() => setIsGenreFilterOpen(true)}
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

     <FilterPanel
      isOpen={isGenreFilterOpen}
      onClose={() => setIsGenreFilterOpen(false)}
      selectedGenre={selectedGenre}
      onSelectGenre={(genre) => setSelectedGenre(genre)}
      minPrice={minPrice}
      maxPrice={maxPrice}
      onChangeMinPrice={(price) => setMinPrice(price)}
      onChangeMaxPrice={(price) => setMaxPrice(price)}
      shops={shops}
     />





      <GenreSelectPanel
        isOpen={isGenreSelectOpen}
        onClose={() => {
          setIsGenreSelectOpen(false);
          setPendingShop(null);
        }}
        onSelectGenre={handleGenreSelect}
      />

      <ImageModal
        image={selectedImg}
        onClose={() => setselectedImg(null)}
      />
    </div>
  );
}

export default App;
