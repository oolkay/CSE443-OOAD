import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import authService from "../../services/authService";
import "./Auth.css";

export default function EnterNewPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [tokenValid, setTokenValid] = useState(null);
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  // Validate token on component mount
  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    if (!token) {
      setError("Geçersiz sıfırlama bağlantısı. Token eksik.");
      setTokenValid(false);
      return;
    }

    // Call backend token validation API
    const result = await authService.validateResetToken(token);

    if (result.success) {
      setTokenValid(true);
    } else {
      setError(
        result.error ||
          "Sıfırlama bağlantınızın süresi dolmuş veya geçersiz. Lütfen yeni bir tane isteyin."
      );
      setTokenValid(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validation
    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalıdır.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);

    // Call backend reset password API
    const result = await authService.resetPassword(token, email, password);

    if (result.success) {
      setMessage(
        "Şifreniz başarıyla sıfırlandı. Giriş sayfasına yönlendiriliyorsunuz..."
      );
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } else {
      setError(
        result.error || "Şifre sıfırlama başarısız oldu. Lütfen tekrar deneyin."
      );
    }

    setLoading(false);
  };

  const handleBack = () => {
    navigate("/");
  };

  // Show loading state while validating token
  if (tokenValid === null) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2 className="auth-title">Sıfırlama Bağlantısı Doğrulanıyor...</h2>
          <p className="auth-desc">
            Lütfen sıfırlama bağlantınız doğrulanırken bekleyin.
          </p>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (!tokenValid) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2 className="auth-title">Geçersiz Sıfırlama Bağlantısı</h2>
          <p className="auth-desc">{error}</p>
          <button className="auth-button" onClick={() => navigate("/reset")}>
            Yeni Sıfırlama Bağlantısı İste
          </button>
          <button className="auth-back" onClick={handleBack}>
            ← Giriş Sayfasına Dön
          </button>
        </div>
      </div>
    );
  }

  // Show reset form if token is valid
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Şifrenizi Sıfırlayın</h2>
        <p className="auth-desc">Yeni şifrenizi aşağıya girin.</p>

        {message && <div className="auth-success-message">{message}</div>}
        {error && <div className="auth-error-message">{error}</div>}

        {!message && (
          <form className="auth-form" onSubmit={handleReset}>
            <label className="auth-label">Yeni Şifre</label>
            <input
              className="auth-input"
              type="password"
              placeholder="Yeni şifre girin (en az 8 karakter)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />

            <label className="auth-label">Şifreyi Onayla</label>
            <input
              className="auth-input"
              type="password"
              placeholder="Yeni şifreyi onayla"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Sıfırlanıyor..." : "Şifreyi Sıfırla"}
            </button>
          </form>
        )}

        <button className="auth-back" onClick={handleBack}>
          ← Giriş Sayfasına Dön
        </button>
      </div>
    </div>
  );
}
