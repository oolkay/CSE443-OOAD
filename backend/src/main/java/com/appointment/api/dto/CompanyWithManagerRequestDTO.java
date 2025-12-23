package com.appointment.api.dto;

import lombok.Data;

/**
 * Data Transfer Object for creating Company with required Manager
 * According to schema: Every Company must have a Branch Manager
 */
@Data
public class CompanyWithManagerRequestDTO {
    // Company Information
    private String companyName;
    private String companyEmail;
    private String companyAddress;
    private String companyPhoneNumber;

    // Required Manager Information
    private String managerName;
    private String managerEmail;
    private String managerPassword;
}