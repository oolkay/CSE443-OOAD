import React, { useState } from 'react';
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
    
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    const [selectedService, setSelectedService] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Mock Resource Types for dropdown
    const MOCK_RESOURCE_TYPES = [
        'Epilasyon Cihazı',
        'Lazer Bölümü',
        'Cilt Bakımı',
        'Masaj Masası',
        'Saç Kesimi Ekipmanı',
        'Tıraş Malzemeleri',
        'Buhar Odası',
        'Soya Banyosu'
    ];

    // Form Başlangıç Değerleri
    const initialFormState = {
        name: '',
        description: '',
        timeDuration: '', // Kullanıcı girişi için string başlatıp number'a çevireceğiz
        price: '',
        requiredResources: []
    };
    const [formData, setFormData] = useState(initialFormState);

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
                timeDuration: service.timeDuration,
                price: service.price,
                requiredResources: service.requiredResources || []
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

    // Resource Selection Handler
    const handleResourceChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, requiredResources: selectedOptions }));
    };

    // Kaydetme İşlemi
    const handleSubmit = (e) => {
        e.preventDefault();

        // Veri dönüştürme (String -> Number)
        const finalData = {
            ...formData,
            timeDuration: parseInt(formData.timeDuration),
            price: parseFloat(formData.price),
            requiredResources: formData.requiredResources
        };

        if (isEditing) {
            // Update Logic
            setServices(prev => prev.map(srv =>
                srv.serviceId === selectedService?.serviceId ? { ...srv, ...finalData } : srv
            ));
        } else {
            // Create Logic
            const newId = Math.floor(Math.random() * 10000);
            setServices([...services, { serviceId: newId, ...finalData }]);
        }
        closeFormModal();
    };

    // Silme İşlemi
    const handleDelete = (id) => {
        if (window.confirm('Bu hizmeti silmek istediğinize emin misiniz?')) {
            setServices(services.filter(s => s.serviceId !== id));
            closeDetailModal();
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

            {/* LISTE */}
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
                                    <tr key={srv.serviceId} onClick={() => openDetailModal(srv)} className="clickable-row">
                                        <td>
                                            <div className="service-name-cell">
                                                <span className="fw-bold">{srv.name}</span>
                                            </div>
                                        </td>
                                        <td style={{textAlign:'right'}}>
                                            <div className="meta-cell">
                                                <span className="price-tag">{formatCurrency(srv.price)}</span>
                                                <span className="duration-tag">{formatDuration(srv.timeDuration)}</span>
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
                                    <span className="value">{formatDuration(selectedService.timeDuration)}</span>
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
                            <button className="btn-delete" onClick={() => handleDelete(selectedService.serviceId)}>Sil</button>
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
                                    <div className="checkbox-group">
                                        {MOCK_RESOURCE_TYPES.map(type => (
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