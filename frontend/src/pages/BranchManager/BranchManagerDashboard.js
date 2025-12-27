import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from './Calendar/Calendar';
import EmployeeManagement from './EmployeeManagement/EmployeeManagement';
import ServiceManager from './ServiceManagement/ServiceManager';
import RequestManagement from './RequestManagement/RequestManagement';
import ResourceManager from './ResourceManagement/ResourceManager';
import './BranchManagerDashboard.css';

export default function BranchManagerDashboard() {
    const navigate = useNavigate();
    const [manager, setManager] = useState(null);
    const [pendingAppointments, setPendingAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setManager(user);
            fetchAppointments(user.userId);
        } else {
            navigate('/');
        }
    }, [navigate]);

    const fetchAppointments = async (userId) => {
        try {
            const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
            const token = localStorage.getItem('authToken');

            const res = await fetch(`${BASE_URL}/api/appointments/employee/${userId}`, {
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

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <>
                        <div className="branch-manager-header">
                            <h1>Şube Müdürü Paneli</h1>
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
                );
            case 'calendar':
                return <Calendar />;
            case 'employees':
                return <EmployeeManagement />;
            case 'services':
                return <ServiceManager />;
            case 'requests':
                return <RequestManagement />;
            case 'resources':
                return <ResourceManager />;
            default:
                return <div>Seçilen sayfa bulunamadı.</div>;
        }
    };

    return (
        <div className="branch-manager-page">
            <aside className="branch-manager-sidebar">
                <div className="user-info">
                    <div className="user-name">{manager?.name || 'Şube Müdürü'}</div>
                    <div className="user-email">{manager?.email || ''}</div>
                    <button className="logout-btn" onClick={handleLogout}>
                        Çıkış Yap
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        Anasayfa
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
                        onClick={() => setActiveTab('calendar')}
                    >
                        Takvim
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'requests' ? 'active' : ''}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        Talep Yönetimi
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'employees' ? 'active' : ''}`}
                        onClick={() => setActiveTab('employees')}
                    >
                        Çalışan Yönetimi
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'services' ? 'active' : ''}`}
                        onClick={() => setActiveTab('services')}
                    >
                        Hizmet Yönetimi
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'resources' ? 'active' : ''}`}
                        onClick={() => setActiveTab('resources')}
                    >
                        Kaynak Yönetimi
                    </button>
                </nav>
            </aside>

            <main className="branch-manager-main">
                {renderContent()}
            </main>
        </div>
    );
}
