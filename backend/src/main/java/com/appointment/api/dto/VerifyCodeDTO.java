package com.appointment.api.dto;

import lombok.Data;

/**
 * DTO for verifying the 6-character reset code (Step 2)
 */
@Data
public class VerifyCodeDTO {
    private String email;
    private String code;
}

