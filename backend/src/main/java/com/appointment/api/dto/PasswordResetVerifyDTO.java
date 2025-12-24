package com.appointment.api.dto;

import lombok.Data;

/**
 * DTO for verifying reset code and setting new password
 */
@Data
public class PasswordResetVerifyDTO {
    private String email;
    private String code;
    private String newPassword;
}

