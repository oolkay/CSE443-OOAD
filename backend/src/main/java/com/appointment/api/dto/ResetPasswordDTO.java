package com.appointment.api.dto;

import lombok.Data;

/**
 * DTO for resetting password with session token (Step 3)
 */
@Data
public class ResetPasswordDTO {
    private String sessionToken; // Session token from step 2
    private String newPassword;
}

