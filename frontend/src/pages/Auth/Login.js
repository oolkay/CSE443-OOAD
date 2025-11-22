import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: replace with real authentication
    // Temporary: navigate to appointments after "login"
    // (replace with auth/role check when backend is integrated)
    navigate("/appointments");
  };

  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">E-mail</label>
          <input
            className="auth-input"
            type="email"
            placeholder="E-mail@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="auth-label">Password</label>
          <input
            className="auth-input"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="auth-row">
            <Link to="/reset" className="auth-forgot">
              forgot password
            </Link>
          </div>

          <button type="submit" className="auth-button">
            Login
          </button>
        </form>
      </div>
      <Link to="/register" className="auth-register-top">
        Register
      </Link>
    </div>
  );
}
