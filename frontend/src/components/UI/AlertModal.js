import React from 'react';
import ReactDOM from 'react-dom';
import './ConfirmationModal.css'; // Reusing the same CSS for consistency

const AlertModal = ({ isOpen, onClose, title, message, type = 'info' }) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="modal-overlay confirmation-overlay" onClick={onClose}>
            <div className="modal-content confirmation-modal" onClick={e => e.stopPropagation()}>
                <div className={`confirmation-icon ${type}`}>
                    {/* Icon logic can be added here if needed */}
                </div>
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="modal-footer" style={{ justifyContent: 'center' }}>
                    <button
                        className="btn-confirm"
                        style={{ width: '100%' }}
                        onClick={onClose}
                    >
                        Tamam
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AlertModal;
