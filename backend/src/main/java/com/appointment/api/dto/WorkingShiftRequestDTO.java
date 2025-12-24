package com.appointment.api.dto;

import lombok.Data;
import java.time.LocalTime;
import jakarta.validation.constraints.*;

@Data
public class WorkingShiftRequestDTO {
    @NotBlank(message = "Gün bilgisi (dayOfWeek) boş olamaz")
    @Pattern(regexp = "^(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)$", message = "Geçersiz gün ismi")
    private String dayOfWeek;

    @NotNull(message = "Başlangıç saati boş olamaz")
    private LocalTime startTime;

    @NotNull(message = "Bitiş saati boş olamaz")
    private LocalTime endTime;
    
    private String shiftName;
}