import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "../../services/authService";
import "./Auth.css";

export default function SetNewPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";
  const code = location.state?.code || "";
  const sessionToken = location.state?.sessionToken || "";

  // If no email or code is provided, redirect back
  useEffect(() => {
    if (!email || !code) {
      navigate("/reset");
    }
  }, [email, code, navigate]);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validation
    if (password.length < 8) {
      setError("Şifre en az 8 karakter uzunluğunda olmalıdır.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);

    // Call backend reset password API with code
    const result = await authService.resetPassword(sessionToken, password);

    if (result.success) {
      setMessage(
        "Şifreniz başarıyla sıfırlandı. Giriş sayfasına yönlendiriliyorsunuz..."
      );
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } else {
      setError(result.error || "Şifre sıfırlama başarısız. Lütfen tekrar deneyin.");
    }

    setLoading(false);
  };

  const handleBack = () => {
    navigate("/verify-code", { state: { email } });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Yeni Şifre Belirle</h2>
        <p className="auth-desc">
          Hesabınız için yeni bir şifre oluşturun.
        </p>

        {message && <div className="auth-success-message">{message}</div>}
        {error && <div className="auth-error-message">{error}</div>}

        {!message && (
          <form className="auth-form" onSubmit={handleReset}>
            <label className="auth-label">Yeni Şifre</label>
            <input
              className="auth-input"
              type="password"
              placeholder="En az 8 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={8}
            />

            <label className="auth-label">Şifreyi Onayla</label>
            <input
              className="auth-input"
              type="password"
              placeholder="Şifrenizi tekrar girin"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              minLength={8}
            />

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Kaydediliyor..." : "Şifreyi Sıfırla"}
            </button>
          </form>
        )}

        <button className="auth-back" onClick={handleBack}>
          ← Geri
        </button>
      </div>
    </div>
  );
}
