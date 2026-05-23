function ShopListPanel({ isOpen, onClose, shops, onImageClick }) {
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
}

export default ShopListPanel;
