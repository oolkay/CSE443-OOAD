package com.appointment.api.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Company response
 * According to schema: Every Company must have a Branch Manager
 */
@Data
public class CompanyResponseDTO {
    private Long companyId;
    private String name;
    private String email;
    private String address;
    private String phoneNumber;
    private Long managerId;
    private String managerName;
    private String managerEmail;
    private String managerPhoneNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}