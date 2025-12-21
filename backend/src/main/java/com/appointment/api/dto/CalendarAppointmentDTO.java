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
    private String service;
    private String customer;
}

