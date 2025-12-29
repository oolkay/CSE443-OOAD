import React, { useEffect, useState, useRef } from 'react';
import './ServiceManager.css'; // Shared styles
import resourceService from '../../../services/resourceService';
import authService from '../../../services/authService';

const ServiceFormModal = ({ isOpen, isEditing, onClose, onSubmit, initialData }) => {
    const user = authService.getCurrentUser();
    const [resources, setResources] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const getResources = async () => {
        if (!user?.companyId) return;

        try {
            const data = await resourceService.getResources(user.companyId);
            setResources(data || []);
        } catch (error) {
            console.error("Error fetching resources:", error);
        }
    }

    useEffect(() => {
        if (isOpen) {
            getResources();
        }
    }, [isOpen]);

    // If the modal is not open, strictly return null
    if (!isOpen) return null;

    const { formData, onChange } = initialData;

    // Helper to check if a resource is selected
    const isResourceSelected = (resourceId) => {
        return formData.resourceIds?.includes(resourceId);
    };

    // Toggle resource selection
    const toggleResource = (resourceId) => {
        const currentIds = formData.resourceIds || [];
        let newIds;

        if (currentIds.includes(resourceId)) {
            newIds = currentIds.filter(id => id !== resourceId);
        } else {
            newIds = [...currentIds, resourceId];
        }

        // Mimic event object for the generic onChange handler if possible, 
        // OR manually update parent state if onChange is strictly for events.
        // Assuming onChange expects { target: { name, value } }
        onChange({
            target: {
                name: 'resourceIds',
                value: newIds
            }
        });
    };

    // Get selected resource objects for display
    const selectedResources = resources.filter(r => formData.resourceIds?.includes(r.resourceId));


    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{isEditing ? 'Hizmeti Düzenle' : 'Yeni Hizmet'}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={onSubmit} className="modal-form-flex">
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Hizmet Adı</label>
                            <input
                                type="text" name="name"
                                value={formData.name} onChange={onChange}
                                required placeholder="örn. Saç Kesimi"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group half">
                                <label>Fiyat (₺)</label>
                                <input
                                    type="number" name="price" step="0.01" min="0"
                                    value={formData.price} onChange={onChange}
                                    required placeholder="0.00"
                                />
                            </div>
                            <div className="form-group half">
                                <label>Süre (Dk)</label>
                                <input
                                    type="number" name="timeDuration" step="1" min="1"
                                    value={formData.timeDuration} onChange={onChange}
                                    required placeholder="örn. 30"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Açıklama (İsteğe Bağlı)</label>
                            <textarea
                                name="description"
                                value={formData.description} onChange={onChange}
                                rows="4"
                                placeholder="Hizmet ayrıntılarını girin..."
                                className="form-textarea"
                            ></textarea>
                        </div>

                        <div className="form-group" ref={dropdownRef}>
                            <label>Kaynaklar</label>
                            <div className="multi-select-wrapper">
                                <div
                                    className={`multi-select-trigger ${isDropdownOpen ? 'open' : ''}`}
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    {selectedResources.length === 0 && (
                                        <span className="placeholder-text">Kaynak seçin...</span>
                                    )}

                                    {selectedResources.map(resource => (
                                        <div key={resource.resourceId} className="selected-tag" onClick={(e) => e.stopPropagation()}>
                                            {resource.name}
                                            <span
                                                className="tag-remove"
                                                onClick={() => toggleResource(resource.resourceId)}
                                            >
                                                &times;
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className={`dropdown-menu ${isDropdownOpen ? 'open' : ''}`}>
                                    {resources.length === 0 ? (
                                        <div className="dropdown-item" style={{ color: '#9ca3af', justifyContent: 'center' }}>
                                            Kayıtlı kaynak bulunamadı
                                        </div>
                                    ) : (
                                        resources.map(resource => (
                                            <div
                                                key={resource.resourceId}
                                                className={`dropdown-item ${isResourceSelected(resource.resourceId) ? 'selected' : ''}`}
                                                onClick={() => toggleResource(resource.resourceId)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isResourceSelected(resource.resourceId)}
                                                    readOnly
                                                />
                                                <span>{resource.name}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn-cancel">İptal</button>
                        <button type="submit" className="btn-save">
                            {isEditing ? 'Hizmeti Güncelle' : 'Hizmeti Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ServiceFormModal;
