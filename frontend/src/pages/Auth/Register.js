import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }
    // TODO: replace with real registration API call
    alert(`Account created for ${name} (${email})`);
    // Redirect to login after register
    navigate("/");
  };

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        <h2 className="auth-title">Register</h2>
        <p className="auth-desc">
          To use our services, create a new account by entering your
          information.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">Name - Last Name</label>
          <input
            className="auth-input"
            type="text"
            placeholder="Enter your name and last name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label className="auth-label">E-Mail Address</label>
          <input
            className="auth-input"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="auth-label">Phone Number</label>
          <input
            className="auth-input"
            type="tel"
            placeholder="Enter your phone number (ex: +905001234567)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <label className="auth-label">Password</label>
          <input
            className="auth-input"
            type="password"
            placeholder="Enter a new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label className="auth-label">Confirm Password</label>
          <input
            className="auth-input"
            type="password"
            placeholder="Enter your password again"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <button type="submit" className="auth-button">
            Create Account
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 12, fontSize: 13 }}>
          Have you already an account? <Link to="/">Login</Link>
        </div>
      </div>

      {/* optional right-side illustration placeholder could be added here */}
    </div>
  );
}
