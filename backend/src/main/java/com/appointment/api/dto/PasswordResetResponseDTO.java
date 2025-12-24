package com.appointment.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for password reset responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetResponseDTO {
    private boolean success;
    private String message;
}

