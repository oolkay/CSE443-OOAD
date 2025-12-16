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
      navigate("/appointments");
    } else {
      setError(result.error || "Login failed");
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>
        {error && <div className="auth-error">{error}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">E-mail</label>
          <input
            className="auth-input"
            type="email"
            placeholder="E-mail@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <label className="auth-label">Password</label>
          <input
            className="auth-input"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <div className="auth-row">
            <Link to="/reset" className="auth-forgot">
              forgot password
            </Link>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
      <Link to="/register" className="auth-register-top">
        Register
      </Link>
    </div>
  );
}
