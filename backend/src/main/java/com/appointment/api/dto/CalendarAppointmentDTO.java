package com.appointment.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalendarAppointmentDTO {
    private Long appointmentId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String employee;
    private Long employeeId;
    private String service;
    private Long serviceId;
    private String customer;
    private String status;
    private Number duration;
}

