import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './BranchManagerLayout.css';

export default function BranchManagerLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [manager, setManager] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setManager(JSON.parse(userStr));
        } else {
            navigate('/');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        navigate('/');
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const toggleSidebarCollapse = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const handleMenuClick = (path) => {
        navigate(path);
        setIsMobileMenuOpen(false);
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
                            <span className="logo-icon">🏢</span>
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="user-info">
                                <div className="user-name">{manager?.name || 'Şube Müdürü'}</div>
                                <div className="user-email">{manager?.email || ''}</div>
                            </div>
                        )}
                    </div>
                    {/* Desktop collapse button */}
                    <button className="sidebar-collapse-btn" onClick={toggleSidebarCollapse} title={isSidebarCollapsed ? "Expand" : "Collapse"}>
                        {isSidebarCollapsed ? "›" : "‹"}
                    </button>
                </div>

                <nav className="admin-menu">
                    <button
                        onClick={() => handleMenuClick('/calendar')}
                        className={`admin-menu-item ${location.pathname === '/calendar' ? "active" : ""}`}
                    >
                        <span className="menu-icon">📅</span>
                        {!isSidebarCollapsed && <span className="menu-label">Takvim</span>}
                    </button>
                    <button
                        onClick={() => handleMenuClick('/employee-management')}
                        className={`admin-menu-item ${location.pathname === '/employee-management' ? "active" : ""}`}
                    >
                        <span className="menu-icon">👥</span>
                        {!isSidebarCollapsed && <span className="menu-label">Çalışan Yönetimi</span>}
                    </button>
                    <button
                        onClick={() => handleMenuClick('/service-management')}
                        className={`admin-menu-item ${location.pathname === '/service-management' ? "active" : ""}`}
                    >
                        <span className="menu-icon">🛠️</span>
                        {!isSidebarCollapsed && <span className="menu-label">Hizmet Yönetimi</span>}
                    </button>
                    <button
                        onClick={() => handleMenuClick('/request-management')}
                        className={`admin-menu-item ${location.pathname === '/request-management' ? "active" : ""}`}
                    >
                        <span className="menu-icon">📝</span>
                        {!isSidebarCollapsed && <span className="menu-label">Talep Yönetimi</span>}
                    </button>
                    <button
                        onClick={() => handleMenuClick('/resource-management')}
                        className={`admin-menu-item ${location.pathname === '/resource-management' ? "active" : ""}`}
                    >
                        <span className="menu-icon">📦</span>
                        {!isSidebarCollapsed && <span className="menu-label">Kaynak Yönetimi</span>}
                    </button>
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
                    <button className="btn-logout" onClick={handleLogout} title="Çıkış Yap">
                        <span className="logout-icon">⎋</span>
                    </button>
                </header>
                <Outlet />
            </div>
        </div>
    );
}
