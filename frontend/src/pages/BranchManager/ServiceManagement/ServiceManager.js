import React, { useState, useEffect } from 'react';
import './ServiceManager.css';
import serviceService from '../../../services/serviceService';
import ToastNotification from '../../../components/UI/ToastNotification';
import ServiceFormModal from './ServiceFormModal';
import ServiceDetailModal from './ServiceDetailModal';
import ConfirmationModal from '../../../components/UI/ConfirmationModal';

const ServiceManager = () => {
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
    const [serviceToDelete, setServiceToDelete] = useState(null);

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
        price: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    // --- FETCH DATA ---
    const fetchServices = React.useCallback(async () => {
        try {
            setLoading(true);
            const data = await serviceService.getAllServices();
            setServices(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching services:", err);
            setError("Hizmetler yüklenirken bir hata oluştu.");
            addToast('error', "Hizmetler yüklenemedi.");
        } finally {
            setLoading(false);
        }
    }, [addToast]);

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
                price: service.price
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
            price: priceVal
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

    // Silme Onaylama
    const confirmDelete = async () => {
        if (!serviceToDelete) return;

        try {
            await serviceService.deleteService(serviceToDelete);
            addToast('success', "Hizmet başarıyla silindi.");
            closeDetailModal();
            fetchServices();
        } catch (err) {
            console.error("Error deleting service:", err);
            // Axios interceptor returns { message, data, status }, not the original response object
            const msg = err.message || err.data?.message || "Silme işlemi başarısız.";
            addToast('error', msg);
        } finally {
            setServiceToDelete(null);
            setIsDeleteModalOpen(false);
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
                                <th style={{ textAlign: 'right' }}>FİYAT & SÜRESİ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="2" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                        Yükleniyor...
                                    </td>
                                </tr>
                            ) : filteredServices.length === 0 ? (
                                <tr>
                                    <td colSpan="2" style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
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
                onConfirm={confirmDelete}
                title="Hizmeti Sil"
                message="Bu hizmeti silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
                type="danger"
            />
        </div>
    );
};

export default ServiceManager;