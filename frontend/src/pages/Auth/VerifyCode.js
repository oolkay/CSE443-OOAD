import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "../../services/authService";
import "./Auth.css";

export default function VerifyCode() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email || "";

  // If no email is provided, redirect back
  React.useEffect(() => {
    if (!email) {
      navigate("/reset");
    }
  }, [email, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (code.length !== 6) {
      setError("Lütfen 6 haneli doğrulama kodunu girin");
      setLoading(false);
      return;
    }

    // Call backend to verify code
    const result = await authService.verifyResetCode(email, code);

    if (result.success && result.sessionToken) {
      const sessionToken = result.sessionToken;
      // Navigate to new password page with email and verified code
      navigate("/enter-new-password", { 
        state: { email, code, sessionToken } 
      });
    } else {
      setError(result.error || "Doğrulama kodu geçersiz. Lütfen tekrar deneyin.");
    }

    setLoading(false);
  };

  const handleResendCode = async () => {
    setError("");
    setLoading(true);

    const result = await authService.requestPasswordReset(email);

    if (result.success) {
      alert("Doğrulama kodu tekrar gönderildi. Lütfen e-postanızı kontrol edin.");
    } else {
      setError(result.error || "Kod gönderilemedi. Lütfen tekrar deneyin.");
    }

    setLoading(false);
  };

  const handleBack = () => {
    navigate("/reset");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Doğrulama Kodu</h2>
        <p className="auth-desc">
          {email} adresine gönderilen 6 haneli doğrulama kodunu girin.
        </p>

        {error && <div className="auth-error-message">{error}</div>}

        <form className="auth-form" onSubmit={handleVerify}>
          <label className="auth-label">Doğrulama Kodu</label>
          <input
            className="auth-input"
            type="text"
            placeholder="6 haneli kod"
            value={code}
            onChange={(e) => setCode(e.target.value.slice(0, 6))}
            required
            disabled={loading}
            maxLength={6}
            style={{ textAlign: "center", fontSize: "24px", letterSpacing: "8px" }}
          />

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Doğrulanıyor..." : "Doğrula"}
          </button>
        </form>

        <div style={{ marginTop: "15px", textAlign: "center" }}>
          <button
            type="button"
            onClick={handleResendCode}
            disabled={loading}
            style={{
              background: "none",
              border: "none",
              color: "#1976d2",
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: "14px"
            }}
          >
            Kodu tekrar gönder
          </button>
        </div>

        <button className="auth-back" onClick={handleBack}>
          ← Geri
        </button>
      </div>
    </div>
  );
}
