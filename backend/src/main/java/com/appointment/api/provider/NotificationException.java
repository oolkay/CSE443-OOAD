package com.appointment.api.provider;

/**
 * Custom exception for notification-related errors
 * Provides a specific exception type for notification failures
 */
public class NotificationException extends Exception {
    
    public NotificationException(String message) {
        super(message);
    }
    
    public NotificationException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public NotificationException(Throwable cause) {
        super(cause);
    }
}

