package com.appointment.api.service;

import com.appointment.api.dto.EmailTemplateData;
import com.appointment.api.entity.Appointment;
import com.appointment.api.provider.EmailNotificationProvider;
import com.appointment.api.provider.NotificationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

/**
 * Service layer for email notifications
 * Provides high-level methods for sending appointment-related emails
 * Acts as a facade to simplify email operations throughout the application
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService {
    
    private final EmailNotificationProvider emailProvider;
    
    private static final DateTimeFormatter DATE_TIME_FORMATTER = 
        DateTimeFormatter.ofPattern("EEEE, MMMM dd, yyyy 'at' hh:mm a");
    
    /**
     * Send appointment confirmation email (when customer creates appointment)
     */
    public void sendAppointmentConfirmation(Appointment appointment) {
        try {
            log.info("Sending appointment confirmation email for appointment ID: {}", 
                appointment.getAppointmentId());
            
            EmailTemplateData templateData = buildEmailTemplateData(appointment);
            
            emailProvider.sendTemplatedNotification(
                appointment.getCustomer().getEmail(),
                "APPOINTMENT_CONFIRMATION",
                templateData
            );
            
            log.info("Appointment confirmation email sent successfully");
            
        } catch (NotificationException e) {
            log.error("Failed to send appointment confirmation email", e);
            // Don't throw exception - email failure shouldn't break the appointment creation
        }
    }
    
    /**
     * Send appointment approval email (when employee/manager approves)
     */
    public void sendAppointmentApproval(Appointment appointment) {
        try {
            log.info("Sending appointment approval email for appointment ID: {}", 
                appointment.getAppointmentId());
            
            EmailTemplateData templateData = buildEmailTemplateData(appointment);
            
            emailProvider.sendTemplatedNotification(
                appointment.getCustomer().getEmail(),
                "APPOINTMENT_APPROVAL",
                templateData
            );
            
            log.info("Appointment approval email sent successfully");
            
        } catch (NotificationException e) {
            log.error("Failed to send appointment approval email", e);
        }
    }
    
    /**
     * Send appointment rejection email (when employee/manager rejects)
     */
    public void sendAppointmentRejection(Appointment appointment, String reason) {
        try {
            log.info("Sending appointment rejection email for appointment ID: {}", 
                appointment.getAppointmentId());
            
            EmailTemplateData templateData = buildEmailTemplateData(appointment);
            templateData.setReason(reason);
            
            emailProvider.sendTemplatedNotification(
                appointment.getCustomer().getEmail(),
                "APPOINTMENT_REJECTION",
                templateData
            );
            
            log.info("Appointment rejection email sent successfully");
            
        } catch (NotificationException e) {
            log.error("Failed to send appointment rejection email", e);
        }
    }
    
    /**
     * Send appointment cancellation email (when customer cancels)
     */
    public void sendAppointmentCancellation(Appointment appointment) {
        try {
            log.info("Sending appointment cancellation email for appointment ID: {}", 
                appointment.getAppointmentId());
            
            EmailTemplateData templateData = buildEmailTemplateData(appointment);
            
            emailProvider.sendTemplatedNotification(
                appointment.getCustomer().getEmail(),
                "APPOINTMENT_CANCELLATION",
                templateData
            );
            
            log.info("Appointment cancellation email sent successfully");
            
        } catch (NotificationException e) {
            log.error("Failed to send appointment cancellation email", e);
        }
    }
    
    /**
     * Send appointment reminder email (scheduled reminder before appointment)
     */
    public void sendAppointmentReminder(Appointment appointment) {
        try {
            log.info("Sending appointment reminder email for appointment ID: {}", 
                appointment.getAppointmentId());
            
            EmailTemplateData templateData = buildEmailTemplateData(appointment);
            
            emailProvider.sendTemplatedNotification(
                appointment.getCustomer().getEmail(),
                "APPOINTMENT_REMINDER",
                templateData
            );
            
            log.info("Appointment reminder email sent successfully");
            
        } catch (NotificationException e) {
            log.error("Failed to send appointment reminder email", e);
        }
    }
    
    /**
     * Send appointment update email (when appointment details change)
     */
    public void sendAppointmentUpdate(Appointment appointment) {
        try {
            log.info("Sending appointment update email for appointment ID: {}", 
                appointment.getAppointmentId());
            
            EmailTemplateData templateData = buildEmailTemplateData(appointment);
            templateData.setReason("Your appointment details have been updated.");
            
            emailProvider.sendTemplatedNotification(
                appointment.getCustomer().getEmail(),
                "APPOINTMENT_CONFIRMATION",
                templateData
            );
            
            log.info("Appointment update email sent successfully");
            
        } catch (NotificationException e) {
            log.error("Failed to send appointment update email", e);
        }
    }
    
    /**
     * Send password reset code email
     */
    public void sendPasswordResetEmail(String recipient, String userName, String resetCode) {
        try {
            EmailTemplateData templateData = EmailTemplateData.builder()
                .customerName(userName)
                .customerEmail(recipient)
                .reason(resetCode) // Using reason field to pass the reset code
                .companyName("Appointment System")
                .build();
            
            emailProvider.sendTemplatedNotification(
                recipient,
                "PASSWORD_RESET",
                templateData
            );
            
        } catch (NotificationException e) {
            log.error("Failed to send password reset email", e);
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }
    
    /**
     * Send custom email notification
     */
    public void sendCustomEmail(String recipient, String subject, String message) {
        try {
            log.info("Sending custom email to: {}", recipient);
            
            emailProvider.sendNotification(recipient, subject, message);
            
            log.info("Custom email sent successfully");
            
        } catch (NotificationException e) {
            log.error("Failed to send custom email", e);
        }
    }
    
    /**
     * Build EmailTemplateData from Appointment entity
     */
    private EmailTemplateData buildEmailTemplateData(Appointment appointment) {
        return EmailTemplateData.builder()
            .customerName(appointment.getCustomer().getName())
            .customerEmail(appointment.getCustomer().getEmail())
            .companyName(appointment.getEmployee().getCompany() != null ? 
                appointment.getEmployee().getCompany().getName() : "Appointment System")
            .serviceName(appointment.getService().getName())
            .durationMinutes(appointment.getService().getTimeDuration())
            .employeeName(appointment.getEmployee().getName())
            .appointmentDateTime(appointment.getStartTime().format(DATE_TIME_FORMATTER))
            .appointmentStatus(appointment.getStatus().toString())
            .build();
    }
    
    /**
     * Check if email notification service is available
     */
    public boolean isEmailServiceAvailable() {
        return emailProvider.isAvailable();
    }
}

