import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from '../BranchManager/Calendar/Calendar';
import './EmployeeDashboard.css';

function AppointmentMobileCard({ appt, onViewDetails }) {
    return (
        <div className="appt-card-mobile">
            <div className="appt-row">
                <span className="appt-label">Müşteri:</span>
                <span className="appt-value">{appt.customerName}</span>
            </div>
            <div className="appt-row">
                <span className="appt-label">Hizmet:</span>
                <span className="appt-value">{appt.serviceName}</span>
            </div>
            <div className="appt-row">
                <span className="appt-label">Tarih:</span>
                <span className="appt-value">{appt.startTime ? new Date(appt.startTime).toLocaleDateString('tr-TR') : '-'}</span>
            </div>
            <div className="appt-row">
                <span className="appt-label">Saat:</span>
                <span className="appt-value">{appt.startTime ? new Date(appt.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
            </div>
            <button className="view-btn" onClick={onViewDetails}>
                Detaylar
            </button>
        </div>
    );
}

export default function EmployeeDashboard() {
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [pendingAppointments, setPendingAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');

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

    return (
        <div className="employee-page">
            <aside className="employee-sidebar">
                <div className="user-info">
                    <div className="user-name">{employee?.name || 'Çalışan'}</div>
                    <div className="user-email">{employee?.email || ''}</div>
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
                </nav>

                <button className="logout-btn" onClick={handleLogout}>
                    Çıkış Yap
                </button>
            </aside>

            <main className="employee-main">
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
                                        <>
                                            <table className="appt-table desktop-only">
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

                                            <div className="appt-table-mobile mobile-only">
                                                {pendingAppointments.map(appt => (
                                                    <AppointmentMobileCard
                                                        key={appt.appointmentId}
                                                        appt={appt}
                                                        onViewDetails={() => setActiveTab('calendar')}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <Calendar />
                )}
            </main>
        </div>
    );
}
