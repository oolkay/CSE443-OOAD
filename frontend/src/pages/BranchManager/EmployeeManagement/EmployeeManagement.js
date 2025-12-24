import React, { useState, useEffect } from 'react';
import './EmployeeManagement.css';
import employeeService from '../../../services/employeeService';
import serviceService from '../../../services/serviceService'; // We need services list too
import ToastNotification from '../../../components/UI/ToastNotification';
import ConfirmationModal from '../../../components/UI/ConfirmationModal';

const EmployeeManager = () => {
    const DAYS_ORDER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

    // Varsayılan boş program (Yeni çalışan için - Sadece UI için)
    const DEFAULT_SCHEDULE = {
        Pazartesi: { active: true, start: '09:00', end: '18:00' },
        Salı: { active: true, start: '09:00', end: '18:00' },
        Çarşamba: { active: true, start: '09:00', end: '18:00' },
        Perşembe: { active: true, start: '09:00', end: '18:00' },
        Cuma: { active: true, start: '09:00', end: '18:00' },
        Cumartesi: { active: true, start: '10:00', end: '16:00' },
        Pazar: { active: false, start: '09:00', end: '18:00' }
    };

    // --- STATE ---
    const [employees, setEmployees] = useState([]);
    const [services, setServices] = useState([]); // Available services
    const [loading, setLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);

    // Form Verisi
    const initialFormState = {
        name: '',
        email: '',
        password: '', // Password is required for creation
        role: 'Employee',
        status: 'Active',
        companyId: 1, // Hardcoded for now, should come from context/auth
        serviceIds: [],
        schedule: JSON.parse(JSON.stringify(DEFAULT_SCHEDULE))
    };
    const [formData, setFormData] = useState(initialFormState);

    // --- FETCH DATA ---
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [empData, srvData] = await Promise.all([
                employeeService.getAllEmployees(),
                serviceService.getAllServices()
            ]);

            // Map backend response to frontend structure
            const mappedEmployees = empData.map(emp => ({
                ...emp,
                // Default schedule for UI if not present (backend doesn't verify this)
                schedule: DEFAULT_SCHEDULE,
                serviceIds: emp.assignedServices ? emp.assignedServices.map(s => s.id) : [],
                serviceNames: emp.assignedServices ? emp.assignedServices.map(s => s.name) : []
            }));

            setEmployees(mappedEmployees);
            setServices(srvData);
        } catch (error) {
            console.error("Error fetching data:", error);
            showToast('Veriler yüklenirken hata oluştu.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    // --- HANDLERS ---

    const openDetailModal = (employee) => {
        setSelectedEmployee(employee);
        setIsDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedEmployee(null);
    };

    const openFormModal = (employee = null) => {
        if (isDetailModalOpen) setIsDetailModalOpen(false);

        if (employee) {
            setIsEditing(true);
            setCurrentId(employee.id);
            setFormData({
                name: employee.name,
                email: employee.email,
                password: '', // Don't allow editing password directly here or leave empty to keep same
                role: employee.role || 'Employee', // Backend might not send role yet if not User entity field
                status: employee.status || 'Active',
                companyId: employee.companyId || 1,
                serviceIds: employee.serviceIds || [],
                schedule: JSON.parse(JSON.stringify(DEFAULT_SCHEDULE))
            });
        } else {
            setIsEditing(false);
            setCurrentId(null);
            setFormData(initialFormState);
        }
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Schedule UI Only
    const handleScheduleChange = (day, field, value) => {
        setFormData(prev => ({
            ...prev,
            schedule: {
                ...prev.schedule,
                [day]: {
                    ...prev.schedule[day],
                    [field]: value
                }
            }
        }));
    };

    const handleServiceToggle = (serviceId) => {
        setFormData(prev => {
            const currentIds = prev.serviceIds || [];
            if (currentIds.includes(serviceId)) {
                return { ...prev, serviceIds: currentIds.filter(id => id !== serviceId) };
            } else {
                return { ...prev, serviceIds: [...currentIds, serviceId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic Validation
        if (!formData.name || !formData.email) {
            showToast('Lütfen zorunlu alanları doldurun.', 'error');
            return;
        }

        if (!isEditing && !formData.password) {
            showToast('Yeni çalışan için şifre gereklidir.', 'error');
            return;
        }

        const payload = {
            name: formData.name,
            email: formData.email,
            password: formData.password || null, // Send null if empty string
            companyId: formData.companyId,
            serviceIds: formData.serviceIds
            // schedule ignored
        };

        // If editing and password is empty, don't send it (or backend should handle null)
        // Adjust for backend expectation: if password field is present it might update.
        // For security, usually update password is valid. If empty string, maybe skip?
        // Backend `updateEmployee` encodes password if present.
        // Password is now optional for editing on backend.
        // If isEditing and password is null, backend will ignore it.
        // If !isEditing and password is null, backend will throw error.


        try {
            if (isEditing) {
                // For update, we might need a workaround if DTO requires password but we don't want to change it.
                // But since DTO @NotBlank is there, user MUST enter password.
                await employeeService.updateEmployee(currentId, payload);
                showToast('Çalışan başarıyla güncellendi.');
            } else {
                await employeeService.createEmployee(payload);
                showToast('Yeni çalışan başarıyla oluşturuldu.');
            }
            fetchData();
            closeFormModal();
        } catch (error) {
            console.error("Save error:", error);
            const data = error.data || error.response?.data;
            let errMsg = 'Bir hata oluştu.';

            if (data?.validationErrors) {
                console.log("Validation Errors:", data.validationErrors); // Konsola da bastır
                // Hataları birleştirip göster
                errMsg = Object.values(data.validationErrors).join('. ');
            } else {
                errMsg = data?.message || error.message || errMsg;
            }
            showToast(errMsg, 'error');
        }
    };

    const initiateDelete = (id) => {
        setEmployeeToDelete(id);
        setIsDeleteModalOpen(true);
        setIsDetailModalOpen(false);
    };

    const confirmDelete = async () => {
        if (!employeeToDelete) return;

        try {
            await employeeService.deleteEmployee(employeeToDelete);
            showToast('Çalışan başarıyla silindi.');
            fetchData();
        } catch (error) {
            console.error("Delete error:", error);
            const errMsg = error.response?.data?.message || error.message || 'Silme işlemi başarısız.';
            showToast(errMsg, 'error');
        } finally {
            setIsDeleteModalOpen(false);
            setEmployeeToDelete(null);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="layout-container">
            {toast.show && (
                <ToastNotification
                    toasts={[{ id: Date.now(), message: toast.message, type: toast.type }]}
                    removeToast={() => setToast({ show: false, message: '', type: '' })}
                />
            )}

            <header className="main-header">
                <h1>Çalışan Yönetimi</h1>
                <p>Profilleri ve günlük programları yönetin.</p>
            </header>

            <div className="action-bar">
                <div className="search-wrapper">
                    <input
                        type="text" placeholder="Ara..." className="search-input"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn-add" onClick={() => openFormModal(null)}>+ Yeni Ekle</button>
            </div>

            {/* LISTE */}
            <div className="table-card">
                {loading ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>Yükleniyor...</div>
                ) : (
                    <div className="table-responsive">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>ÇALIŞAN ADI</th>
                                    <th style={{ textAlign: 'right', color: '#9ca3af', fontWeight: 'normal' }}>Detaylar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.length > 0 ? filteredEmployees.map(emp => (
                                    <tr key={emp.id} onClick={() => openDetailModal(emp)} className="clickable-row">
                                        <td>
                                            <div className="emp-name-cell">
                                                <span className="avatar-placeholder">{emp.name.charAt(0).toUpperCase()}</span>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span className="fw-bold">{emp.name}</span>
                                                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{emp.companyName || 'Şirket Yok'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}><span className="arrow-icon">›</span></td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="2" style={{ textAlign: 'center', padding: '20px' }}>Kayıtlı çalışan bulunamadı.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* --- DETAIL MODAL --- */}
            {isDetailModalOpen && selectedEmployee && (
                <div className="modal-overlay" onClick={closeDetailModal}>
                    <div className="modal-content detail-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Detaylar</h2>
                            <button className="close-btn" onClick={closeDetailModal}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-avatar-large">{selectedEmployee.name.charAt(0).toUpperCase()}</div>
                            <h3 className="detail-name">{selectedEmployee.name}</h3>
                            <p className="detail-role">{selectedEmployee.email}</p>

                            <div className="detail-divider"></div>

                            {/* Detaylı Program Görünümü (Sadece UI) */}
                            <div className="detail-section">
                                <span className="label-block" style={{ textAlign: 'center', marginBottom: '10px' }}>Haftalık Program (Temsili)</span>
                                <div className="schedule-list-view">
                                    {DAYS_ORDER.map(day => {
                                        const s = selectedEmployee.schedule[day];
                                        if (!s || !s.active) return null;
                                        return (
                                            <div key={day} className="schedule-list-item">
                                                <span className="sched-day">{day}</span>
                                                <span className="sched-time">{s.start} - {s.end}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="detail-divider"></div>

                            <div className="detail-section">
                                <span className="label-block">Hizmetler:</span>
                                <div className="tags-container" style={{ justifyContent: 'center' }}>
                                    {selectedEmployee.serviceNames && selectedEmployee.serviceNames.length > 0 ?
                                        selectedEmployee.serviceNames.map((s, i) => <span key={i} className="service-tag">{s}</span>)
                                        : <span className="text-muted" style={{ fontSize: '0.9rem' }}>Hizmet atanmamış.</span>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-delete" onClick={() => initiateDelete(selectedEmployee.id)}>Sil</button>
                            <button className="btn-edit" onClick={() => openFormModal(selectedEmployee)}>Düzenle</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- FORM MODAL --- */}
            {isFormModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{isEditing ? 'Çalışanı Düzenle' : 'Yeni Çalışan'}</h2>
                            <button className="close-btn" onClick={closeFormModal}>&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form-flex">
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Tam Ad</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>E-posta</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Şifre {isEditing && <span style={{ fontWeight: 'normal', fontSize: '0.8rem' }}>(Değiştirmek için giriniz)</span>}</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder={isEditing ? "Değişmeyecekse boş bırakın" : ""} required={!isEditing} />
                                </div>

                                {/* YENİ: GÜNLÜK ÇALIŞMA SAATLERİ (SADECE UI) */}
                                <div className="form-section-title">Haftalık Program (Temsili)</div>
                                <div className="schedule-editor-container">
                                    {DAYS_ORDER.map(day => {
                                        const dayData = formData.schedule[day];
                                        return (
                                            <div key={day} className={`schedule-row ${dayData.active ? 'active' : 'inactive'}`}>
                                                <div className="schedule-col-day">
                                                    <label className="switch-label">
                                                        <input
                                                            type="checkbox"
                                                            checked={dayData.active}
                                                            onChange={(e) => handleScheduleChange(day, 'active', e.target.checked)}
                                                        />
                                                        <span className="day-name">{day}</span>
                                                    </label>
                                                </div>

                                                <div className="schedule-col-inputs">
                                                    {dayData.active ? (
                                                        <>
                                                            <input
                                                                type="time"
                                                                value={dayData.start}
                                                                onChange={(e) => handleScheduleChange(day, 'start', e.target.value)}
                                                                className="mini-time-input"
                                                            />
                                                            <span className="separator">-</span>
                                                            <input
                                                                type="time"
                                                                value={dayData.end}
                                                                onChange={(e) => handleScheduleChange(day, 'end', e.target.value)}
                                                                className="mini-time-input"
                                                            />
                                                        </>
                                                    ) : (
                                                        <span className="closed-text">Kapalı</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="form-section-title" style={{ marginTop: '1.5rem' }}>Hizmetler</div>
                                <div className="skills-grid">
                                    {services.map(srv => (
                                        <label key={srv.id} className={`skill-check-label ${formData.serviceIds.includes(srv.id) ? 'selected' : ''}`}>
                                            <input type="checkbox" checked={formData.serviceIds.includes(srv.id)} onChange={() => handleServiceToggle(srv.id)} />
                                            {srv.name}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" onClick={closeFormModal} className="btn-cancel">İptal</button>
                                <button type="submit" className="btn-save">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Çalışanı Sil"
                message="Bu çalışanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
                type="danger"
            />
        </div>
    );
};

export default EmployeeManager;