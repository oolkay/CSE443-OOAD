import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import "./Auth.css";

export default function RequestReset() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    // Call backend forgot password API
    const result = await authService.requestPasswordReset(email);

    if (result.success) {
      setMessage(
        "Doğrulama kodu e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin."
      );
      setTimeout(() => {
        navigate("/verify-code", { state: { email } });
      }, 2000);
    } else {
      setError(
        result.error || "Kod gönderilemedi. Lütfen tekrar deneyin."
      );
    }

    setLoading(false);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Şifrenizi Sıfırlayın</h2>
        <p className="auth-desc">
          Kayıtlı e-posta adresinizi girin, size bir doğrulama kodu gönderelim.
        </p>

        {message && <div className="auth-success-message">{message}</div>}
        {error && <div className="auth-error-message">{error}</div>}

        {!message && (
          <form className="auth-form" onSubmit={handleSend}>
            <label className="auth-label">E-posta</label>
            <input
              className="auth-input"
              type="email"
              placeholder="e-posta@ornek.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Gönderiliyor..." : "Kod Gönder"}
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
