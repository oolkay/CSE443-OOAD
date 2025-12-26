package com.appointment.api.dto;

import lombok.Data;
import java.time.LocalTime;

@Data
public class WorkingShiftResponseDTO {
    private String dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private String shiftName;
}
