import { genreOptions } from '../constants/genreOptions';

function GenreFilterPanel({ isOpen, onClose, selectedGenre, onSelectGenre, shops }) {
  if (!isOpen) return null;

  const filterGenres = ["すべて", ...genreOptions];

  const filteredShops =
    selectedGenre === "すべて"
      ? shops
      : shops.filter((shop) => shop.genre === selectedGenre);

  return (
    <>
      <div onClick={onClose} className="menu-overlay" />
      <div className="side-menu">
        <div className="menu-header">
          <h3>ジャンル絞り込み</h3>
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
