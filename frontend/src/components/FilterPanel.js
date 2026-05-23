import { genreOptions } from '../constants/genreOptions';

function GenreFilterPanel({
  isOpen,
  onClose,
  selectedGenre,
  onSelectGenre,
  minPrice,
  maxPrice,
  onChangeMinPrice,
  onChangeMaxPrice,
  shops,
}) {
  if (!isOpen) return null;

  const filterGenres = ["すべて", ...genreOptions];

  const filteredShops = shops.filter((shop) => {
    const genreMatch =
      selectedGenre === "すべて" || shop.genre === selectedGenre;
    const price = Number(shop.price);
    const priceIsValid = !Number.isNaN(price);
    const minMatch = minPrice === "" || (priceIsValid && price >= Number(minPrice));
    const maxMatch = maxPrice === "" || (priceIsValid && price <= Number(maxPrice));

    return genreMatch && minMatch && maxMatch;
  });

  return (
    <>
      <div onClick={onClose} className="menu-overlay" />
      <div className="side-menu">
        <div className="menu-header">
          <h3>絞り込み</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="genre-button-list">
          {filterGenres.map((genre) => (
            <button
              key={genre}
              className={selectedGenre === genre ? "genre-button active" : "genre-button"}
              onClick={() => onSelectGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>

        <div className="price-filter-area">
          <label>
            最低価格
            <input
              type="number"
              value={minPrice}
              onChange={(e) => onChangeMinPrice(e.target.value)}
              placeholder="例: 1000"
            />
          </label>

          <label>
            最高価格
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => onChangeMaxPrice(e.target.value)}
              placeholder="例: 5000"
            />
          </label>
        </div>

        <ul className="menu-list">
          {filteredShops.length === 0 ? (
            <li className="menu-item">該当するお店がありません</li>
          ) : (
            filteredShops.map((shop, index) => (
              <li key={index} className="menu-item">
                <strong>{shop.name}</strong><br />
                価格帯: {shop.price}<br />
                ジャンル: {shop.genre}
                {shop.comment && (
                  <>
                    <br />
                    コメント: {shop.comment}
                  </>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </>
  );
}

export default GenreFilterPanel;
