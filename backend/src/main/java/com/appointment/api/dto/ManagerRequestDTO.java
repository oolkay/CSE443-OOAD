package com.appointment.api.dto;

import lombok.Data;

/**
 * Data Transfer Object for Manager creation and update requests
 */
@Data
public class ManagerRequestDTO {
    private String name;
    private String email;
    private String password;
    private Long companyId;
    private String phoneNumber;
}