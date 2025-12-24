package com.appointment.api.dto;

import lombok.Data;

/**
 * Data Transfer Object for Company creation and update requests
 */
@Data
public class CompanyRequestDTO {
    private String name;
    private String email;
    private String address;
    private String phoneNumber;
}