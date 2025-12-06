package com.appointment.api.dto;

import lombok.Data;
import java.time.LocalTime;

@Data
public class WorkingShiftRequestDTO {
    private String dayOfWeek; // e.g., "MONDAY"
    private LocalTime startTime;
    private LocalTime endTime;
    private String shiftName; // Optional, e.g., "Morning Shift"
}