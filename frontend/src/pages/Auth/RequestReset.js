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
        "Reset instructions have been sent to your email. Please check your inbox."
      );
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } else {
      setError(
        result.error || "Failed to send reset instructions. Please try again."
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
        <h2 className="auth-title">Reset Your Password</h2>
        <p className="auth-desc">
          Enter your registered email address and we will send you a link to
          reset your password.
        </p>

        {message && <div className="auth-success-message">{message}</div>}
        {error && <div className="auth-error-message">{error}</div>}

        {!message && (
          <form className="auth-form" onSubmit={handleSend}>
            <label className="auth-label">E-mail</label>
            <input
              className="auth-input"
              type="email"
              placeholder="e-mail@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <button className="auth-back" onClick={handleBack}>
          ← Back
        </button>
      </div>
    </div>
  );
}
