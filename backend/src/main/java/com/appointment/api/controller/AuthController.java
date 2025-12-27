package com.appointment.api.controller;

import com.appointment.api.dto.*;
import com.appointment.api.entity.User;
import com.appointment.api.entity.PasswordResetToken;
import com.appointment.api.repository.UserRepository;
import com.appointment.api.service.AuthService;
import com.appointment.api.service.EmailNotificationService;
import com.appointment.api.service.PasswordResetService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * Authentication Controller
 * Handles login, registration, and password reset endpoints
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;
    @Autowired
    private PasswordResetService passwordResetService;
    @Autowired
    private EmailNotificationService emailNotificationService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private UserRepository userRepository;

    /**
     * Login endpoint
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse loginResponse = authService.login(loginRequest);
            log.info("Login successful for: {}", loginRequest.getEmail());
            return ResponseEntity.ok(loginResponse);
        } catch (Exception e) {
            log.error("Login failed: {}", e.getMessage());
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
     * Step 1: Request a password reset code
     * POST /api/auth/password-reset/request
     */
    @PostMapping("/password-reset/request")
    public ResponseEntity<PasswordResetResponseDTO> requestPasswordReset(
            @RequestBody PasswordResetRequestDTO request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            // Don't reveal if user exists or not for security reasons
            return ResponseEntity.ok(
                    new PasswordResetResponseDTO(true, "If the email exists, a reset code has been sent"));
        }

        User user = userOpt.get();
        PasswordResetToken token = passwordResetService.createResetToken(user);

        // Send email with the reset code
        try {
            sendResetCodeEmail(user, token.getCode());
            log.info("Password reset email sent successfully for: {}", request.getEmail());
        } catch (Exception e) {
            log.error("Failed to send password reset email for: {}", request.getEmail(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new PasswordResetResponseDTO(false, "Failed to send reset code email"));
        }

        return ResponseEntity.ok(
                new PasswordResetResponseDTO(true, "If the email exists, a reset code has been sent"));
    }

    /**
     * Step 2: Verify the 6-character code and return a session token
     * POST /api/auth/password-reset/verify-code
     */
    @PostMapping("/password-reset/verify-code")
    public ResponseEntity<VerifyCodeResponseDTO> verifyResetCode(
            @RequestBody VerifyCodeDTO request) {

        log.info("Verifying reset code for email: {}", request.getEmail());

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            log.warn("User not found for email: {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new VerifyCodeResponseDTO(false, "Invalid email or reset code", null));
        }

        User user = userOpt.get();
        Optional<PasswordResetToken> tokenOpt = passwordResetService.validateResetCode(
                request.getCode(), user);

        if (tokenOpt.isEmpty()) {
            log.warn("Invalid or expired reset code for user: {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new VerifyCodeResponseDTO(false, "Invalid or expired reset code", null));
        }

        log.info("Reset code validated successfully for: {}", request.getEmail());

        // Generate a session token (valid for 10 minutes)
        String sessionToken = passwordResetService.createPasswordResetSession(user, tokenOpt.get());

        // Mark the original code as used (can't be used again)
        // passwordResetService.markTokenAsUsed(tokenOpt.get());

        return ResponseEntity.ok(
                new VerifyCodeResponseDTO(true, "Code verified successfully. You can now reset your password.",
                        sessionToken));
    }

    /**
     * Step 3: Reset password using the session token
     * POST /api/auth/password-reset/reset
     */
    @PostMapping("/password-reset/reset")
    public ResponseEntity<PasswordResetResponseDTO> resetPassword(
            @RequestBody ResetPasswordDTO request) {

        log.info("Attempting to reset password with session token");

        // Validate session token
        Optional<User> userOpt = passwordResetService.validateSessionToken(request.getSessionToken());
        if (userOpt.isEmpty()) {
            log.warn("Invalid or expired session token");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new PasswordResetResponseDTO(false, "Invalid or expired session token"));
        }

        User user = userOpt.get();

        // Update the password
        String encodedPassword = passwordEncoder.encode(request.getNewPassword());
        user.setPassword(encodedPassword);
        User savedUser = userRepository.save(user);

        // Invalidate the session token (one-time use)
        passwordResetService.invalidateSessionToken(request.getSessionToken());

        log.info("Password reset completed successfully for: {}", user.getEmail());

        return ResponseEntity.ok(
                new PasswordResetResponseDTO(true, "Password has been reset successfully"));
    }

    /**
     * Helper method to send reset code email using the professional HTML template
     */
    private void sendResetCodeEmail(User user, String code) {
        emailNotificationService.sendPasswordResetEmail(user.getEmail(), user.getName(), code);
    }
}
