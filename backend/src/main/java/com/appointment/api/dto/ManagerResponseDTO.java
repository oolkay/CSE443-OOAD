package com.appointment.api.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Manager response
 */
@Data
public class ManagerResponseDTO {
    private Long id;
    private String name;
    private String email;
    private Long companyId;
    private String companyName;
    private String userType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}