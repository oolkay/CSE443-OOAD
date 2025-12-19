import React, { useState, useEffect } from 'react';
import { resourceService, setCurrentCompanyId, getCurrentCompanyId } from '../../../services/resourceService';
import './ResourceManager.css';

const ResourceManager = () => {
    // --- STATE ---
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [selectedResource, setSelectedResource] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('all'); // all, available, out_of_service
    const [availableTypes, setAvailableTypes] = useState([]);
    const [sortByType, setSortByType] = useState('all'); // all, specific type

    // Form Başlangıç Değerleri
    const initialFormState = {
        name: '',
        description: '',
        type: '',
        status: 'AVAILABLE'
    };
    const [formData, setFormData] = useState(initialFormState);

    // --- API CALLS ---
    // Load resources when component mounts
    useEffect(() => {
        fetchResourcesWithRetry();
        // TODO: Get company ID from authentication context
        // For now, setting default company ID (should come from login)
        setCurrentCompanyId(1);
    }, []);

    // Fetch resources with retry logic (10 second timeout)
    const fetchResourcesWithRetry = async (retryCount = 0, maxRetries = 1) => {
        try {
            setLoading(true);
            setError(null);
            const data = await resourceService.getResources();
            setResources(data);
        } catch (err) {
            if (retryCount < maxRetries) {
                console.log(`Resource fetch failed, retrying in 10 seconds... (${retryCount + 1}/${maxRetries + 1})`);
                setTimeout(() => {
                    fetchResourcesWithRetry(retryCount + 1, maxRetries);
                }, 10000); // 10 second delay
            } else {
                setError('Kaynaklar yüklenemedi. Lütfen sayfayı yenileyin.');
                console.error('Error fetching resources after retries:', err);
            }
        } finally {
            setLoading(false);
        }
    };

    // Manual refresh without retry
    const fetchResources = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await resourceService.getResources();
            setResources(data);
        } catch (err) {
            setError('Kaynaklar yüklenemedi. Lütfen sayfayı yenileyin.');
            console.error('Error fetching resources:', err);
        } finally {
            setLoading(false);
        }
    };

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

    // Durum Toggle (Hızlı durum değiştirme) - API Call
    const toggleStatus = async (resourceId, currentStatus) => {
        try {
            const updatedResource = await resourceService.toggleResourceStatus(resourceId);
            setResources(prev => prev.map(res =>
                res.resourceId === resourceId ? updatedResource : res
            ));
        } catch (err) {
            console.error('Error toggling resource status:', err);
            // Fallback to optimistic update if API fails
            const newStatus = currentStatus === 'OUT_OF_SERVICE' ? 'AVAILABLE' : 'OUT_OF_SERVICE';
            setResources(prev => prev.map(res =>
                res.resourceId === resourceId ? { ...res, status: newStatus } : res
            ));
        }
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
                type: resource.type || '',
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

    // Kaydetme İşlemi - API Call
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let savedResource;
            if (isEditing) {
                // Update Logic
                savedResource = await resourceService.updateResource(selectedResource?.resourceId, formData);
                setResources(prev => prev.map(res =>
                    res.resourceId === selectedResource?.resourceId ? savedResource : res
                ));
            } else {
                // Create Logic
                savedResource = await resourceService.createResource(formData);
                setResources([...resources, savedResource]);
            }
            closeFormModal();
        } catch (err) {
            console.error('Error saving resource:', err);
            // TODO: Show user-friendly error message
            alert('Kaynak kaydedilemedi: ' + (err.message || 'Bilinmeyen hata'));
        }
    };

    // Silme İşlemi - API Call
    const handleDelete = async (id) => {
        if (window.confirm('Bu kaynağı silmek istediğinize emin misiniz?')) {
            try {
                await resourceService.deleteResource(id);
                setResources(resources.filter(r => r.resourceId !== id));
                closeDetailModal();
            } catch (err) {
                console.error('Error deleting resource:', err);
                // TODO: Show user-friendly error message
                alert('Kaynak silinemedi: ' + (err.message || 'Bilinmeyen hata'));
            }
        }
    };

    // Track if initial load has completed
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    // Initial load - only runs once on component mount
    useEffect(() => {
        const initialLoad = async () => {
            try {
                setInitialLoadComplete(false);
                await fetchResourcesWithRetry();
                await fetchAvailableTypesWithRetry();
                // TODO: Get company ID from authentication context
                // For now, setting default company ID (should come from login)
                setCurrentCompanyId(1);
            } finally {
                setInitialLoadComplete(true);
            }
        };

        initialLoad();
    }, []);

    // Fetch available resource types with retry logic
    const fetchAvailableTypesWithRetry = async (retryCount = 0, maxRetries = 1) => {
        try {
            const types = await resourceService.getResourceTypes();
            setAvailableTypes(types);
        } catch (err) {
            if (retryCount < maxRetries) {
                console.log(`Resource types fetch failed, retrying in 5 seconds... (${retryCount + 1}/${maxRetries + 1})`);
                setTimeout(() => {
                    fetchAvailableTypesWithRetry(retryCount + 1, maxRetries);
                }, 5000); // 5 second delay
            } else {
                console.error('Error fetching resource types after retries:', err);
                setAvailableTypes([]); // Empty array if all retries fail
            }
        }
    };

    // Search and filter logic - only runs after initial load and when filters change
    useEffect(() => {
        // Don't run on initial load or when filters are cleared
        if (!initialLoadComplete || (!searchTerm && sortBy === 'all')) {
            return;
        }

        const filterResources = async () => {
            try {
                setLoading(true);
                setError(null);

                const statusFilter = sortBy === 'all' ? null :
                                   sortBy === 'available' ? 'AVAILABLE' :
                                   sortBy === 'out_of_service' ? 'OUT_OF_SERVICE' : 'IN_USE';

                const data = await resourceService.searchResources(searchTerm, statusFilter);
                setResources(data);
            } catch (err) {
                setError('Arama ve filtreleme başarısız oldu. Lütfen tekrar deneyin.');
                console.error('Error filtering resources:', err);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search to avoid too many API calls
        const timeoutId = setTimeout(filterResources, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, sortBy, initialLoadComplete]);

    // Reset to all resources when filters are cleared (only after initial load)
    useEffect(() => {
        if (initialLoadComplete && !searchTerm && sortBy === 'all') {
            fetchResources();
        }
    }, [searchTerm, sortBy, initialLoadComplete]);

    const filteredResources = resources; // Now handled by API

    // Test backend connection
    const testBackendConnection = async () => {
        try {
            console.log('Testing backend connection...');
            const response = await fetch('http://localhost:8080/api/resources/company/1');
            console.log('Backend test - Status:', response.status);
            console.log('Backend test - OK:', response.ok);

            if (response.ok) {
                const data = await response.json();
                console.log('Backend test - Data:', data);
                alert('Backend bağlantısı başarılı! Veri: ' + JSON.stringify(data));
            } else {
                const errorText = await response.text();
                console.log('Backend test - Error:', errorText);
                alert('Backend bağlantı hatası: ' + response.status + ' - ' + errorText);
            }
        } catch (error) {
            console.error('Backend test - Error:', error);
            alert('Backend bağlanamadı: ' + error.message);
        }
    };

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
                                <th>TÜR</th>
                                <th>DURUM</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="3" style={{textAlign:'center', padding:'2rem', color:'#999'}}>
                                        <div className="loading-spinner">Yükleniyor...</div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="3" style={{textAlign:'center', padding:'2rem', color:'#dc2626'}}>
                                        <div className="error-message">
                                            {error}
                                            <button
                                                className="retry-btn"
                                                onClick={fetchResources}
                                                style={{
                                                    marginTop: '1rem',
                                                    padding: '0.5rem 1rem',
                                                    backgroundColor: '#6366f1',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Tekrar Dene
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredResources.length === 0 ? (
                                <tr>
                                    <td colSpan="3" style={{textAlign:'center', padding:'2rem', color:'#999'}}>
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
                                                <div className="resource-type-cell">
                                                    <span className="type-badge">{resource.type || 'Belirtilmemiş'}</span>
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
                                    <label>Kaynak Türü</label>
                                    <input
                                        type="text"
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="örn. Epilasyon Cihazı, Masaj Masası"
                                        list="available-types"
                                    />
                                    <datalist id="available-types">
                                        {availableTypes.map((type, index) => (
                                            <option key={index} value={type} />
                                        ))}
                                    </datalist>
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