import React from "react";
import "./Home.css";

export default function Home() {
  return (
    <div className="admin-home">
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

      <div className="home-content">
        <h2>Welcome to Super Admin Dashboard</h2>
        <p>Manage your appointment system from here.</p>
      </div>
    </div>
  );
}
