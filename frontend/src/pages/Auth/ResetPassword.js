import React, { useState } from 'react';
import './Auth.css';

export default function ResetPassword() {
  const [email, setEmail] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    // TODO: integrate with backend to send reset code
    alert(`Reset code sent to ${email}`);
  };

  const handleBack = () => {
    // simple back behavior
    window.history.back();
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Reset Your Password</h2>
        <p className="auth-desc">Enter your registered email address and we will send you password reset instructions.</p>

        <form className="auth-form" onSubmit={handleSend}>
          <label className="auth-label">E-mail</label>
          <input
            className="auth-input"
            type="email"
            placeholder="e-mail@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" className="auth-button">Send Code</button>
        </form>

        <button className="auth-back" onClick={handleBack}>← Back</button>
      </div>
    </div>
  );
}
