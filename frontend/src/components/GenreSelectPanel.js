import { genreOptions } from '../constants/genreOptions';

function GenreSelectPanel({ isOpen, onClose, onSelectGenre }) {
  if (!isOpen) return null;

  return (
    <div className="menu-overlay">
      <div className="side-menu">
        <div className="menu-header">
          <h3>系統を選択</h3>
          <button onClick={onClose} className="close-button">
            ×
          </button>
        </div>

        <div className="genre-button-list">
          {genreOptions.map((genre) => (
            <button
              key={genre}
              className="genre-button"
              onClick={() => onSelectGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GenreSelectPanel;
