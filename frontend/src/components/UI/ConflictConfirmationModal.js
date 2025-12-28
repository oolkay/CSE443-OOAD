import React from 'react';
import './ConflictConfirmationModal.css';

const ConflictConfirmationModal = ({ isOpen, conflicts, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    const formatDateTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return {
            date: date.toLocaleDateString('tr-TR'),
            time: date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        };
    };

    const formatTimeRange = (startTime, endTime) => {
        const start = new Date(startTime);
        const end = new Date(endTime);
        return `${start.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content conflict-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Çakışan Randevular</h2>
                    <button className="close-btn" onClick={onCancel}>&times;</button>
                </div>

                <div className="modal-body">
                    <p className="warning-text">
                        Bu randevuyu onaylarsanız, aşağıdaki <strong>{conflicts.length}</strong> randevu otomatik olarak reddedilecek ve müşterilere bilgilendirme maili gönderilecektir:
                    </p>

                    <div className="conflicts-list">
                        {conflicts.map((conflict, index) => {
                            const { date } = formatDateTime(conflict.startTime);
                            const timeRange = formatTimeRange(conflict.startTime, conflict.endTime);
                            return (
                                <div key={conflict.appointmentId} className="conflict-item">
                                    <div className="conflict-number">{index + 1}</div>
                                    <div className="conflict-details">
                                        <div className="conflict-customer">
                                            <strong>{conflict.customerName}</strong>
                                        </div>
                                        <div className="conflict-service">
                                            {conflict.serviceName} {conflict.serviceDuration && `(${conflict.serviceDuration} dk)`}
                                        </div>
                                        <div className="conflict-time">
                                            <span className="conflict-date">{date}</span>
                                            <span className="conflict-time-range">{timeRange}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <p className="confirmation-text">
                        Bu randevuyu onaylamak istediğinizden emin misiniz?
                    </p>
                </div>

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onCancel}>
                        İptal
                    </button>
                    <button className="btn-confirm-danger" onClick={onConfirm}>
                        Eminim, Onayla
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConflictConfirmationModal;
