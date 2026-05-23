import { useState } from "react";

function AuthPanel({ isOpen, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const isRegister = mode === "register";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isRegister
      ? "http://localhost:8000/auth/register"
      : "http://localhost:8000/auth/login";

    const body = isRegister
      ? { username, email, password }
      : { email, password };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      alert("認証に失敗しました");
      return;
    }

    if (isRegister) {
      setMode("login");
      alert("登録しました。ログインしてください。");
      return;
    }

    const user = await response.json();
    onLoginSuccess(user);
    onClose();
  };

  return (
    <>
      <div onClick={onClose} className="menu-overlay" />
      <div className="side-menu">
        <div className="menu-header">
          <h3>{isRegister ? "新規登録" : "ログイン"}</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <label>
              ユーザーネーム
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>
          )}

          <label>
            メールアドレス
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            パスワード
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button className="auth-submit-button" type="submit">
            {isRegister ? "登録する" : "ログイン"}
          </button>
        </form>

        <button
          className="auth-switch-button"
          onClick={() => setMode(isRegister ? "login" : "register")}
        >
          {isRegister ? "ログインに戻る" : "新規登録はこちら"}
        </button>
      </div>
    </>
  );
}

export default AuthPanel;
