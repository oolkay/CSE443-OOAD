import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import "./AdminLayout.css";

export default function AdminLayout() {
  const location = useLocation();

  const menuItems = [
    { id: "companies", label: "Companies", path: "/admin/companies", icon: "🏢" },
    { id: "settings", label: "Settings", path: "/admin/settings", icon: "⚙️" },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="logo-circle">
            <span className="logo-icon">👤</span>
          </div>
          <div className="logo-text">+90 (555) 555-55-55</div>
        </div>

        <div className="admin-menu-title">MAIN MENU</div>

        <nav className="admin-menu">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`admin-menu-item ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content area */}
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}
