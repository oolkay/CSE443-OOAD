package com.appointment.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Data Transfer Object for returning Service data to client
 * Used to transfer data from server to client
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceResponseDTO {

    private Long id;
    private String name;
    private String description;
    private Integer durationMinutes;
    private BigDecimal price;
    private List<String> requiredResourceTypes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

