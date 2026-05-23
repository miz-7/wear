function SideMenu({ isOpen, onClose, onOpenNews, onOpenShopList, onOpenGenreFilter }) {
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
          <li
            className="menu-item"
            onClick={() => {
              onOpenNews();
              onClose();
            }}
          >
            新着投稿
          </li>
          <li
            className="menu-item"
            onClick={() => {
              onOpenShopList();
              onClose();
            }}
          >
            マイショップ一覧
          </li>
          <li
            className="menu-item"
            onClick={() => {
              onOpenGenreFilter();
              onClose();
            }}
          >
            ジャンル絞り込み
          </li>
          <li className="menu-item">お気に入り</li>
          <li className="menu-item">設定</li>
        </ul>
      </div>
    </>
  );
}

export default SideMenu;
