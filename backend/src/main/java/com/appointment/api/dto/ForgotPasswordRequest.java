package com.appointment.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Forgot Password Request DTO
 */
public class ForgotPasswordRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    public ForgotPasswordRequest() {}

    public ForgotPasswordRequest(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
