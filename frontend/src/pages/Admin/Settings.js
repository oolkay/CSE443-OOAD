import React from "react";
import "./Settings.css";

export default function Settings() {
  return (
    <div className="admin-settings">
      <header className="companies-header">
        <div className="header-left">
          <span className="menu-icon">☰</span>
          <h1 className="header-title">
            Hi, Rabia <span className="wave">👋</span>
          </h1>
        </div>
        <div className="header-right">
          <button className="icon-btn">🔔</button>
        </div>
      </header>

      <div className="settings-content">
        <h2>Settings</h2>
        <p>Configure your system settings here.</p>
      </div>
    </div>
  );
}
