function SideMenu({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenNews,
  onOpenShopList,
  onOpenGenreFilter,
}) {
  if (!isOpen) return null;

  return (
    <>
      <div onClick={onClose} className="menu-overlay" />
      <div className="side-menu">
        <div className="menu-header">
          <h3>メニュー</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="auth-menu-section">
          {currentUser ? (
            <>
              <p className="auth-menu-title">{currentUser.username} でログイン中</p>
              <button
                className="auth-submit-button auth-menu-button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <p className="auth-menu-title">アカウント</p>
              <button
                className="auth-submit-button auth-menu-button"
                onClick={() => {
                  onOpenAuth();
                  onClose();
                }}
              >
                ログイン / 新規登録
              </button>
            </>
          )}
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
            絞り込み
          </li>
          <li className="menu-item">お気に入り</li>
          <li className="menu-item">設定</li>
        </ul>
      </div>
    </>
  );
}

export default SideMenu;
