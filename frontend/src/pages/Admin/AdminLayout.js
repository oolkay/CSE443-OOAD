import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "./AdminLayout.css";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ name: "Loading..." });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: "home", label: "Dashboard", path: "/admin/home", icon: "🏠" },
    { id: "companies", label: "Companies", path: "/admin/companies", icon: "🏢" },
    { id: "settings", label: "Settings", path: "/admin/settings", icon: "⚙️" },
  ];

  // Fetch user info from database (mock for now, replace with real API call)
  useEffect(() => {
    // In real implementation, fetch from API:
    // fetch('/api/super-admin/profile')
    //   .then(res => res.json())
    //   .then(data => setUserInfo(data))

    // Mock data for now
    setTimeout(() => {
      setUserInfo({ name: "Super Admin", email: "admin@appointment.com" });
    }, 1000);
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      // Clear auth tokens/session
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
      navigate("/");
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMenuClick = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  return (
    <div className="admin-layout">
      {/* Mobile menu toggle button */}
      <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
        ☰
      </button>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="admin-header">
          <button className="mobile-close-btn" onClick={toggleMobileMenu}>
            ✕
          </button>
          <div className="admin-logo">
            <div className="logo-circle">
              <span className="logo-icon">👤</span>
            </div>
            <div className="user-info">
              <div className="user-name">{userInfo.name}</div>
              <div className="user-email">{userInfo.email}</div>
            </div>
          </div>
        </div>

        <nav className="admin-menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.path)}
              className={`admin-menu-item ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </button>
          ))}
        </nav>

        </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div className={`mobile-overlay ${isMobileMenuOpen ? 'show' : ''}`} onClick={toggleMobileMenu} />
      )}

      {/* Main content area */}
      <div className="admin-main">
        {/* Header with logout button */}
        <div className="admin-header-top">
          <div className="header-right">
            <button className="header-logout-btn" onClick={handleLogout} title="Logout">
              <span className="logout-icon">🚪</span>
              <span className="logout-text">Logout</span>
            </button>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
