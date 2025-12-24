package com.appointment.api.provider;

/**
 * Base interface for all notification providers
 * This abstraction allows different notification channels (Email, SMS, Push, etc.)
 * to be implemented and used interchangeably throughout the system.
 * 
 * Design Pattern: Strategy Pattern
 * - Defines a family of notification algorithms
 * - Encapsulates each one and makes them interchangeable
 */
public interface NotificationProvider {
    
    /**
     * Send a notification to a recipient
     * 
     * @param recipient The recipient's contact information (email, phone, etc.)
     * @param subject The subject/title of the notification
     * @param message The notification message content
     * @throws NotificationException if the notification fails to send
     */
    void sendNotification(String recipient, String subject, String message) throws NotificationException;
    
    /**
     * Send a notification using a template
     * 
     * @param recipient The recipient's contact information
     * @param templateName The name of the template to use
     * @param templateData Data to populate the template
     * @throws NotificationException if the notification fails to send
     */
    void sendTemplatedNotification(String recipient, String templateName, Object templateData) throws NotificationException;
    
    /**
     * Check if this notification provider is available and properly configured
     * 
     * @return true if the provider is ready to send notifications
     */
    boolean isAvailable();
    
    /**
     * Get the type/name of this notification provider
     * 
     * @return Provider type (e.g., "EMAIL", "SMS", "PUSH")
     */
    String getProviderType();
}

