import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../services/authService";
import "./Auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Call backend login API
    const result = await authService.loginUser(email, password);

    if (result.success) {
      // Redirect based on user role
      const user = authService.getCurrentUser();

      // Role-based navigation
      if (user.role === "ADMIN" || user.role === "ROLE_SUPER_ADMIN") {
        navigate("/admin/home");
      } else if (user.role === "BRANCH_MANAGER" || user.role === "ROLE_MANAGER") {
        navigate("/manager/dashboard");
      } else if (user.role === "ROLE_EMPLOYEE") {
        navigate("/employee/dashboard");
      } else {
        // Default to appointments for CUSTOMER role
        navigate("/appointments");
      }
    } else {
      setError(result.error || "Giriş başarısız");
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Giriş Yap</h2>
        {error && <div className="auth-error">{error}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">E-posta</label>
          <input
            className="auth-input"
            type="email"
            placeholder="E-mail@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <label className="auth-label">Şifre</label>
          <input
            className="auth-input"
            type="password"
            placeholder="Şifrenizi girin"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <div className="auth-row">
            <Link to="/reset" className="auth-forgot">
              şifremi unuttum
            </Link>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
      <Link to="/register" className="auth-register-top">
        Kayıt Ol
      </Link>
    </div>
  );
}
