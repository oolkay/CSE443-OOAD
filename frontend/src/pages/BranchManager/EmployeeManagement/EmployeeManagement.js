import React, { useState } from 'react';
import './EmployeeManagement.css';

const EmployeeManager = () => {
    // --- SABİTLER ---
    const MOCK_SERVICES = [
        { id: 1, name: 'Saç Kesimi' },
        { id: 2, name: 'Sakal Tıraşı' },
        { id: 3, name: 'Saç Boyama' },
        { id: 4, name: 'Cilt Bakımı' },
        { id: 5, name: 'Fön' },
        { id: 6, name: 'Damat Tıraşı' },
        { id: 7, name: 'Maske' }
    ];

    const DAYS_ORDER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    
    // Varsayılan boş program (Yeni çalışan için)
    const DEFAULT_SCHEDULE = {
        Pazartesi: { active: true, start: '09:00', end: '18:00' },
        Salı: { active: true, start: '09:00', end: '18:00' },
        Çarşamba: { active: true, start: '09:00', end: '18:00' },
        Perşembe: { active: true, start: '09:00', end: '18:00' },
        Cuma: { active: true, start: '09:00', end: '18:00' },
        Cumartesi: { active: true, start: '10:00', end: '16:00' },
        Pazar: { active: false, start: '09:00', end: '18:00' }  
    };

    const MOCK_EMPLOYEES = [
        { 
            id: 101, 
            name: 'Ayşe Yılmaz', 
            email: 'ayse.yilmaz@example.com', 
            role: 'Employee',
            status: 'Active',
            serviceIds: [1, 2], 
            serviceNames: ['Saç Kesimi', 'Sakal Tıraşı'],
            // YENİ DATA YAPISI: schedule objesi
            schedule: { ...DEFAULT_SCHEDULE } 
        },
        { 
            id: 102, 
            name: 'Mehmet Can', 
            email: 'mehmet.can@example.com', 
            role: 'Manager',
            status: 'Active',
            serviceIds: [3, 4], 
            serviceNames: ['Saç Boyama', 'Cilt Bakımı'],
            schedule: {
                ...DEFAULT_SCHEDULE,
                Mon: { active: false, start: '09:00', end: '18:00' }, // Pazartesi izinli
                Sat: { active: true, start: '12:00', end: '20:00' }   // Cumartesi geç mesai
            }
        },
        { 
            id: 103, 
            name: 'Zeynep Demir', 
            email: 'zeynep.demir@example.com', 
            role: 'Receptionist',
            status: 'Off Duty',
            serviceIds: [], 
            serviceNames: [],
            schedule: { ...DEFAULT_SCHEDULE }
        }
    ];

    // --- STATE ---
    const [employees, setEmployees] = useState(MOCK_EMPLOYEES);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form Verisi
    const initialFormState = {
        name: '',
        email: '',
        role: 'Employee',
        status: 'Active',
        serviceIds: [],
        schedule: JSON.parse(JSON.stringify(DEFAULT_SCHEDULE)) // Deep copy
    };
    const [formData, setFormData] = useState(initialFormState);

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
                role: employee.role || 'Employee',
                status: employee.status || 'Active',
                serviceIds: employee.serviceIds || [],
                schedule: employee.schedule ? JSON.parse(JSON.stringify(employee.schedule)) : JSON.parse(JSON.stringify(DEFAULT_SCHEDULE))
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

    // --- YENİ: Schedule Değişiklik Handler'ı ---
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

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const selectedServiceNames = MOCK_SERVICES
            .filter(s => formData.serviceIds.includes(s.id))
            .map(s => s.name);

        const employeeData = { ...formData, serviceNames: selectedServiceNames };

        if (isEditing) {
            setEmployees(prev => prev.map(emp => 
                emp.id === currentId ? { ...emp, id: currentId, ...employeeData } : emp
            ));
        } else {
            const newId = Math.floor(Math.random() * 100000);
            setEmployees([...employees, { id: newId, ...employeeData }]);
        }
        closeFormModal();
    };

    const handleDelete = (id) => {
        if (window.confirm('Bu çalışanı silmek istediğinizden emin misiniz?')) {
            setEmployees(employees.filter(emp => emp.id !== id));
            closeDetailModal();
        }
    };

    const filteredEmployees = employees.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="layout-container">
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
                <div className="table-responsive">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>ÇALIŞAN ADI</th>
                                <th style={{textAlign:'right', color:'#9ca3af', fontWeight:'normal'}}>Detaylar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map(emp => (
                                <tr key={emp.id} onClick={() => openDetailModal(emp)} className="clickable-row">
                                    <td>
                                        <div className="emp-name-cell">
                                            <span className="avatar-placeholder">{emp.name.charAt(0)}</span>
                                            <span className="fw-bold">{emp.name}</span>
                                        </div>
                                    </td>
                                    <td style={{textAlign:'right'}}><span className="arrow-icon">›</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
                            <div className="detail-avatar-large">{selectedEmployee.name.charAt(0)}</div>
                            <h3 className="detail-name">{selectedEmployee.name}</h3>
                            <p className="detail-role">{selectedEmployee.role}</p>
                            
                            <div className="detail-divider"></div>

                            {/* Detaylı Program Görünümü */}
                            <div className="detail-section">
                                <span className="label-block" style={{textAlign:'center', marginBottom:'10px'}}>Haftalık Program</span>
                                <div className="schedule-list-view">
                                    {DAYS_ORDER.map(day => {
                                        const s = selectedEmployee.schedule[day];
                                        if (!s.active) return null; // İzinli günleri gösterme (veya gri göster)
                                        return (
                                            <div key={day} className="schedule-list-item">
                                                <span className="sched-day">{day}</span>
                                                <span className="sched-time">{s.start} - {s.end}</span>
                                            </div>
                                        );
                                    })}
                                    {/* Hiç aktif gün yoksa */}
                                    {Object.values(selectedEmployee.schedule).every(d => !d.active) && (
                                        <div className="text-muted">Aktif vardiya yok.</div>
                                    )}
                                </div>
                            </div>

                            <div className="detail-divider"></div>

                            <div className="detail-info-row">
                                <span className="label">Durum:</span>
                                <span className={`status-badge ${selectedEmployee.status.toLowerCase().replace(' ', '-')}`}>
                                    {selectedEmployee.status}
                                </span>
                            </div>

                            <div className="detail-section">
                                <span className="label-block">Yetkinlikler:</span>
                                <div className="tags-container" style={{justifyContent:'center'}}>
                                    {selectedEmployee.serviceNames?.map((s, i) => <span key={i} className="service-tag">{s}</span>)}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-delete" onClick={() => handleDelete(selectedEmployee.id)}>Sil</button>
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

                                <div className="form-row">
                                    <div className="form-group half">
                                        <label>Rol</label>
                                        <select name="role" value={formData.role} onChange={handleInputChange}>
                                            <option>Çalışan</option>
                                            <option>Müdür</option>
                                            <option>Resepsiyon</option>
                                        </select>
                                    </div>
                                    <div className="form-group half">
                                        <label>Durum</label>
                                        <select name="status" value={formData.status} onChange={handleInputChange}>
                                            <option>Aktif</option>
                                            <option>İzinli</option>
                                        </select>
                                    </div>
                                </div>

                                {/* YENİ: GÜNLÜK ÇALIŞMA SAATLERİ (PER DAY) */}
                                <div className="form-section-title">Haftalık Program</div>
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

                                <div className="form-section-title" style={{marginTop:'1.5rem'}}>Hizmetler</div>
                                <div className="skills-grid">
                                    {MOCK_SERVICES.map(srv => (
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
        </div>
    );
};

export default EmployeeManager;