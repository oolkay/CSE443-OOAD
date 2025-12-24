package com.appointment.api.dto;

import lombok.Data;

/**
 * Data Transfer Object for Super Admin request operations
 */
@Data
public class SuperAdminRequestDTO {
    private String name;
    private String email;
    private String password;
    private String phoneNumber;
}