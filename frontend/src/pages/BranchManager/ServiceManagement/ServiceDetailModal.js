import React from 'react';
import './ServiceManager.css'; // Shared styles

const ServiceDetailModal = ({ isOpen, service, onClose, onEdit, onDelete }) => {
    if (!isOpen || !service) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content detail-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Hizmet Detayları</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="detail-icon-large"></div>
                    <h3 className="detail-name">{service.name}</h3>

                    <div className="detail-grid">
                        <div className="detail-box">
                            <span className="label">Fiyat</span>
                            <span className="value-primary">
                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(service.price)}
                            </span>
                        </div>
                        <div className="detail-box">
                            <span className="label">Süre</span>
                            <span className="value">
                                {formatDuration(service.durationMinutes)}
                            </span>
                        </div>
                    </div>

                    <div className="detail-section">
                        <span className="label-block">Açıklama:</span>
                        <p className="description-text">
                            {service.description || "Açıklama sağlanmamıştır."}
                        </p>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn-delete" onClick={() => onDelete(service.id)}>Sil</button>
                    <button className="btn-edit" onClick={() => onEdit(service)}>Hizmeti Düzenle</button>
                </div>
            </div>
        </div>
    );
};

// Helper function local to this component or imported if shared utils exist
const formatDuration = (minutes) => {
    if (minutes >= 60) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m > 0 ? `${h}sa ${m}dk` : `${h}saat`;
    }
    return `${minutes} dk`;
};

export default ServiceDetailModal;
