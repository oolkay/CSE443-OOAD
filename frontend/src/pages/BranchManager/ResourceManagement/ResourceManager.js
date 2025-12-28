import React, { useState, useEffect, useRef } from 'react';
import { resourceService, setCurrentCompanyId } from '../../../services/resourceService';
import appointmentService from '../../../services/appointmentService';

import ConfirmationModal from '../../../components/UI/ConfirmationModal';
import ToastNotification from '../../../components/UI/ToastNotification';
import './ResourceManager.css';

const ResourceManager = () => {
    // --- STATE ---
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Confirmation Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isForceDeleteModalOpen, setIsForceDeleteModalOpen] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const [resourceToDelete, setResourceToDelete] = useState(null);
    const [conflictingAppointments, setConflictingAppointments] = useState([]);

    const [affectedServices, setAffectedServices] = useState([]);
    const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' or 'services'

    // Toast Notification State
    const [toasts, setToasts] = useState([]);

    const addToast = (type, message) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts([...toasts, { id, type, message }]);
    };

    const removeToast = (id) => {
        setToasts(toasts.filter(toast => toast.id !== id));
    };

    const [selectedResource, setSelectedResource] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('all'); // all, available, out_of_service
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const sortDropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isSortDropdownOpen && sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
                setIsSortDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSortDropdownOpen]);

    // Form Başlangıç Değerleri
    const initialFormState = {
        name: '',
        description: '',
        status: 'AVAILABLE'
    };
    const [formData, setFormData] = useState(initialFormState);

    // --- API CALLS ---
    // Fetch resources with retry logic (10 second timeout)
    const fetchResourcesWithRetry = React.useCallback(async (retryCount = 0, maxRetries = 1) => {
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
    }, []);

    // Load resources when component mounts
    useEffect(() => {
        fetchResourcesWithRetry();
        // TODO: Get company ID from authentication context
        // For now, setting default company ID (should come from login)
        setCurrentCompanyId(1);
    }, [fetchResourcesWithRetry]);

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

    // Silme İşlemi Başlatma
    const initiateDelete = (resourceId) => {
        setResourceToDelete(resourceId);
        setIsDeleteModalOpen(true);
    };

    // Silme İşlemi Onay
    const handleConfirmDelete = async (force = false) => {
        if (!resourceToDelete) return;
        try {
            await resourceService.deleteResource(resourceToDelete, force);
            setResources(resources.filter(r => r.resourceId !== resourceToDelete));
            addToast('success', 'Kaynak başarıyla silindi.');
            closeDetailModal();
            setIsDeleteModalOpen(false);
            setIsForceDeleteModalOpen(false);
            setResourceToDelete(null);
        } catch (err) {
            console.error('Error deleting resource:', err);

            const backendMsg = err.data?.message || err.message || '';

            // Check for associated appointments
            if (!force && (backendMsg.includes("associated with existing appointments") || backendMsg.includes("associated appointments") || backendMsg.includes("randevu") || backendMsg.toLowerCase().includes('ilişkili'))) {
                setIsDeleteModalOpen(false);
                setWarningMessage("Bu kaynağa ait randevular bulunmaktadır. Silerseniz randevular iptal edilecek ve müşterilere iptal maili gönderilecektir. Devam etmek istiyor musunuz?");
                setIsForceDeleteModalOpen(true);

                // Initialize clean state for the modal
                setConflictingAppointments([]);
                setAffectedServices([]);
                setActiveTab('appointments');

                // Trigger fetches
                fetchConflictingAppointments();
                fetchAffectedServices();
                return;
            }

            let userMessage = `Kaynak silinemedi: ${backendMsg}`;
            addToast('error', userMessage);
            if (!force) setIsDeleteModalOpen(false);
        }
    };

    const fetchConflictingAppointments = async () => {
        if (!resourceToDelete) return;
        try {
            const appointments = await appointmentService.getResourceAppointments(resourceToDelete);
            setConflictingAppointments(appointments || []);
        } catch (error) {
            console.error("Failed to fetch appointments", error);
            addToast("error", "Randevu listesi alınamadı");
        }
    };

    const fetchAffectedServices = async () => {
        if (!resourceToDelete) return;
        try {
            const services = await resourceService.getResourceServices(resourceToDelete);
            setAffectedServices(services || []);
        } catch (error) {
            console.error("Failed to fetch services", error);
            // Don't show toast for this background fetch, just log it
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
                // TODO: Get company ID from authentication context
                // For now, setting default company ID (should come from login)
                setCurrentCompanyId(1);
            } finally {
                setInitialLoadComplete(true);
            }
        };

        initialLoad();
    }, [fetchResourcesWithRetry]);

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
                <div className="sort-wrapper" ref={sortDropdownRef}>
                    <div
                        className="custom-dropdown"
                    >
                        <div
                            className="dropdown-selected"
                            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                        >
                            <span>{
                                sortBy === 'all' ? 'Tüm Durumlar' :
                                    sortBy === 'available' ? 'Uygun' :
                                        sortBy === 'out_of_service' ? 'Servis Dışı' :
                                            sortBy === 'in_use' ? 'Kullanımda' : 'Tüm Durumlar'
                            }</span>
                            <span className="dropdown-arrow">{isSortDropdownOpen ? '▲' : '▼'}</span>
                        </div>

                        {isSortDropdownOpen && (
                            <div className="dropdown-menu">
                                <div
                                    className={`dropdown-item ${sortBy === 'all' ? 'active' : ''}`}
                                    onClick={() => {
                                        setSortBy('all');
                                        setIsSortDropdownOpen(false);
                                    }}
                                >
                                    Tüm Durumlar
                                </div>
                                <div
                                    className={`dropdown-item ${sortBy === 'available' ? 'active' : ''}`}
                                    onClick={() => {
                                        setSortBy('available');
                                        setIsSortDropdownOpen(false);
                                    }}
                                >
                                    Uygun
                                </div>
                                <div
                                    className={`dropdown-item ${sortBy === 'out_of_service' ? 'active' : ''}`}
                                    onClick={() => {
                                        setSortBy('out_of_service');
                                        setIsSortDropdownOpen(false);
                                    }}
                                >
                                    Servis Dışı
                                </div>
                                <div
                                    className={`dropdown-item ${sortBy === 'in_use' ? 'active' : ''}`}
                                    onClick={() => {
                                        setSortBy('in_use');
                                        setIsSortDropdownOpen(false);
                                    }}
                                >
                                    Kullanımda
                                </div>
                            </div>
                        )}
                    </div>
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
                            {loading ? (
                                <tr>
                                    <td colSpan="2" style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                                        <div className="loading-spinner">Yükleniyor...</div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="2" style={{ textAlign: 'center', padding: '2rem', color: '#dc2626' }}>
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
                                    <td colSpan="2" style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
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
                            <button className="btn-delete" onClick={() => initiateDelete(selectedResource.resourceId)}>Sil</button>
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

            {/* --- CONFIRMATION MODAL --- */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Kaynağı Sil"
                message="Bu kaynağı silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
                type="danger"
            />

            <ConfirmationModal
                isOpen={isForceDeleteModalOpen}
                onClose={() => {
                    setIsForceDeleteModalOpen(false);
                    setResourceToDelete(null); // Clear selection on cancel
                    setConflictingAppointments([]);
                }}
                onConfirm={() => handleConfirmDelete(true)} // Force delete
                title="Dikkat: Randevular Var"
                message={
                    <div className="confirmation-content">
                        <p className="warning-text">{warningMessage}</p>
                        <div className="button-group" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                            <button
                                className={`tab-button ${activeTab === 'appointments' ? 'active' : ''}`}
                                onClick={() => setActiveTab('appointments')}
                                style={{
                                    padding: '8px 16px',
                                    border: 'none',
                                    background: activeTab === 'appointments' ? '#e0e7ff' : 'transparent',
                                    color: activeTab === 'appointments' ? '#4f46e5' : '#6b7280',
                                    fontWeight: 600,
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                📅 Randevular ({conflictingAppointments.length})
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
                                onClick={() => setActiveTab('services')}
                                style={{
                                    padding: '8px 16px',
                                    border: 'none',
                                    background: activeTab === 'services' ? '#e0e7ff' : 'transparent',
                                    color: activeTab === 'services' ? '#4f46e5' : '#6b7280',
                                    fontWeight: 600,
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                🛠️ Hizmetler ({affectedServices.length})
                            </button>
                        </div>

                        {activeTab === 'appointments' && (
                            <div className="tab-content" style={{ marginTop: '15px' }}>
                                {conflictingAppointments.length > 0 ? (
                                    <div className="appointments-list-container">
                                        <table className="appointments-table">
                                            <thead>
                                                <tr>
                                                    <th>Tarih</th>
                                                    <th>Müşteri</th>
                                                    <th>Hizmet</th>
                                                    <th>Çalışan</th>
                                                    <th>Süre</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {conflictingAppointments.map(app => (
                                                    <tr key={app.appointmentId}>
                                                        <td className="date-cell">
                                                            <span className="date">{new Date(app.startTime).toLocaleDateString('tr-TR')}</span>
                                                            <span className="time">{new Date(app.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </td>
                                                        <td className="customer-cell">
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <span></span> {app.customerName}
                                                            </div>
                                                        </td>
                                                        <td className="service-cell">{app.serviceName}</td>
                                                        <td className="employee-cell">{app.employeeName}</td>
                                                        <td className="duration-cell">
                                                            {app.serviceDuration ? `${app.serviceDuration} dk` : '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p style={{ color: '#6b7280', fontStyle: 'italic', padding: '10px' }}>Listelenecek randevu yok veya yükleniyor...</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'services' && (
                            <div className="tab-content" style={{ marginTop: '15px' }}>
                                {affectedServices.length > 0 ? (
                                    <div className="appointments-list-container">
                                        <h4 style={{ textAlign: 'left', margin: '10px 0', fontSize: '0.9rem', color: '#1f2937' }}>İlişkili Hizmetler (Kaynaksız Kalacak):</h4>
                                        <table className="appointments-table">
                                            <thead>
                                                <tr>
                                                    <th>Hizmet Adı</th>
                                                    <th>Açıklama</th>
                                                    <th>Süre</th>
                                                    <th>Fiyat</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {affectedServices.map(service => (
                                                    <tr key={service.id}>
                                                        <td style={{ fontWeight: 600, color: '#1f2937' }}>{service.name}</td>
                                                        <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#6b7280' }}>{service.description || '-'}</td>
                                                        <td>{service.durationMinutes} dk</td>
                                                        <td>{service.price} TL</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p style={{ color: '#6b7280', fontStyle: 'italic', padding: '10px' }}>Bu kaynağın atandığı hizmet bulunmamaktadır.</p>
                                )}
                            </div>
                        )}
                    </div>
                }
                type="danger"
            />

            {/* --- TOAST NOTIFICATION --- */}
            <ToastNotification toasts={toasts} removeToast={removeToast} />
        </div>
    );
};

export default ResourceManager;