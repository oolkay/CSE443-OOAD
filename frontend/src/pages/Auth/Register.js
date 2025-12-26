import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import "./Auth.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Şifreler eşleşmiyor");
      return;
    }

    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalıdır");
      return;
    }

    setLoading(true);

    // Call backend registration API
    const result = await authService.registerUser(name, email, password, phone);

    if (result.success) {
      // Get user data to determine role-based redirect
      const user = JSON.parse(localStorage.getItem('user'));

      // Role-based redirect
      if (user.role === 'ADMIN') {
        navigate("/admin/home");
      } else if (user.role === 'BRANCH_MANAGER') {
        navigate("/calendar");
      } else {
        // Default to appointments for CUSTOMER role
        navigate("/appointments");
      }
    } else {
      setError(result.error || "Kayıt başarısız");
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        <h2 className="auth-title">Kayıt Ol</h2>
        <p className="auth-desc">
          Hizmetlerimizi kullanmak için bilgilerinizi girerek yeni bir hesap
          oluşturun.
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">Ad - Soyadı</label>
          <input
            className="auth-input"
            type="text"
            placeholder="Adınız ve soyadınızı girin"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />

          <label className="auth-label">E-Posta Adresi</label>
          <input
            className="auth-input"
            type="email"
            placeholder="E-postanızı girin"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <label className="auth-label">Telefon Numarası</label>
          <input
            className="auth-input"
            type="tel"
            placeholder="Telefon numaranızı girin (örn: +905001234567)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
          />

          <label className="auth-label">Şifre</label>
          <input
            className="auth-input"
            type="password"
            placeholder="Yeni bir şifre girin"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <label className="auth-label">Şifreyi Onayla</label>
          <input
            className="auth-input"
            type="password"
            placeholder="Şifrenizi tekrar girin"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            disabled={loading}
          />

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Hesap Oluşturuluyor..." : "Hesap Oluştur"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 12, fontSize: 13 }}>
          Zaten bir hesabınız var mı? <Link to="/">Giriş Yap</Link>
        </div>
      </div>

      {/* optional right-side illustration placeholder could be added here */}
    </div>
  );
}
