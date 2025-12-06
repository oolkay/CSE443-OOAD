package com.appointment.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeAvailabilityResponse {
    private Long employeeId;
    private String employeeName;
    private LocalDate date;
    private LocalTime workStartTime;
    private LocalTime workEndTime;
    private List<AvailableSlotDTO> availableSlots;
    private List<AvailableSlotDTO> bookedSlots;
}
