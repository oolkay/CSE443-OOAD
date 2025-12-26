package com.appointment.api.provider;

import com.appointment.api.dto.EmailTemplateData;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

/**
 * Email implementation of the NotificationProvider interface
 * Uses Spring's JavaMailSender to send email notifications
 * 
 * This class demonstrates:
 * - Strategy Pattern implementation (NotificationProvider)
 * - Dependency Injection (JavaMailSender)
 * - Error handling and logging
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationProvider implements NotificationProvider {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${notification.email.enabled:true}")
    private boolean enabled;
    
    /**
     * Send a simple text email notification
     */
    @Override
    public void sendNotification(String recipient, String subject, String message) throws NotificationException {
        if (!enabled) {
            log.warn("Email notifications are disabled. Skipping email to: {}", recipient);
            return;
        }
        
        try {
            log.info("Sending email to: {} with subject: {}", recipient, subject);
            
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(fromEmail);
            mailMessage.setTo(recipient);
            mailMessage.setSubject(subject);
            mailMessage.setText(message);
            
            mailSender.send(mailMessage);
            
            log.info("Email sent successfully to: {}", recipient);
            
        } catch (MailException e) {
            log.error("Failed to send email to: {}", recipient, e);
            throw new NotificationException("Failed to send email notification", e);
        }
    }
    
    /**
     * Send an HTML email using a template
     * The templateData should be an instance of EmailTemplateData or similar
     */
    @Override
    public void sendTemplatedNotification(String recipient, String templateName, Object templateData) 
            throws NotificationException {
        if (!enabled) {
            log.warn("Email notifications are disabled. Skipping templated email to: {}", recipient);
            return;
        }
        
        try {
            
            // Build HTML content based on template
            String htmlContent = buildHtmlFromTemplate(templateName, templateData);
            String subject = extractSubjectFromTemplate(templateName, templateData);
            log.info("Email subject: '{}'", subject);
            log.info("HTML content length: {} characters", htmlContent.length());
     
            sendHtmlEmail(recipient, subject, htmlContent);
        } catch (MessagingException e) {
            log.error("MessagingException while sending templated email '{}' to: {}", templateName, recipient, e);
            throw new NotificationException("Failed to send templated email", e);
        } catch (Exception e) {
            log.error("Unexpected exception while sending templated email '{}' to: {}", templateName, recipient, e);
            throw new NotificationException("Failed to send templated email", e);
        }
    }
    
    /**
     * Send HTML formatted email
     */
    public void sendHtmlEmail(String recipient, String subject, String htmlContent) 
            throws NotificationException, MessagingException {
        
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
        
        helper.setFrom(fromEmail);
        helper.setTo(recipient);
        helper.setSubject(subject);
        helper.setText(htmlContent, true); // true = HTML content
        
        try {
            mailSender.send(mimeMessage);
        } catch (MailException e) {
            log.error("Failed to send HTML email to: {}", recipient, e);
            throw new NotificationException("Failed to send HTML email", e);
        }
    }
    
    /**
     * Build HTML content from template name and data
     * In a real implementation, this would use a template engine like Thymeleaf or Freemarker
     */
    private String buildHtmlFromTemplate(String templateName, Object templateData) {
        if (!(templateData instanceof EmailTemplateData)) {
            log.warn("Template data is not of type EmailTemplateData, using default template");
            return "<html><body>" + templateData.toString() + "</body></html>";
        }
        
        EmailTemplateData data = (EmailTemplateData) templateData;
        
        // Build HTML based on template name
        return switch (templateName.toUpperCase()) {
            case "APPOINTMENT_CONFIRMATION" -> buildAppointmentConfirmationHtml(data);
            case "APPOINTMENT_APPROVAL" -> buildAppointmentApprovalHtml(data);
            case "APPOINTMENT_REJECTION" -> buildAppointmentRejectionHtml(data);
            case "APPOINTMENT_CANCELLATION" -> buildAppointmentCancellationHtml(data);
            case "APPOINTMENT_REMINDER" -> buildAppointmentReminderHtml(data);
            case "PASSWORD_RESET" -> buildPasswordResetHtml(data);
            default -> buildDefaultHtml(data);
        };
    }
    
    /**
     * Extract subject from template
     */
    private String extractSubjectFromTemplate(String templateName, Object templateData) {
        if (!(templateData instanceof EmailTemplateData)) {
            return "Notification from Appointment System";
        }
        
        EmailTemplateData data = (EmailTemplateData) templateData;
        
        return switch (templateName.toUpperCase()) {
            case "APPOINTMENT_CONFIRMATION" -> "Appointment Request Received - " + data.getCompanyName();
            case "APPOINTMENT_APPROVAL" -> "Appointment Confirmed - " + data.getCompanyName();
            case "APPOINTMENT_REJECTION" -> "Appointment Request Update - " + data.getCompanyName();
            case "APPOINTMENT_CANCELLATION" -> "Appointment Cancelled - " + data.getCompanyName();
            case "APPOINTMENT_REMINDER" -> "Appointment Reminder - " + data.getCompanyName();
            case "PASSWORD_RESET" -> "Password Reset Code - Appointment Management System";
            default -> "Notification from " + data.getCompanyName();
        };
    }
    
    // HTML Template Builders
    
    private String buildAppointmentConfirmationHtml(EmailTemplateData data) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: ##333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: ##4CAF50; color: white; padding: 20px; text-align: center; }
                    .content { background-color: ##f9f9f9; padding: 20px; border: 1px solid ##ddd; }
                    .info-box { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid ##4CAF50; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: ##777; }
                    .status { color: ##FF9800; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Appointment Request Received</h1>
                    </div>
                    <div class="content">
                        <p>Dear %s,</p>
                        <p>Your appointment request has been received and is currently <span class="status">PENDING</span> approval.</p>
                        
                        <div class="info-box">
                            <h3>Appointment Details:</h3>
                            <p><strong>Company:</strong> %s</p>
                            <p><strong>Service:</strong> %s</p>
                            <p><strong>Employee:</strong> %s</p>
                            <p><strong>Date & Time:</strong> %s</p>
                            <p><strong>Duration:</strong> %s minutes</p>
                        </div>
                        
                        <p>You will receive a confirmation email once your appointment is approved by our team.</p>
                        <p>If you have any questions, please don't hesitate to contact us.</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from %s Appointment System</p>
                        <p>Please do not reply to this email</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                data.getCustomerName(),
                data.getCompanyName(),
                data.getServiceName(),
                data.getEmployeeName(),
                data.getAppointmentDateTime(),
                data.getDurationMinutes(),
                data.getCompanyName()
            );
    }
    
    private String buildAppointmentApprovalHtml(EmailTemplateData data) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: ##333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: ##4CAF50; color: white; padding: 20px; text-align: center; }
                    .content { background-color: ##f9f9f9; padding: 20px; border: 1px solid ##ddd; }
                    .info-box { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid ##4CAF50; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: ##777; }
                    .status { color: ##4CAF50; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✓ Appointment Confirmed!</h1>
                    </div>
                    <div class="content">
                        <p>Dear %s,</p>
                        <p>Great news! Your appointment has been <span class="status">APPROVED</span>.</p>
                        
                        <div class="info-box">
                            <h3>Confirmed Appointment:</h3>
                            <p><strong>Company:</strong> %s</p>
                            <p><strong>Service:</strong> %s</p>
                            <p><strong>Employee:</strong> %s</p>
                            <p><strong>Date & Time:</strong> %s</p>
                            <p><strong>Duration:</strong> %s minutes</p>
                        </div>
                        
                        <p>Please arrive 5-10 minutes early for your appointment.</p>
                        <p>If you need to cancel or reschedule, please contact us as soon as possible.</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from %s Appointment System</p>
                        <p>Please do not reply to this email</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                data.getCustomerName(),
                data.getCompanyName(),
                data.getServiceName(),
                data.getEmployeeName(),
                data.getAppointmentDateTime(),
                data.getDurationMinutes(),
                data.getCompanyName()
            );
    }
    
    private String buildAppointmentRejectionHtml(EmailTemplateData data) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: ##333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: ##f44336; color: white; padding: 20px; text-align: center; }
                    .content { background-color: ##f9f9f9; padding: 20px; border: 1px solid ##ddd; }
                    .info-box { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid ##f44336; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: ##777; }
                    .status { color: ##f44336; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Appointment Request Update</h1>
                    </div>
                    <div class="content">
                        <p>Dear %s,</p>
                        <p>We regret to inform you that your appointment request has been <span class="status">REJECTED</span>.</p>
                        
                        <div class="info-box">
                            <h3>Appointment Details:</h3>
                            <p><strong>Company:</strong> %s</p>
                            <p><strong>Service:</strong> %s</p>
                            <p><strong>Employee:</strong> %s</p>
                            <p><strong>Date & Time:</strong> %s</p>
                            <p><strong>Reason:</strong> %s</p>
                        </div>
                        
                        <p>We apologize for any inconvenience. Please feel free to book another time slot that works better for you.</p>
                        <p>If you have any questions, please contact us directly.</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from %s Appointment System</p>
                        <p>Please do not reply to this email</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                data.getCustomerName(),
                data.getCompanyName(),
                data.getServiceName(),
                data.getEmployeeName(),
                data.getAppointmentDateTime(),
                data.getReason() != null ? data.getReason() : "Not specified",
                data.getCompanyName()
            );
    }
    
    private String buildAppointmentCancellationHtml(EmailTemplateData data) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: ##333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: ##FF9800; color: white; padding: 20px; text-align: center; }
                    .content { background-color: ##f9f9f9; padding: 20px; border: 1px solid ##ddd; }
                    .info-box { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid ##FF9800; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: ##777; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Appointment Cancelled</h1>
                    </div>
                    <div class="content">
                        <p>Dear %s,</p>
                        <p>This email confirms that your appointment has been cancelled.</p>
                        
                        <div class="info-box">
                            <h3>Cancelled Appointment:</h3>
                            <p><strong>Company:</strong> %s</p>
                            <p><strong>Service:</strong> %s</p>
                            <p><strong>Employee:</strong> %s</p>
                            <p><strong>Date & Time:</strong> %s</p>
                        </div>
                        
                        <p>We hope to serve you again in the future. You can book a new appointment at any time.</p>
                        <p>If this cancellation was made in error, please contact us immediately.</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from %s Appointment System</p>
                        <p>Please do not reply to this email</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                data.getCustomerName(),
                data.getCompanyName(),
                data.getServiceName(),
                data.getEmployeeName(),
                data.getAppointmentDateTime(),
                data.getCompanyName()
            );
    }
    
    private String buildAppointmentReminderHtml(EmailTemplateData data) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: ##333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: ##2196F3; color: white; padding: 20px; text-align: center; }
                    .content { background-color: ##f9f9f9; padding: 20px; border: 1px solid ##ddd; }
                    .info-box { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid ##2196F3; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: ##777; }
                    .reminder { color: ##2196F3; font-weight: bold; font-size: 18px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>⏰ Appointment Reminder</h1>
                    </div>
                    <div class="content">
                        <p>Dear %s,</p>
                        <p class="reminder">This is a friendly reminder about your upcoming appointment.</p>
                        
                        <div class="info-box">
                            <h3>Appointment Details:</h3>
                            <p><strong>Company:</strong> %s</p>
                            <p><strong>Service:</strong> %s</p>
                            <p><strong>Employee:</strong> %s</p>
                            <p><strong>Date & Time:</strong> %s</p>
                            <p><strong>Duration:</strong> %s minutes</p>
                        </div>
                        
                        <p>Please arrive 5-10 minutes early for your appointment.</p>
                        <p>If you need to cancel or reschedule, please contact us as soon as possible.</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from %s Appointment System</p>
                        <p>Please do not reply to this email</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                data.getCustomerName(),
                data.getCompanyName(),
                data.getServiceName(),
                data.getEmployeeName(),
                data.getAppointmentDateTime(),
                data.getDurationMinutes(),
                data.getCompanyName()
            );
    }
    
    private String buildPasswordResetHtml(EmailTemplateData data) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: ##333; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, ##667eea 0%%, ##764ba2 100%%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background-color: ##ffffff; padding: 30px; border: 1px solid ##e0e0e0; border-top: none; }
                    .code-box { 
                        background: linear-gradient(135deg, ##667eea 0%%, ##764ba2 100%%);
                        color: white;
                        padding: 20px;
                        margin: 25px 0;
                        text-align: center;
                        border-radius: 8px;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    }
                    .code {
                        font-size: 36px;
                        font-weight: bold;
                        letter-spacing: 8px;
                        font-family: 'Courier New', monospace;
                        margin: 10px 0;
                        text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
                    }
                    .warning-box {
                        background-color: ##fff3cd;
                        border-left: 4px solid ##ffc107;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 4px;
                    }
                    .security-note {
                        background-color: ##f8f9fa;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 4px;
                        border-left: 4px solid ##6c757d;
                    }
                    .footer { 
                        text-align: center; 
                        padding: 20px; 
                        font-size: 12px; 
                        color: ##777;
                        background-color: ##f8f9fa;
                        border-radius: 0 0 8px 8px;
                    }
                    .icon { font-size: 48px; margin-bottom: 10px; }
                    ul { padding-left: 20px; }
                    li { margin: 8px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="icon">🔐</div>
                        <h1 style="margin: 0;">Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <p>Dear <strong>%s</strong>,</p>
                        <p>We received a request to reset your password for your Appointment Management System account.</p>
                        
                        <div class="code-box">
                            <p style="margin: 0; font-size: 14px;">Your Password Reset Code:</p>
                            <div class="code"><strong>%s</strong></div>
                            <p style="margin: 0; font-size: 12px; opacity: 0.9;">Enter this code to reset your password</p>
                        </div>
                        
                        <div class="warning-box">
                            <p style="margin: 0;"><strong>⏱️ Important:</strong> This code will expire in <strong>15 minutes</strong> for security reasons.</p>
                        </div>
                        
                        <div style="margin: 20px 0;">
                            <p><strong>How to reset your password:</strong></p>
                            <ul>
                                <li>Enter the 6-character code above on the password reset page</li>
                                <li>Create a new secure password</li>
                                <li>Confirm your new password</li>
                            </ul>
                        </div>
                        
                        <div class="security-note">
                            <p style="margin: 0 0 10px 0;"><strong>🛡️ Security Tips:</strong></p>
                            <ul style="margin: 0;">
                                <li>Never share this code with anyone</li>
                                <li>Our team will never ask for your reset code</li>
                                <li>Use a strong, unique password</li>
                            </ul>
                        </div>
                        
                        <p style="margin-top: 20px;"><strong>Didn't request this?</strong></p>
                        <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged and this code will expire automatically.</p>
                        
                        <p style="margin-top: 30px;">Best regards,<br><strong>Appointment Management System Team</strong></p>
                    </div>
                    <div class="footer">
                        <p style="margin: 5px 0;">This is an automated security message</p>
                        <p style="margin: 5px 0;">Please do not reply to this email</p>
                        <p style="margin: 5px 0; color: ##999;">© 2025 Appointment Management System. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                data.getCustomerName(),
                data.getReason() // Using 'reason' field to pass the reset code
            );
    }
    
    private String buildDefaultHtml(EmailTemplateData data) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: ##333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: ##333; color: white; padding: 20px; text-align: center; }
                    .content { background-color: ##f9f9f9; padding: 20px; border: 1px solid ##ddd; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: ##777; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Notification from %s</h1>
                    </div>
                    <div class="content">
                        <p>Dear %s,</p>
                        <p>%s</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from %s Appointment System</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                data.getCompanyName(),
                data.getCustomerName(),
                data.getReason() != null ? data.getReason() : "You have received a notification.",
                data.getCompanyName()
            );
    }
    
    @Override
    public boolean isAvailable() {
        return enabled && mailSender != null;
    }
    
    @Override
    public String getProviderType() {
        return "EMAIL";
    }
}

