import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./App.css";

import SideMenu from "./components/SideMenu";
import NewsPanel from "./components/NewsPanel";
import ShopListPanel from "./components/ShopListPanel";
import GenreFilterPanel from "./components/FilterPanel";
import GenreSelectPanel from "./components/GenreSelectPanel";
import CurrentLocationButton from "./components/CurrentLocationButton";
import LocationMarker from "./components/LocationMarker";
import ImageModal from "./components/ImageModal";
import AuthPanel from "./components/AuthPanel";
import { genreOptions } from "./constants/genreOptions";

// Leafletのアイコンバグ修正
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function App() {
  const [shops, setShops] = useState([]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShopListOpen, setIsShopListOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [isGenreSelectOpen, setIsGenreSelectOpen] = useState(false);
  const [isGenreFilterOpen, setIsGenreFilterOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImg, setSelectedImg] = useState(null);
  const [pendingShop, setPendingShop] = useState(null);

  const [selectedGenre, setSelectedGenre] = useState("すべて");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const mapSectionRef = useRef(null);
  const position = [36.692, 137.187];

  useEffect(() => {
    fetch("http://localhost:8000/shops")
      .then((response) => response.json())
      .then((data) => {
        if (data && Array.isArray(data)) {
          setShops(data);
        } else {
          setShops([]);
        }
      })
      .catch((error) => console.error("通信に失敗しました:", error));
  }, []);

  useEffect(() => {
    fetch("http://localhost:8000/auth/me", {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((user) => {
        if (user) {
          setCurrentUser(user);
        }
      })
      .catch(() => setCurrentUser(null));
  }, []);

  const handleMapClick = async (latLng) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    const shopName = prompt("お店の名前を入力してください");
    if (!shopName) return;

    const price = prompt("価格帯を入力してください（例：3000）");
    const comment = prompt("コメント");

    let imageUrl = "";

    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const res = await fetch("http://localhost:8000/upload-image", {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        const uploadData = await res.json();
        imageUrl = uploadData.url;
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
      image: imageUrl,
    };

    setPendingShop(baseShop);
    setIsGenreSelectOpen(true);
  };

  const handleGenreSelect = (genre) => {
    if (!pendingShop || !currentUser) return;

    const newShop = {
      ...pendingShop,
      genre: genre,
    };

    fetch("http://localhost:8000/shops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(newShop),
    })
      .then((response) => response.json())
      .then(() => {
        setShops((prevShops) => [...prevShops, newShop]);
        setPendingShop(null);
        setIsGenreSelectOpen(false);
        alert("データベースに保存しました");
      })
      .catch((error) => console.error("保存に失敗しました:", error));
  };

  const handleLogout = async () => {
    await fetch("http://localhost:8000/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setCurrentUser(null);
  };

  const scrollToMap = () => {
    mapSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredShops = shops.filter((shop) => {
    const genreMatch =
      selectedGenre === "すべて" || shop.genre === selectedGenre;
    const priceNumber = Number(shop.price);
    const priceIsValid = !Number.isNaN(priceNumber);
    const minMatch = minPrice === "" || (priceIsValid && priceNumber >= Number(minPrice));
    const maxMatch = maxPrice === "" || (priceIsValid && priceNumber <= Number(maxPrice));

    return genreMatch && minMatch && maxMatch;
  });

  const latestShops = [...shops].slice(-3).reverse();
  const trendShops = [...shops].slice(-5).reverse();

  return (
    <div className="app-shell">
      <header className="top-nav">
        <button className="brand-button" onClick={scrollToMap} type="button">
          <span className="brand-mark">W</span>
          <span>Wear Map</span>
        </button>

        <nav className="nav-links" aria-label="メインメニュー">
          <button onClick={scrollToMap} type="button">ホーム</button>
          <button onClick={() => setIsNewsOpen(true)} type="button">新着</button>
          <button onClick={() => setIsGenreFilterOpen(true)} type="button">カテゴリ</button>
          <button onClick={() => setIsShopListOpen(true)} type="button">ショップ</button>
        </nav>

        <div className="nav-actions">
          {currentUser ? (
            <>
              <span className="user-chip">{currentUser.username}</span>
              <button className="ghost-button" onClick={handleLogout} type="button">ログアウト</button>
            </>
          ) : (
            <button className="ghost-button" onClick={() => setIsAuthOpen(true)} type="button">
              ログイン
            </button>
          )}
          <button onClick={() => setIsMenuOpen(true)} className="primary-button small" type="button">
            メニュー
          </button>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <p className="hero-label">富山大学周辺 古着コミュニティ</p>
          <h1>
            古着屋をもっと
            <span>気軽に、リアルに</span>
          </h1>
          <p className="hero-copy">
            気になる古着屋を写真つきで投稿。ジャンル・価格・地図から、今日行きたい一軒を見つけよう。
          </p>

          <div className="hero-actions">
            <button className="primary-button" onClick={scrollToMap} type="button">マップを見る</button>
            <button className="secondary-button" onClick={() => setIsNewsOpen(true)} type="button">
              最新の投稿を見る
            </button>
          </div>
        </section>

        <section className="category-strip" aria-label="ジャンル一覧">
          <button
            className={selectedGenre === "すべて" ? "category-chip active" : "category-chip"}
            onClick={() => setSelectedGenre("すべて")}
            type="button"
          >
            すべて <span>{shops.length}</span>
          </button>
          {genreOptions.map((genre) => {
            const count = shops.filter((shop) => shop.genre === genre).length;
            return (
              <button
                key={genre}
                className={selectedGenre === genre ? "category-chip active" : "category-chip"}
                onClick={() => setSelectedGenre(genre)}
                type="button"
              >
                {genre} <span>{count}</span>
              </button>
            );
          })}
        </section>

        <section className="content-grid" ref={mapSectionRef}>
          <article className="map-panel">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Map</p>
                <h2>富大周辺 古着屋マップ</h2>
              </div>
              <button className="secondary-button compact" onClick={() => setIsGenreFilterOpen(true)} type="button">
                絞り込み
              </button>
            </div>

            <div className="upload-panel">
              {currentUser ? (
                <label className="file-label">
                  投稿画像を選択
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                  />
                </label>
              ) : (
                <div>
                  <strong>投稿するにはログインが必要です</strong>
                  <p>地図はログインなしで見られます。</p>
                </div>
              )}
            </div>

            <div className="map-frame">
              <MapContainer center={position} zoom={15} className="map-container">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                <CurrentLocationButton />
                <LocationMarker onMapClick={handleMapClick} />

                {filteredShops.map((shop, idx) => (
                  <Marker key={idx} position={[shop.lat, shop.lng]}>
                    <Popup>
                      <div className="popup-card">
                        <strong>{shop.name}</strong>
                        <span>価格帯: {shop.price}</span>
                        <span>ジャンル: {shop.genre}</span>

                        {shop.comment && <p>{shop.comment}</p>}

                        {shop.image && (
                          <img
                            src={`http://localhost:8000${shop.image}`}
                            alt={shop.name}
                            onClick={() => setSelectedImg(shop.image)}
                            className="popup-image"
                          />
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </article>

          <aside className="side-column">
            <section className="ranking-card">
              <div className="panel-header compact-header">
                <div>
                  <p className="section-kicker">New</p>
                  <h2>新着投稿</h2>
                </div>
              </div>

              <div className="review-list">
                {latestShops.length === 0 ? (
                  <p className="empty-text">まだ投稿がありません</p>
                ) : (
                  latestShops.map((shop, index) => (
                    <button
                      key={`${shop.name}-${index}`}
                      className="review-card"
                      onClick={() => shop.image && setSelectedImg(shop.image)}
                      type="button"
                    >
                      <div className="review-thumb">
                        {shop.image ? (
                          <img src={`http://localhost:8000${shop.image}`} alt={shop.name} />
                        ) : (
                          <span>No Image</span>
                        )}
                      </div>
                      <div>
                        <strong>{shop.name}</strong>
                        <span>{shop.genre || "ジャンル未設定"}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </section>

            <section className="ranking-card">
              <div className="panel-header compact-header">
                <div>
                  <p className="section-kicker">Trend</p>
                  <h2>注目ショップ</h2>
                </div>
              </div>

              <ol className="trend-list">
                {trendShops.length === 0 ? (
                  <li className="empty-text">投稿を待っています</li>
                ) : (
                  trendShops.map((shop, index) => (
                    <li key={`${shop.name}-trend-${index}`}>
                      <span>{index + 1}</span>
                      <div>
                        <strong>{shop.name}</strong>
                        <small>{shop.price} / {shop.genre}</small>
                      </div>
                    </li>
                  ))
                )}
              </ol>
            </section>
          </aside>
        </section>
      </main>

      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenNews={() => setIsNewsOpen(true)}
        onOpenShopList={() => setIsShopListOpen(true)}
        onOpenGenreFilter={() => setIsGenreFilterOpen(true)}
      />

      <NewsPanel
        isOpen={isNewsOpen}
        onClose={() => setIsNewsOpen(false)}
        shops={shops}
        onImageClick={(image) => setSelectedImg(image)}
      />

      <ShopListPanel
        isOpen={isShopListOpen}
        onClose={() => setIsShopListOpen(false)}
        shops={shops}
        onImageClick={(image) => setSelectedImg(image)}
      />

      <GenreFilterPanel
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

      <AuthPanel
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />

      <ImageModal image={selectedImg} onClose={() => setSelectedImg(null)} />
    </div>
  );
}

export default App;
