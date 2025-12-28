import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from '../BranchManager/Calendar/Calendar';
import ConflictConfirmationModal from '../../components/UI/ConflictConfirmationModal';
import ToastNotification from '../../components/UI/ToastNotification';
import appointmentService from '../../services/appointmentService';
import './EmployeeDashboard.css';

function AppointmentMobileCard({ appt, onViewDetails, onApprove, onReject }) {
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
            <div className="appt-actions">
                <button className="btn-approve" onClick={() => onApprove(appt)}>
                    Onayla
                </button>
                <button className="btn-reject" onClick={() => onReject(appt)}>
                    Reddet
                </button>
                <button className="view-btn" onClick={onViewDetails}>
                    Detaylar
                </button>
            </div>
        </div>
    );
}

export default function EmployeeDashboard() {
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
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

    const fetchAppointments = React.useCallback(async (employeeId) => {
        try {
            const appointments = await appointmentService.getEmployeeAppointments(employeeId);
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
            setEmployee(user);
            fetchAppointments(user.userId);
        } else {
            navigate('/');
        }
    }, [navigate, fetchAppointments]);

    const handleApprove = async (appointment) => {
        try {
            // Check for conflicts
            const conflicts = await appointmentService.getConflictingAppointments(
                employee.userId,
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
            await appointmentService.approveAppointment(employee.userId, apptToApprove.appointmentId);

            addToast('success', 'Randevu başarıyla onaylandı ve müşteriye bilgilendirme maili gönderildi');

            // Close modal and refresh
            setIsConfirmModalOpen(false);
            setSelectedAppointment(null);
            setConflictingAppointments([]);
            fetchAppointments(employee.userId);
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
            await appointmentService.rejectAppointment(employee.userId, appointment.appointmentId);
            addToast('success', 'Randevu reddedildi ve müşteriye bilgilendirme maili gönderildi');
            fetchAppointments(employee.userId);
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
                                                        <th>İşlemler</th>
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
                                                                    <button
                                                                        className="view-btn"
                                                                        onClick={() => setActiveTab('calendar')}
                                                                    >
                                                                        Detaylar
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
                                                        onViewDetails={() => setActiveTab('calendar')}
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
                ) : (
                    <Calendar />
                )}
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
