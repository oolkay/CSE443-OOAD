package com.appointment.api.controller;

import com.appointment.api.dto.*;
import com.appointment.api.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller
 * Handles login, registration, and password reset endpoints
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * Login endpoint
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse loginResponse = authService.login(loginRequest);
            return ResponseEntity.ok(loginResponse);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(false, "Invalid email or password: " + e.getMessage()));
        }
    }

    /**
     * Register endpoint (FR-SYS-005)
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            LoginResponse loginResponse = authService.register(registerRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(loginResponse);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, "Registration failed: " + e.getMessage()));
        }
    }

    /**
     * Forgot password endpoint (FR-SYS-006)
     * POST /api/auth/forgot-password
     * Generates reset token and sends email
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest forgotPasswordRequest) {
        try {
            authService.generatePasswordResetToken(forgotPasswordRequest.getEmail());
            return ResponseEntity.ok(new ApiResponse(true, "Password reset email sent successfully"));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, "User not found: " + e.getMessage()));
        }
    }

    /**
     * Validate reset token endpoint
     * GET /api/auth/validate-reset-token
     */
    @GetMapping("/validate-reset-token")
    public ResponseEntity<?> validateResetToken(@RequestParam String token) {
        try {
            boolean isValid = authService.validatePasswordResetToken(token);
            if (isValid) {
                return ResponseEntity.ok(new ApiResponse(true, "Token is valid"));
            } else {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse(false, "Token is invalid or expired"));
            }
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, "Token validation failed: " + e.getMessage()));
        }
    }

    /**
     * Reset password endpoint (FR-SYS-006)
     * POST /api/auth/reset-password
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest resetPasswordRequest) {
        try {
            authService.resetPassword(resetPasswordRequest);
            return ResponseEntity.ok(new ApiResponse(true, "Password reset successfully"));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, "Password reset failed: " + e.getMessage()));
        }
    }
}
