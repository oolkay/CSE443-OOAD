import React from 'react';
import './ServiceManager.css'; // Shared styles

const ServiceFormModal = ({ isOpen, isEditing, onClose, onSubmit, initialData }) => {
    // If the modal is not open, strictly return null
    if (!isOpen) return null;

    const { formData, onChange } = initialData;

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
