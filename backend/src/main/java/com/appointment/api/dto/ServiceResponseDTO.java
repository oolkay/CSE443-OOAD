package com.appointment.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for returning Service data to client.
 * Used to transfer data from server to client.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceResponseDTO {

    private Long id;
    private String name;
    private String description;
    private Integer durationMinutes;
    private BigDecimal price;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
