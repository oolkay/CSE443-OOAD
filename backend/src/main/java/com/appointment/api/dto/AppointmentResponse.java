package com.appointment.api.dto;

import com.appointment.api.entity.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentResponse {
    private Long appointmentId;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private Long employeeId;
    private String employeeName;
    private Long serviceId;
    private String serviceName;
    private Long serviceDuration;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private AppointmentStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
