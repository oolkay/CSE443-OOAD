import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "./AdminLayout.css";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ name: "Loading..." });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const menuItems = [
    { id: "home", label: "Dashboard", path: "/admin/home", icon: "🏠" },
    { id: "companies", label: "Companies", path: "/admin/companies", icon: "🏢" },
    { id: "super-admins", label: "SuperAdmins", path: "/admin/super-admins", icon: "👥" },
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

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
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
      <aside className={`admin-sidebar ${isMobileMenuOpen ? "mobile-open" : ""} ${isSidebarCollapsed ? "collapsed" : ""}`}>
        <div className="admin-header">
          <button className="mobile-close-btn" onClick={toggleMobileMenu}>
            ✕
          </button>
          <div className="admin-logo">
            <div className="logo-circle">
              <span className="logo-icon">👤</span>
            </div>
            {!isSidebarCollapsed && (
              <div className="user-info">
                <div className="user-name">{userInfo.name}</div>
                <div className="user-email">{userInfo.email}</div>
              </div>
            )}
          </div>
          {/* Desktop collapse button */}
          <button className="sidebar-collapse-btn" onClick={toggleSidebarCollapse} title={isSidebarCollapsed ? "Expand" : "Collapse"}>
            {isSidebarCollapsed ? "›" : "‹"}
          </button>
        </div>

        <nav className="admin-menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.path)}
              className={`admin-menu-item ${
                location.pathname === item.path ? "active" : ""
              }`}
              title={item.label}
            >
              <span className="menu-icon">{item.icon}</span>
              {!isSidebarCollapsed && <span className="menu-label">{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div className={`mobile-overlay ${isMobileMenuOpen ? 'show' : ''}`} onClick={toggleMobileMenu} />
      )}

      {/* Main content area */}
      <div className={`admin-main ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        {/* Header with logout button */}
        <header className="admin-page-header">
          <div className="header-spacer"></div>
          <button className="btn-logout" onClick={handleLogout} title="Logout">
            <span className="logout-icon">⎋</span>
          </button>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
