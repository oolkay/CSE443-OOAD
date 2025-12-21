package com.appointment.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalendarSlotDTO {
    private LocalDateTime timestamp;
    private List<CalendarAppointmentDTO> appointments;
}

