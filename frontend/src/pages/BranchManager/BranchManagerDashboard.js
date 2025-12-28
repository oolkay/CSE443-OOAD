import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from './Calendar/Calendar';
import EmployeeManagement from './EmployeeManagement/EmployeeManagement';
import ServiceManager from './ServiceManagement/ServiceManager';
import ResourceManager from './ResourceManagement/ResourceManager';
import ConflictConfirmationModal from '../../components/UI/ConflictConfirmationModal';
import ToastNotification from '../../components/UI/ToastNotification';
import appointmentService from '../../services/appointmentService';
import './BranchManagerDashboard.css';

function AppointmentMobileCard({ appt, onApprove, onReject }) {
    return (
        <div className="appt-card-mobile">
            <div className="appt-row">
                <span className="appt-label">Müşteri:</span>
                <span className="appt-value">{appt.customerName}</span>
            </div>
            <div className="appt-row">
                <span className="appt-label">Çalışan:</span>
                <span className="appt-value">{appt.employeeName}</span>
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
            <div className="appt-actions">
                <button className="btn-approve" onClick={() => onApprove(appt)}>
                    Onayla
                </button>
                <button className="btn-reject" onClick={() => onReject(appt)}>
                    Reddet
                </button>
            </div>
        </div>
    );
}

export default function BranchManagerDashboard() {
    const navigate = useNavigate();
    const [manager, setManager] = useState(null);
    const [pendingAppointments, setPendingAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');

    // Conflict and approval state
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [conflictingAppointments, setConflictingAppointments] = useState([]);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [toasts, setToasts] = useState([]);

    const addToast = (type, message) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, type, message }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const fetchAppointments = React.useCallback(async (managerId) => {
        try {
            const appointments = await appointmentService.getCompanyAppointments(managerId);
            // Filter pending and sort by startTime (ascending)
            const pending = appointments
                .filter(a => a.status === 'PENDING')
                .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
            setPendingAppointments(pending);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            addToast('error', 'Randevular yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setManager(user);
            fetchAppointments(user.userId);
        } else {
            navigate('/');
        }
    }, [navigate, fetchAppointments]);

    const handleApprove = async (appointment) => {
        try {
            // Check for conflicts using the manager endpoint
            const conflicts = await appointmentService.getConflictingAppointmentsForManager(
                manager.userId,
                appointment.employeeId,
                appointment.startTime,
                appointment.endTime
            );

            // Filter out the current appointment itself
            const actualConflicts = conflicts.filter(c => c.appointmentId !== appointment.appointmentId);

            if (actualConflicts.length > 0) {
                // Show conflict modal
                setSelectedAppointment(appointment);
                setConflictingAppointments(actualConflicts);
                setIsConfirmModalOpen(true);
            } else {
                // No conflicts, approve directly
                await confirmApprove(appointment);
            }
        } catch (error) {
            console.error('Error checking conflicts:', error);
            addToast('error', error.message || 'Çakışma kontrolü sırasında hata oluştu');
        }
    };

    const confirmApprove = async (appointment) => {
        try {
            const apptToApprove = appointment || selectedAppointment;
            await appointmentService.approveAppointmentAsManager(
                apptToApprove.employeeId,
                apptToApprove.appointmentId
            );

            addToast('success', 'Randevu başarıyla onaylandı ve müşteriye bilgilendirme maili gönderildi');

            // Close modal and refresh
            setIsConfirmModalOpen(false);
            setSelectedAppointment(null);
            setConflictingAppointments([]);
            fetchAppointments(manager.userId);
        } catch (error) {
            console.error('Error approving appointment:', error);
            addToast('error', error.message || 'Randevu onaylanırken hata oluştu');
        }
    };

    const handleReject = async (appointment) => {
        if (!window.confirm('Bu randevuyu reddetmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            await appointmentService.rejectAppointmentAsManager(
                appointment.employeeId,
                appointment.appointmentId
            );
            addToast('success', 'Randevu reddedildi ve müşteriye bilgilendirme maili gönderildi');
            fetchAppointments(manager.userId);
        } catch (error) {
            console.error('Error rejecting appointment:', error);
            addToast('error', error.message || 'Randevu reddedilirken hata oluştu');
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
                                        <>
                                            <table className="appt-table desktop-only">
                                                <thead>
                                                    <tr>
                                                        <th>Müşteri</th>
                                                        <th>Çalışan</th>
                                                        <th>Hizmet</th>
                                                        <th>Tarih</th>
                                                        <th>Saat</th>
                                                        <th>İşlemler</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {pendingAppointments.map(appt => (
                                                        <tr key={appt.appointmentId}>
                                                            <td>{appt.customerName}</td>
                                                            <td>{appt.employeeName}</td>
                                                            <td>{appt.serviceName}</td>
                                                            <td>{appt.startTime ? new Date(appt.startTime).toLocaleDateString('tr-TR') : '-'}</td>
                                                            <td>{appt.startTime ? new Date(appt.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                                            <td>
                                                                <div className="table-actions">
                                                                    <button
                                                                        className="btn-approve"
                                                                        onClick={() => handleApprove(appt)}
                                                                    >
                                                                        Onayla
                                                                    </button>
                                                                    <button
                                                                        className="btn-reject"
                                                                        onClick={() => handleReject(appt)}
                                                                    >
                                                                        Reddet
                                                                    </button>
                                                                </div>
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
                                                        onApprove={handleApprove}
                                                        onReject={handleReject}
                                                    />
                                                ))}
                                            </div>
                                        </>
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

            {/* Conflict Confirmation Modal */}
            <ConflictConfirmationModal
                isOpen={isConfirmModalOpen}
                conflicts={conflictingAppointments}
                onConfirm={() => confirmApprove()}
                onCancel={() => {
                    setIsConfirmModalOpen(false);
                    setSelectedAppointment(null);
                    setConflictingAppointments([]);
                }}
            />

            {/* Toast Notifications */}
            {toasts.map(toast => (
                <ToastNotification
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
}
