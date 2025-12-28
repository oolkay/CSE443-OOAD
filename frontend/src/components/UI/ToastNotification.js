import React, { useEffect, useState } from 'react';
import './ToastNotification.css';

import ReactDOM from 'react-dom';

const ToastNotification = ({ toasts, removeToast, message, type, onClose }) => {
    // Handle both array of toasts and single toast
    if (message !== undefined) {
        // Single toast mode (legacy support)
        return ReactDOM.createPortal(
            <div className="toast-container">
                <Toast id={Date.now()} type={type} message={message} removeToast={onClose} />
            </div>,
            document.body
        );
    }

    // Multiple toasts mode
    if (!toasts || toasts.length === 0) return null;

    return ReactDOM.createPortal(
        <div className="toast-container">
            {toasts.map((toast) => (
                <Toast key={toast.id} {...toast} removeToast={removeToast} />
            ))}
        </div>,
        document.body
    );
};

const Toast = ({ id, type, message, removeToast }) => {
    const [isExiting, setIsExiting] = useState(false);

    const handleClose = React.useCallback(() => {
        setIsExiting(true);
        setTimeout(() => {
            removeToast(id);
        }, 400); // Match animation duration
    }, [id, removeToast]);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, 4000); // 4 seconds auto-dismiss

        return () => clearTimeout(timer);
    }, [handleClose]);

    const icons = {
        success: '',
        error: '',
        info: '',
        warning: ''
    };

    return (
        <div className={`toast toast-${type} ${isExiting ? 'toast-exit' : 'toast-enter'}`} onClick={handleClose}>
            <span className="toast-icon">{icons[type] || icons.info}</span>
            <span className="toast-message">{message}</span>
            <button className="toast-close">&times;</button>
        </div>
    );
};

export default ToastNotification;
