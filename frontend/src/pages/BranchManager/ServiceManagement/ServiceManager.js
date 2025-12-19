import React, { useState, useEffect } from 'react';
import { serviceService } from '../../../services/serviceService';
import { resourceService } from '../../../services/resourceService';
import './ServiceManager.css';

const ServiceManager = () => {
    // --- MOCK DATA (Java Entity ile uyumlu) ---
    const MOCK_SERVICES = [
        { 
            serviceId: 1, 
            name: 'Saç Kesimi', 
            description: 'Yıkama ve şekillendirme dahildir.', 
            timeDuration: 30, // dakika
            price: 250.00 
        },
        { 
            serviceId: 2, 
            name: 'Sakal Tıraşı', 
            description: 'Sıcak havlu kompresi ile geleneksel tıraş.', 
            timeDuration: 15, 
            price: 100.00 
        },
        { 
            serviceId: 3, 
            name: 'Cilt Bakımı (Full)', 
            description: 'Siyah nokta temizliği, maske ve nemlendirici.', 
            timeDuration: 60, 
            price: 750.50 
        }
    ];

    // --- STATE ---
    const [services, setServices] = useState(MOCK_SERVICES);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [selectedService, setSelectedService] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [resourceTypes, setResourceTypes] = useState([]);
    const [resourceTypesLoading, setResourceTypesLoading] = useState(false);

    // Form Başlangıç Değerleri
    const initialFormState = {
        name: '',
        description: '',
        timeDuration: '', // Kullanıcı girişi için string başlatıp number'a çevireceğiz
        price: '',
        requiredResources: []
    };
    const [formData, setFormData] = useState(initialFormState);

    // --- API EFFECTS ---
    useEffect(() => {
        fetchServicesWithRetry();
        fetchResourceTypes();
    }, []);

  const fetchResourceTypes = async () => {
        try {
            setResourceTypesLoading(true);
            console.log('Fetching resource types...');
            const types = await resourceService.getResourceTypes();
            console.log('Resource types fetched:', types);
            setResourceTypes(types);
        } catch (err) {
            console.error('Error fetching resource types:', err);
        } finally {
            setResourceTypesLoading(false);
        }
    };

    const fetchServicesWithRetry = async (retries = 3, delay = 5000) => {
        console.log('fetchServicesWithRetry called');
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                console.log(`Attempt ${attempt} - Starting API call`);
                setLoading(true);
                const data = await serviceService.getServices();
                console.log('API call successful, data:', data);
                setServices(data);
                setError(null);
                setLoading(false);
                return;
            } catch (err) {
                console.error(`Attempt ${attempt} failed:`, err);
                if (attempt === retries) {
                    setError('Hizmetler yüklenemedi: ' + err.message);
                    setLoading(false);
                    return;
                }
                // Wait before next attempt
                await new Promise(resolve => setTimeout(resolve, delay));
            }
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
                timeDuration: service.timeDuration || service.durationMinutes,
                price: service.price,
                requiredResources: service.requiredResources || service.requiredResourceTypes || []
            });
        } else {
            setIsEditing(false);
            setFormData(initialFormState);
        }
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
    };

    // Input Değişimi
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Kaydetme İşlemi
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Backend'e uygun veri formatı
            const finalData = {
                name: formData.name,
                description: formData.description,
                durationMinutes: parseInt(formData.timeDuration),
                price: parseFloat(formData.price),
                requiredResourceTypes: formData.requiredResources // Backend expects requiredResourceTypes
            };

            if (isEditing) {
                await serviceService.updateService(selectedService.id || selectedService.serviceId, finalData);
            } else {
                await serviceService.createService(finalData);
            }

            // Refresh the services list
            await fetchServicesWithRetry();
            closeFormModal();
        } catch (error) {
            console.error('Error saving service:', error);
            alert('Hizmet kaydedilemedi: ' + error.message);
        }
    };

    // Silme İşlemi
    const handleDelete = async (id) => {
        if (window.confirm('Bu hizmeti silmek istediğinize emin misiniz?')) {
            try {
                await serviceService.deleteService(id);
                await fetchServicesWithRetry();
                closeDetailModal();
            } catch (error) {
                console.error('Error deleting service:', error);
                alert('Hizmet silinemedi: ' + error.message);
            }
        }
    };

    const filteredServices = services.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="layout-container">
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

            {/* Loading and Error States */}
            {loading && (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Hizmetler yükleniyor...</p>
                </div>
            )}

            {error && (
                <div className="error-container">
                    <p className="error-message">{error}</p>
                    <button className="btn-retry" onClick={() => fetchServicesWithRetry()}>
                        Tekrar Dene
                    </button>
                </div>
            )}

            {/* LISTE */}
            {!loading && !error && (
                <div className="table-card">
                <div className="table-responsive">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>HİZMET ADI</th>
                                <th style={{textAlign:'right'}}>FİYAT & SÜRESİ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredServices.length === 0 ? (
                                <tr>
                                    <td colSpan="2" style={{textAlign:'center', padding:'2rem', color:'#999'}}>
                                        Hizmet bulunamadı.
                                    </td>
                                </tr>
                            ) : (
                                filteredServices.map(srv => (
                                    <tr key={srv.id || srv.serviceId} onClick={() => openDetailModal(srv)} className="clickable-row">
                                        <td>
                                            <div className="service-name-cell">
                                                <span className="fw-bold">{srv.name}</span>
                                            </div>
                                        </td>
                                        <td style={{textAlign:'right'}}>
                                            <div className="meta-cell">
                                                <span className="price-tag">{formatCurrency(srv.price)}</span>
                                                <span className="duration-tag">{formatDuration(srv.timeDuration || srv.durationMinutes)}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                </div>
            )}

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
                                    <span className="value">{formatDuration(selectedService.timeDuration || selectedService.durationMinutes)}</span>
                                </div>
                            </div>

                            <div className="detail-section">
                                <span className="label-block">Açıklama:</span>
                                <p className="description-text">
                                    {selectedService.description || "Açıklama sağlanmamıştır."}
                                </p>
                            </div>

                            {selectedService.requiredResources && selectedService.requiredResources.length > 0 && (
                                <div className="detail-section">
                                    <span className="label-block">Gerekli Kaynaklar:</span>
                                    <div className="resource-tags">
                                        {selectedService.requiredResources.map((resource, index) => (
                                            <span key={index} className="resource-tag">
                                                {resource}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn-delete" onClick={() => handleDelete(selectedService.id || selectedService.serviceId)}>Sil</button>
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

                                <div className="form-group">
                                    <label>Gerekli Kaynak Türleri</label>
                                    {resourceTypesLoading ? (
                                        <div className="loading-small">Kaynak türleri yükleniyor...</div>
                                    ) : resourceTypes.length === 0 ? (
                                        <div className="no-resource-types">Mevcut kaynak türü bulunamadı.</div>
                                    ) : (
                                        <div className="checkbox-group">
                                            {resourceTypes.map(type => (
                                                <label key={type} className="checkbox-item">
                                                    <input
                                                        type="checkbox"
                                                        value={type}
                                                        checked={formData.requiredResources.includes(type)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    requiredResources: [...prev.requiredResources, type]
                                                                }));
                                                            } else {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    requiredResources: prev.requiredResources.filter(r => r !== type)
                                                                }));
                                                            }
                                                        }}
                                                    />
                                                    <span className="checkmark"></span>
                                                    {type}
                                                </label>
                                            ))}
                                        </div>
                                    )}
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