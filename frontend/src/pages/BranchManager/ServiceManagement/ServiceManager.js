import React, { useState, useEffect } from 'react';
import './ServiceManager.css';
import serviceService from '../../../services/serviceService';
import ToastNotification from '../../../components/UI/ToastNotification';

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

    // Toasts State
    const [toasts, setToasts] = useState([]);

    const addToast = (type, message) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, type, message }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    // Form Başlangıç Değerleri
    const initialFormState = {
        name: '',
        description: '',
        timeDuration: '', // Kullanıcı girişi için string başlatıp number'a çevireceğiz
        price: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    // --- FETCH DATA ---
    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
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
    };

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

        // Veri dönüştürme (String -> Number)
        // Backend DTO: durationMinutes, Frontend Form: timeDuration
        // TODO: companyId şimdilik hardcoded 2 olarak gönderiliyor. İleride auth context'ten alınmalı.
        const finalData = {
            name: formData.name,
            description: formData.description,
            durationMinutes: parseInt(formData.timeDuration),
            price: parseFloat(formData.price),
            companyId: 4
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
            // Global Exception Handler'dan gelen hata mesajını göster
            const msg = err.response?.data?.message || "İşlem sırasında bir hata oluştu.";
            addToast('error', msg);
        }
    };

    // Silme İşlemi
    const handleDelete = async (id) => {
        if (window.confirm('Bu hizmeti silmek istediğinize emin misiniz?')) {
            try {
                await serviceService.deleteService(id);
                addToast('success', "Hizmet başarıyla silindi.");
                closeDetailModal();
                fetchServices(); // Listeyi yenile
            } catch (err) {
                console.error("Error deleting service:", err);
                const msg = err.response?.data?.message || "Silme işlemi başarısız.";
                addToast('error', msg);
            }
        }
    };

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="layout-container"><p style={{ padding: '2rem' }}>Yükleniyor...</p></div>;
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
                            {filteredServices.length === 0 ? (
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
            {isDetailModalOpen && selectedService && (
                <div className="modal-overlay" onClick={closeDetailModal}>
                    <div className="modal-content detail-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Hizmet Detayları</h2>
                            <button className="close-btn" onClick={closeDetailModal}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-icon-large">✂️</div>
                            <h3 className="detail-name">{selectedService.name}</h3>

                            <div className="detail-grid">
                                <div className="detail-box">
                                    <span className="label">Fiyat</span>
                                    <span className="value-primary">{formatCurrency(selectedService.price)}</span>
                                </div>
                                <div className="detail-box">
                                    <span className="label">Süre</span>
                                    <span className="value">{formatDuration(selectedService.durationMinutes)}</span>
                                </div>
                            </div>

                            <div className="detail-section">
                                <span className="label-block">Açıklama:</span>
                                <p className="description-text">
                                    {selectedService.description || "Açıklama sağlanmamıştır."}
                                </p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-delete" onClick={() => handleDelete(selectedService.id)}>Sil</button>
                            <button className="btn-edit" onClick={() => openFormModal(selectedService)}>Hizmeti Düzenle</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- FORM MODALI (ADD / EDIT) --- */}
            {isFormModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{isEditing ? 'Hizmeti Düzenle' : 'Yeni Hizmet'}</h2>
                            <button className="close-btn" onClick={closeFormModal}>&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form-flex">
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Hizmet Adı</label>
                                    <input
                                        type="text" name="name"
                                        value={formData.name} onChange={handleInputChange}
                                        required placeholder="örn. Saç Kesimi"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group half">
                                        <label>Fiyat (₺)</label>
                                        <input
                                            type="number" name="price" step="0.01" min="0"
                                            value={formData.price} onChange={handleInputChange}
                                            required placeholder="0.00"
                                        />
                                    </div>
                                    <div className="form-group half">
                                        <label>Süre (Dk)</label>
                                        <input
                                            type="number" name="timeDuration" step="1" min="1"
                                            value={formData.timeDuration} onChange={handleInputChange}
                                            required placeholder="örn. 30"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Açıklama (İsteğe Bağlı)</label>
                                    <textarea
                                        name="description"
                                        value={formData.description} onChange={handleInputChange}
                                        rows="4"
                                        placeholder="Hizmet ayrıntılarını girin..."
                                        className="form-textarea"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" onClick={closeFormModal} className="btn-cancel">İptal</button>
                                <button type="submit" className="btn-save">
                                    {isEditing ? 'Hizmeti Güncelle' : 'Hizmeti Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceManager;