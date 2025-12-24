package com.appointment.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO after successful code verification
 * Contains the session token for password reset
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyCodeResponseDTO {
    private boolean success;
    private String message;
    private String sessionToken; // Token to be used for password reset
}

