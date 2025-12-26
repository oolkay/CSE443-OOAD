package com.appointment.api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentRequestDTO {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotNull(message = "Service ID is required")
    private Long serviceId;

    // Optional: can be derived from service, but useful for validation
    private Long companyId;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;
}
