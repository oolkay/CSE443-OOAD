import React from 'react';
import ReactDOM from 'react-dom';
import './ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="modal-overlay confirmation-overlay" onClick={onClose}>
            <div className="modal-content confirmation-modal" onClick={e => e.stopPropagation()}>
                <div className={`confirmation-icon ${type}`}>
                    {/* Icon removed */}
                </div>
                <h3>{title}</h3>
                <div className="confirmation-message">{message}</div>
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>İptal</button>
                    <button
                        className={`btn-confirm ${type}`}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        {type === 'danger' ? 'Evet, Sil' : 'Onayla'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmationModal;
