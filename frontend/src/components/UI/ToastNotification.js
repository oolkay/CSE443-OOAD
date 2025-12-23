import React, { useEffect, useState } from 'react';
import './ToastNotification.css';

const ToastNotification = ({ toasts, removeToast }) => {
    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <Toast key={toast.id} {...toast} removeToast={removeToast} />
            ))}
        </div>
    );
};

const Toast = ({ id, type, message, removeToast }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, 4000); // 4 seconds auto-dismiss

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            removeToast(id);
        }, 400); // Match animation duration
    };

    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
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
