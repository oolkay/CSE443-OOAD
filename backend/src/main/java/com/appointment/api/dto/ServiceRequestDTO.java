package com.appointment.api.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;

/**
 * Data Transfer Object for creating a new Service.
 * Used to transfer data from client to server.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceRequestDTO {

    @NotBlank(message = "Service name is required")
    @Size(min = 3, max = 100, message = "Service name must be between 3 and 100 characters")
    private String name;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotNull(message = "Duration is required")
    @Min(value = 15, message = "Duration must be at least 15 minutes")
    @Max(value = 480, message = "Duration cannot exceed 480 minutes")
    private Integer durationMinutes;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Price format is invalid")
    private BigDecimal price;

    private Long companyId;

    private java.util.List<Long> resourceIds;

}
