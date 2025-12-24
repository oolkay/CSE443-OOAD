package com.appointment.api.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Super Admin response operations
 */
@Data
public class SuperAdminResponseDTO {
    private Long userId;
    private String name;
    private String email;
    private String phoneNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}