package com.appointment.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;

/**
 * DTO for email template data
 * Contains all the information needed to populate email templates
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailTemplateData {

    // Customer information
    private String customerName;
    private String customerEmail;

    // Company information
    private String companyName;

    // Service information
    private String serviceName;
    private Long durationMinutes;

    // Employee information
    private String employeeName;

    // Appointment information
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String appointmentDateTime; // Formatted string for backward compatibility
    private String appointmentStatus;

    // Additional information
    private String reason; // For rejection or cancellation
    private String additionalNotes;
    private Map<String, Object> additionalData; // For flexible data passing
}
