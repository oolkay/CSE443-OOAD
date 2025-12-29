import React, { useState, useEffect } from 'react';
import './ServiceManager.css';
import serviceService from '../../../services/serviceService';
import appointmentService from '../../../services/appointmentService';
import authService from '../../../services/authService';
import ToastNotification from '../../../components/UI/ToastNotification';
import ServiceFormModal from './ServiceFormModal';
import ServiceDetailModal from './ServiceDetailModal';
import ConfirmationModal from '../../../components/UI/ConfirmationModal';

const ServiceManager = () => {
    const user = authService.getCurrentUser();
    const companyId = user?.companyId;
    // --- STATE ---
    const [services, setServices] = useState([]);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [selectedService, setSelectedService] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Confirmation Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isForceDeleteModalOpen, setIsForceDeleteModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [conflictingAppointments, setConflictingAppointments] = useState([]);
    const [warningMessage, setWarningMessage] = useState('');

    // Toasts State
    const [toasts, setToasts] = useState([]);

    const addToast = React.useCallback((type, message) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, type, message }]);
    }, []);

    const removeToast = React.useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    // Form Başlangıç Değerleri
    const initialFormState = {
        name: '',
        description: '',
        timeDuration: '', // Kullanıcı girişi için string başlatıp number'a çevireceğiz
        price: '',
        resourceIds: []
    };
    const [formData, setFormData] = useState(initialFormState);

    // --- FETCH DATA ---
    const fetchServices = React.useCallback(async () => {
        if (!companyId) {
            alert('Kullanıcının şirket bilgisi bulunamadı.');
            return;
        }
        try {
            setLoading(true);
            // const data = await serviceService.getAllServices();
            const data = await serviceService.getServicesByCompany(companyId);
            setServices(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching services:", err);
            setError("Hizmetler yüklenirken bir hata oluştu.");
            addToast('error', "Hizmetler yüklenemedi.");
        } finally {
            setLoading(false);
        }
    }, [addToast, companyId]);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    // --- FORMATTERS ---
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
    };

    const formatDuration = (minutes) => {
        if (minutes >= 60) {
            const h = Math.floor(minutes / 60);
            const m = minutes % 60;
            return m > 0 ? `${h}sa ${m}dk` : `${h}saat`;
        }
        return `${minutes} dk`;
    };

    // --- HANDLERS ---

    // Detay Görüntüleme
    const openDetailModal = (service) => {
        setSelectedService(service);
        setIsDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedService(null);
    };

    // Ekleme / Düzenleme Modalı
    const openFormModal = (service = null) => {
        if (isDetailModalOpen) setIsDetailModalOpen(false);

        if (service) {
            setIsEditing(true);
            setFormData({
                name: service.name,
                description: service.description || '',
                timeDuration: service.durationMinutes, // Backend DTO: durationMinutes
                price: service.price,
                resourceIds: service.resources ? service.resources.map(resource => resource.resourceId) : []
            });
            // Seçili servisi güncelleme işlemi için set et (ID lazım)
            setSelectedService(service);
        } else {
            setIsEditing(false);
            setFormData(initialFormState);
            setSelectedService(null);
        }
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
        setFormData(initialFormState); // Formu temizle
    };

    // Input Değişimi
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Kaydetme İşlemi
    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- VALIDATION ---
        const priceVal = parseFloat(formData.price);
        const durationVal = parseInt(formData.timeDuration);

        if (isNaN(priceVal) || priceVal <= 0) {
            addToast('error', "Lütfen geçerli bir fiyat giriniz.");
            return;
        }

        if (isNaN(durationVal) || durationVal <= 0) {
            addToast('error', "Lütfen geçerli bir süre giriniz.");
            return;
        }

        // Veri dönüştürme
        // TODO: companyId şimdilik hardcoded 4 olarak gönderiliyor. İleride auth context'ten alınmalı.
        const finalData = {
            name: formData.name,
            description: formData.description,
            durationMinutes: durationVal,
            price: priceVal,
            resourceIds: formData.resourceIds && formData.resourceIds.length > 0 ? formData.resourceIds : null
        };

        try {
            if (isEditing && selectedService) {
                // Update Logic
                await serviceService.updateService(selectedService.id, finalData); // Backend DTO: id
                addToast('success', "Hizmet başarıyla güncellendi.");
            } else {
                // Create Logic
                await serviceService.createService(finalData);
                addToast('success', "Hizmet başarıyla oluşturuldu.");
            }
            closeFormModal();
            fetchServices(); // Listeyi yenile
        } catch (err) {
            console.error("Error saving service:", err);

            let msg = "İşlem sırasında bir hata oluştu.";
            // axiosConfig.js returns a custom error object { status, message, data }
            // So we should check err.data first. Fallback to err.response.data just in case.
            const data = err.data || err.response?.data;

            if (data) {
                if (data.validationErrors) {
                    // Validation hatalarını birleştir
                    const errorMessages = Object.values(data.validationErrors);
                    msg = errorMessages.length > 0 ? errorMessages[0] : data.message;
                    // Eğer birden fazla varsa kullanıcıya sadece ilkini gösterip kafa karıştırmayalım,
                    // ya da listeyle gösterebiliriz ama Toast için tek satır daha iyi.
                    if (errorMessages.length > 1) {
                        msg = `${errorMessages[0]} (+${errorMessages.length - 1} diğer hata)`;
                    }
                } else {
                    msg = data.message || msg;
                }
            }

            addToast('error', msg);
        }
    };

    // Silme Başlatma
    const initiateDelete = (id) => {
        // Detay modalı açıksa kapat
        setIsDetailModalOpen(false);
        // Silinecek servisi set et ve onay modalını aç
        setServiceToDelete(id);
        setIsDeleteModalOpen(true);
    };

    // Çakışan Randevuları Getir
    const fetchConflictingAppointments = React.useCallback(async () => {
        if (!serviceToDelete) return;
        try {
            const data = await appointmentService.getServiceAppointments(serviceToDelete);
            // Sadece iptal edilmemiş (PENDING / APPROVED) randevuları gösterelim
            const activeAppointments = data.filter(app => app.status !== 'CANCELLED' && app.status !== 'REJECTED');
            setConflictingAppointments(activeAppointments);
        } catch (err) {
            console.error("Error fetching conflicting appointments:", err);
            addToast('error', "Randevu bilgileri alınamadı.");
        }
    }, [serviceToDelete, addToast]);

    // Silme Onaylama (İlk Aşama)
    const confirmDelete = async (force = false) => {
        if (!serviceToDelete) return;

        try {
            // Force parametresi true ise backend'e confirm=true gönder
            await serviceService.deleteService(serviceToDelete, force);
            addToast('success', "Hizmet başarıyla silindi.");
            closeDetailModal();
            fetchServices();
            setServiceToDelete(null);
            setIsDeleteModalOpen(false);
            setIsForceDeleteModalOpen(false);
        } catch (err) {
            console.error("Delete attempt failed:", err);
            const msg = err.response?.data?.message || err.message || "Silme işlemi başarısız.";

            // Eğer backend "Hizmetin randevuları var" diyerek 400/409 dönerse veya 
            // biz kendimiz önden kontrol etmek istersek:
            // Backend şu an exception fırlatıyor ve biz force=false gönderdik. 
            // Mesaj "Cannot delete service..." içeriyorsa force delete modunu açalım.

            if (msg.includes("associated with existing appointments") || msg.includes("Cannot delete service")) {
                setIsDeleteModalOpen(false);
                setWarningMessage("Bu hizmete ait randevular bulunmaktadır. Silerseniz randevular iptal edilecek ve müşterilere iptal maili gönderilecektir. Devam etmek istiyor musunuz?");
                setIsForceDeleteModalOpen(true);
                // Fetch appointments immediately
                fetchConflictingAppointments();
                return;
            }

            addToast('error', msg);
        }
    };

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Error state sadece veri çekilemediği durumda layout içinde gösterilebilir, 
    // ancak toast ile de bildiriyoruz. Burada basit bir feedback bırakalım.
    if (error) return (
        <div className="layout-container">
            <p style={{ padding: '2rem', color: 'red' }}>{error}</p>
            <ToastNotification toasts={toasts} removeToast={removeToast} />
        </div>
    );

    return (
        <div className="layout-container">
            <ToastNotification toasts={toasts} removeToast={removeToast} />


            {/* HEADER */}
            <header className="main-header">
                <h1>Hizmet Menüsü</h1>
                <p>Hizmetlerinizi, fiyatlarınızı ve süreleri yönetin.</p>
            </header>

            {/* ACTION BAR */}
            <div className="action-bar">
                <div className="search-wrapper">
                    <input
                        type="text"
                        placeholder="Hizmet ara..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn-add" onClick={() => openFormModal(null)}>
                    + Yeni Hizmet
                </button>
            </div>

            {/* LISTE */}
            <div className="table-card">
                <div className="table-responsive">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>HİZMET ADI</th>
                                <th style={{ textAlign: 'center' }}>KAYNAKLAR</th>
                                <th style={{ textAlign: 'right' }}>FİYAT & SÜRESİ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                        Yükleniyor...
                                    </td>
                                </tr>
                            ) : filteredServices.length === 0 ? (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                                        Hizmet bulunamadı.
                                    </td>
                                </tr>
                            ) : (
                                filteredServices.map(srv => (
                                    <tr key={srv.id} onClick={() => openDetailModal(srv)} className="clickable-row">
                                        <td>
                                            <div className="service-name-cell">
                                                <span className="fw-bold">{srv.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ justifyContent: 'center' }}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                                                {srv.resources && srv.resources.slice(0, 3).map(r => (
                                                    <span key={r.resourceId} style={{
                                                        backgroundColor: '#f3f4f6',
                                                        color: '#374151',
                                                        padding: '2px 8px',
                                                        borderRadius: '12px',
                                                        fontSize: '0.75rem',
                                                        border: '1px solid #e5e7eb'
                                                    }}>
                                                        {r.name}
                                                    </span>
                                                ))}
                                                {srv.resources && srv.resources.length > 3 && (
                                                    <span style={{ fontSize: '0.75rem', color: '#6b7280', alignSelf: 'center' }}>
                                                        +{srv.resources.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div className="meta-cell">
                                                <span className="price-tag">{formatCurrency(srv.price)}</span>
                                                <span className="duration-tag">{formatDuration(srv.durationMinutes)}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- DETAY MODALI (READ ONLY) --- */}
            <ServiceDetailModal
                isOpen={isDetailModalOpen}
                service={selectedService}
                onClose={closeDetailModal}
                onEdit={openFormModal}
                onDelete={initiateDelete}
            />

            {/* --- FORM MODALI (ADD / EDIT) --- */}
            <ServiceFormModal
                isOpen={isFormModalOpen}
                isEditing={isEditing}
                onClose={closeFormModal}
                onSubmit={handleSubmit}
                initialData={{ formData, onChange: handleInputChange }}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => confirmDelete(false)}
                title="Hizmeti Sil"
                message="Bu hizmeti silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
                type="danger"
            />

            <ConfirmationModal
                isOpen={isForceDeleteModalOpen}
                onClose={() => setIsForceDeleteModalOpen(false)}
                onConfirm={() => confirmDelete(true)} // Force delete
                title="Dikkat: Randevular Var"
                message={
                    <div className="confirmation-content">
                        <p className="warning-text">{warningMessage}</p>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '8px 16px',
                            margin: '10px 0',
                            backgroundColor: '#e0e7ff',
                            color: '#4f46e5',
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '0.95rem'
                        }}>
                            📅 Randevular ({conflictingAppointments.length})
                        </div>

                        {conflictingAppointments.length > 0 && (
                            <div className="appointments-list-container" style={{
                                marginTop: '15px',
                                maxHeight: '180px',
                                overflowY: 'auto',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px'
                            }}>
                                <table className="appointments-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f9fafb', zIndex: 1 }}>
                                        <tr>
                                            <th style={{ padding: '8px', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Tarih</th>
                                            <th style={{ padding: '8px', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Müşteri</th>
                                            <th style={{ padding: '8px', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Personel</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {conflictingAppointments.map(app => (
                                            <tr key={app.appointmentId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                <td style={{ padding: '8px' }}>
                                                    <div>{new Date(app.startTime).toLocaleDateString('tr-TR')}</div>
                                                    <div style={{ fontSize: '0.8em', color: '#6b7280' }}>
                                                        {new Date(app.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '8px' }}>{app.customerName}</td>
                                                <td style={{ padding: '8px' }}>{app.employeeName}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                }
                type="danger"
            />
        </div>
    );
};

export default ServiceManager;