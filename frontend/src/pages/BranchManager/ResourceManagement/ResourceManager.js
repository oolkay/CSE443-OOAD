import React, { useState } from 'react';
import './ResourceManager.css';

const ResourceManager = () => {
    // --- MOCK DATA (Java Entity ile uyumlu) ---
    const MOCK_RESOURCES = [
        {
            resourceId: 1,
            name: 'Masaj Masası 1',
            description: 'Elektrikli masaj masası, ayarlanabilir yükseklik',
            status: 'AVAILABLE' // AVAILABLE, OUT_OF_SERVICE
        },
        {
            resourceId: 2,
            name: 'Masaj Masası 2',
            description: 'Manuel masaj masası, sabit yükseklik',
            status: 'OUT_OF_SERVICE'
        },
        {
            resourceId: 3,
            name: 'Cilt Bakım Ünitesi 1',
            description: 'Buhar makinesi ve cilt bakım ekipmanları seti',
            status: 'AVAILABLE'
        },
        {
            resourceId: 4,
            name: 'Saç Yıkama Ünitesi 1',
            description: 'Ergonomik tasarım, sıcak/soğuk su',
            status: 'OUT_OF_SERVICE'
        },
        {
            resourceId: 5,
            name: 'Saç Kesim Sandalyesi 1',
            description: 'Hidrolik, 360 derece dönebilir',
            status: 'AVAILABLE'
        }
    ];

    // --- STATE ---
    const [resources, setResources] = useState(MOCK_RESOURCES);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [selectedResource, setSelectedResource] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('all'); // all, available, out_of_service

    // Form Başlangıç Değerleri
    const initialFormState = {
        name: '',
        description: '',
        status: 'AVAILABLE'
    };
    const [formData, setFormData] = useState(initialFormState);

    // --- STATUS HELPERS ---
    const getStatusConfig = (status) => {
        switch (status) {
            case 'AVAILABLE':
                return {
                    text: 'Uygun',
                    className: 'status-available',
                    icon: '✓'
                };
            case 'IN_USE':
                return {
                    text: 'Kullanımda',
                    className: 'status-in-use',
                    icon: '◐'
                };
            case 'OUT_OF_SERVICE':
                return {
                    text: 'Servis Dışı',
                    className: 'status-out-of-service',
                    icon: '✕'
                };
            default:
                return {
                    text: 'Bilinmeyen',
                    className: '',
                    icon: '?'
                };
        }
    };

    // --- HANDLERS ---

    // Durum Toggle (Hızlı durum değiştirme)
    const toggleStatus = (resourceId, currentStatus) => {
        // Sadece AVAILABLE ve OUT_OF_SERVICE arasında toggle yap
        const newStatus = currentStatus === 'OUT_OF_SERVICE' ? 'AVAILABLE' : 'OUT_OF_SERVICE';

        setResources(prev => prev.map(res =>
            res.resourceId === resourceId ? { ...res, status: newStatus } : res
        ));
    };

    // Detay Görüntüleme
    const openDetailModal = (resource) => {
        setSelectedResource(resource);
        setIsDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedResource(null);
    };

    // Ekleme / Düzenleme Modalı
    const openFormModal = (resource = null) => {
        if (isDetailModalOpen) setIsDetailModalOpen(false);

        if (resource) {
            setIsEditing(true);
            setFormData({
                name: resource.name,
                description: resource.description || '',
                status: resource.status
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
    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing) {
            // Update Logic
            setResources(prev => prev.map(res =>
                res.resourceId === selectedResource?.resourceId ? { ...res, ...formData } : res
            ));
        } else {
            // Create Logic
            const newId = Math.floor(Math.random() * 10000);
            setResources([...resources, { resourceId: newId, ...formData }]);
        }
        closeFormModal();
    };

    // Silme İşlemi
    const handleDelete = (id) => {
        if (window.confirm('Bu kaynağı silmek istediğinize emin misiniz?')) {
            setResources(resources.filter(r => r.resourceId !== id));
            closeDetailModal();
        }
    };

    const filteredResources = resources.filter(r => {
        // Search filter
        const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());

        // Status filter
        let matchesStatus = true;
        if (sortBy === 'available') {
            matchesStatus = r.status === 'AVAILABLE';
        } else if (sortBy === 'out_of_service') {
            matchesStatus = r.status === 'OUT_OF_SERVICE';
        } else if (sortBy === 'in_use') {
            matchesStatus = r.status === 'IN_USE';
        }

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="layout-container">
            {/* HEADER */}
            <header className="main-header">
                <h1>Kaynak Yönetimi</h1>
                <p>İşletmenizdeki ekipman ve tesisleri yönetin.</p>
            </header>

            {/* ACTION BAR */}
            <div className="action-bar">
                <div className="search-wrapper">
                    <input
                        type="text"
                        placeholder="Kaynak ara..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="sort-wrapper">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
                        <option value="all">Tüm Durumlar</option>
                        <option value="available">Uygun</option>
                        <option value="out_of_service">Servis Dışı</option>
                        <option value="in_use">Kullanımda</option>
                    </select>
                </div>
                <button className="btn-add" onClick={() => openFormModal(null)}>
                    + Yeni Kaynak
                </button>
            </div>

            {/* LISTE */}
            <div className="table-card">
                <div className="table-responsive">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>KAYNAK ADI</th>
                                <th>DURUM</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredResources.length === 0 ? (
                                <tr>
                                    <td colSpan="2" style={{textAlign:'center', padding:'2rem', color:'#999'}}>
                                        Kaynak bulunamadı.
                                    </td>
                                </tr>
                            ) : (
                                filteredResources.map(resource => {
                                    const statusConfig = getStatusConfig(resource.status);
                                    return (
                                        <tr key={resource.resourceId} onClick={() => openDetailModal(resource)} className="clickable-row">
                                            <td>
                                                <div className="resource-name-cell">
                                                    <span className="fw-bold">{resource.name}</span>
                                                    {resource.description && (
                                                        <span className="resource-description">{resource.description}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="status-cell">
                                                    {/* Quick Toggle Switch */}
                                                    <div className="toggle-wrapper" onClick={(e) => e.stopPropagation()}>
                                                        <label className="toggle-switch">
                                                            <input
                                                                type="checkbox"
                                                                checked={resource.status === 'OUT_OF_SERVICE'}
                                                                onChange={() => toggleStatus(resource.resourceId, resource.status)}
                                                            />
                                                            <span className="toggle-slider"></span>
                                                        </label>
                                                        <span className="toggle-label">
                                                            {resource.status === 'OUT_OF_SERVICE' ? 'Servis Dışı' : 'Uygun'}
                                                        </span>
                                                    </div>

                                                    {/* Status Badge */}
                                                    <span className={`status-badge ${statusConfig.className}`}>
                                                        <span className="status-icon">{statusConfig.icon}</span>
                                                        {statusConfig.text}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- DETAY MODALI (READ ONLY) --- */}
            {isDetailModalOpen && selectedResource && (
                <div className="modal-overlay" onClick={closeDetailModal}>
                    <div className="modal-content detail-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Kaynak Detayları</h2>
                            <button className="close-btn" onClick={closeDetailModal}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-icon-large">🏗️</div>
                            <h3 className="detail-name">{selectedResource.name}</h3>

                            <div className="detail-section">
                                <div className="detail-box">
                                    <span className="label">Durum</span>
                                    <span className={`status-badge large ${getStatusConfig(selectedResource.status).className}`}>
                                        <span className="status-icon">{getStatusConfig(selectedResource.status).icon}</span>
                                        {getStatusConfig(selectedResource.status).text}
                                    </span>
                                </div>
                            </div>

                            {selectedResource.description && (
                                <div className="detail-section">
                                    <span className="label-block">Açıklama:</span>
                                    <p className="description-text">
                                        {selectedResource.description}
                                    </p>
                                </div>
                            )}

                            {/* Quick Status Toggle */}
                            <div className="detail-section">
                                <span className="label-block">Durum Değişikliği:</span>
                                <div className="quick-toggle">
                                    <label className="toggle-switch large">
                                        <input
                                            type="checkbox"
                                            checked={selectedResource.status === 'OUT_OF_SERVICE'}
                                            onChange={() => {
                                                toggleStatus(selectedResource.resourceId, selectedResource.status);
                                                setSelectedResource(prev => ({
                                                    ...prev,
                                                    status: selectedResource.status === 'OUT_OF_SERVICE' ? 'AVAILABLE' : 'OUT_OF_SERVICE'
                                                }));
                                            }}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                    <span className="toggle-text">
                                        {selectedResource.status === 'OUT_OF_SERVICE'
                                            ? 'Kaynağı uygun yap'
                                            : 'Kaynağı servis dışı bırak'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-delete" onClick={() => handleDelete(selectedResource.resourceId)}>Sil</button>
                            <button className="btn-edit" onClick={() => openFormModal(selectedResource)}>Kaynağı Düzenle</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- FORM MODALI (ADD / EDIT) --- */}
            {isFormModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{isEditing ? 'Kaynağı Düzenle' : 'Yeni Kaynak'}</h2>
                            <button className="close-btn" onClick={closeFormModal}>&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form-flex">
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Kaynak Adı</label>
                                    <input
                                        type="text" name="name"
                                        value={formData.name} onChange={handleInputChange}
                                        required placeholder="örn. Masaj Masası 1"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Durum</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="form-select"
                                    >
                                        <option value="AVAILABLE">Uygun</option>
                                        <option value="OUT_OF_SERVICE">Servis Dışı</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Açıklama (İsteğe Bağlı)</label>
                                    <textarea
                                        name="description"
                                        value={formData.description} onChange={handleInputChange}
                                        rows="4"
                                        placeholder="Kaynak ayrıntılarını girin..."
                                        className="form-textarea"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" onClick={closeFormModal} className="btn-cancel">İptal</button>
                                <button type="submit" className="btn-save">
                                    {isEditing ? 'Kaynağı Güncelle' : 'Kaynağı Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResourceManager;