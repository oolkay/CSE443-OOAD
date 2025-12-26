package com.appointment.api.dto;

import lombok.Data;

/**
 * DTO for requesting a password reset code
 */
@Data
public class PasswordResetRequestDTO {
    private String email;
}

