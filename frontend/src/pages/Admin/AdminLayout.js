import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import "./AdminLayout.css";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ name: "Loading..." });
  const [activeTab, setActiveTab] = useState("dashboard");

  const menuItems = [
    { id: "home", label: "Adminler", path: "/admin/home" },
    { id: "companies", label: "Şirketler", path: "/admin/companies" },
  ];

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setUserInfo({ name: user.name, email: user.email });
    }
  }, []);

  useEffect(() => {
    const currentPath = location.pathname;
    const foundItem = menuItems.find(item => currentPath.includes(item.path));
    if (foundItem) {
      setActiveTab(foundItem.id);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    navigate("/");
  };

  const handleMenuClick = (item) => {
    navigate(item.path);
    setActiveTab(item.id);
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="user-info">
          <div className="user-name">{userInfo.name}</div>
          <div className="user-email">{userInfo.email}</div>
          <button className="logout-btn" onClick={handleLogout}>
            Çıkış Yap
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleMenuClick(item)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
