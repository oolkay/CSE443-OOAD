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
      setError("Invalid reset link. Missing token.");
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
          "Your reset link has expired or is invalid. Please request a new one."
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
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    // Call backend reset password API
    const result = await authService.resetPassword(token, email, password);

    if (result.success) {
      setMessage(
        "Your password has been successfully reset. Redirecting to login..."
      );
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } else {
      setError(result.error || "Failed to reset password. Please try again.");
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
          <h2 className="auth-title">Validating Reset Link...</h2>
          <p className="auth-desc">
            Please wait while we validate your reset link.
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
          <h2 className="auth-title">Invalid Reset Link</h2>
          <p className="auth-desc">{error}</p>
          <button className="auth-button" onClick={() => navigate("/reset")}>
            Request New Reset Link
          </button>
          <button className="auth-back" onClick={handleBack}>
            ← Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Show reset form if token is valid
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Reset Your Password</h2>
        <p className="auth-desc">Enter your new password below.</p>

        {message && <div className="auth-success-message">{message}</div>}
        {error && <div className="auth-error-message">{error}</div>}

        {!message && (
          <form className="auth-form" onSubmit={handleReset}>
            <label className="auth-label">New Password</label>
            <input
              className="auth-input"
              type="password"
              placeholder="Enter new password (min. 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />

            <label className="auth-label">Confirm Password</label>
            <input
              className="auth-input"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <button className="auth-back" onClick={handleBack}>
          ← Back to Login
        </button>
      </div>
    </div>
  );
}
