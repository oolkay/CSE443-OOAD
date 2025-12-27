import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from '../BranchManager/Calendar/Calendar';
import '../Admin/AdminLayout.css';
import './EmployeeDashboard.css'; // Keep existing specific styles if any, but override layout

export default function EmployeeDashboard() {
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [pendingAppointments, setPendingAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setEmployee(user);
            fetchAppointments(user.userId);
        } else {
            navigate('/');
        }
    }, [navigate]);

    const fetchAppointments = async (employeeId) => {
        try {
            const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
            const token = localStorage.getItem('authToken');

            const res = await fetch(`${BASE_URL}/api/appointments/employee/${employeeId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const appointments = await res.json();
                const pending = appointments.filter(a => a.status === 'PENDING');
                setPendingAppointments(pending);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

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
                            <span className="logo-icon">👷</span>
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="user-info">
                                <div className="user-name">{employee?.name || 'Çalışan'}</div>
                                <div className="user-email">{employee?.email || ''}</div>
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
                        className={`admin-menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
                    >
                        <span className="menu-icon">🏠</span>
                        {!isSidebarCollapsed && <span className="menu-label">Anasayfa</span>}
                    </button>
                    <button
                        className={`admin-menu-item ${activeTab === 'calendar' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('calendar'); setIsMobileMenuOpen(false); }}
                    >
                        <span className="menu-icon">📅</span>
                        {!isSidebarCollapsed && <span className="menu-label">Takvim</span>}
                    </button>
                </nav>
            </aside>

            {/* Mobile overlay */}
            {isMobileMenuOpen && (
                <div className={`mobile-overlay ${isMobileMenuOpen ? 'show' : ''}`} onClick={toggleMobileMenu} />
            )}

            {/* Main content area */}
            <div className={`admin-main ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
                <header className="admin-page-header">
                    <div className="header-spacer"></div>
                    <button className="btn-logout" onClick={handleLogout} title="Çıkış Yap">
                        <span className="logout-icon">⎋</span>
                    </button>
                </header>
                
                <div style={{ padding: '20px' }}>
                    {activeTab === 'dashboard' ? (
                        <>
                            <div className="employee-header">
                                <h1>Çalışan Paneli</h1>
                            </div>

                            {loading ? (
                                <div className="loading-state">Yükleniyor...</div>
                            ) : (
                                <>
                                    <div className="stats-row">
                                        <div className="stat-card">
                                            <div className="stat-label">Bekleyen Talep</div>
                                            <div className="stat-value">{pendingAppointments.length}</div>
                                        </div>
                                    </div>

                                    <div className="card">
                                        <h3>Bekleyen Talepler</h3>
                                        {pendingAppointments.length === 0 ? (
                                            <p className="empty-message">Bekleyen talep bulunmuyor.</p>
                                        ) : (
                                            <table className="appt-table">
                                                <thead>
                                                    <tr>
                                                        <th>Müşteri</th>
                                                        <th>Hizmet</th>
                                                        <th>Tarih</th>
                                                        <th>Saat</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {pendingAppointments.map(appt => (
                                                        <tr key={appt.appointmentId}>
                                                            <td>{appt.customerName}</td>
                                                            <td>{appt.serviceName}</td>
                                                            <td>{appt.startTime ? new Date(appt.startTime).toLocaleDateString('tr-TR') : '-'}</td>
                                                            <td>{appt.startTime ? new Date(appt.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                                            <td>
                                                                <button
                                                                    className="view-btn"
                                                                    onClick={() => setActiveTab('calendar')}
                                                                >
                                                                    Detaylar
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <Calendar />
                    )}
                </div>
            </div>
        </div>
    );
}
