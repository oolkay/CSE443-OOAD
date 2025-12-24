package com.appointment.api.service;

import com.appointment.api.entity.PasswordResetToken;
import com.appointment.api.entity.User;
import com.appointment.api.repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service for handling password reset token operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int CODE_LENGTH = 6;
    private static final int TOKEN_EXPIRY_MINUTES = 15; // Token expires in 15 minutes
    
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Generate a random 6-character code
     */
    public String generateResetCode() {
        StringBuilder code = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            code.append(CHARACTERS.charAt(secureRandom.nextInt(CHARACTERS.length())));
        }
        return code.toString();
    }

    /**
     * Create a new password reset token for a user
     * Invalidates any previous unused tokens for the same user
     */
    @Transactional
    public PasswordResetToken createResetToken(User user) {
        // Invalidate any previous tokens for this user
        passwordResetTokenRepository.invalidateUserTokens(user);
        
        // Generate new token
        String code = generateResetCode();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(TOKEN_EXPIRY_MINUTES);
        
        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setCode(code);
        token.setExpiresAt(expiresAt);
        
        return passwordResetTokenRepository.save(token);
    }

    /**
     * Validate a reset code for a user
     * Returns the token if valid, empty otherwise
     */
    public Optional<PasswordResetToken> validateResetCode(String code, User user) {
        log.debug("Validating reset code '{}' for user ID: {}", code, user.getUserId());
        Optional<PasswordResetToken> token = passwordResetTokenRepository.findValidTokenByCodeAndUser(
            code, user, LocalDateTime.now()
        );
        if (token.isPresent()) {
            log.debug("Valid token found, expires at: {}", token.get().getExpiresAt());
        } else {
            log.debug("No valid token found for code: {}", code);
        }
        return token;
    }

    /**
     * Mark a token as used
     */
    @Transactional
    public void markTokenAsUsed(PasswordResetToken token) {
        token.setUsed(true);
        passwordResetTokenRepository.save(token);
    }

    /**
     * Clean up expired tokens (can be scheduled to run periodically)
     */
    @Transactional
    public void cleanupExpiredTokens() {
        passwordResetTokenRepository.deleteExpiredTokens(LocalDateTime.now());
    }

    /**
     * Find a token by code
     */
    public Optional<PasswordResetToken> findByCode(String code) {
        return passwordResetTokenRepository.findByCode(code);
    }
    
    /**
     * Create a password reset session after code verification
     * Returns a session token valid for 10 minutes
     */
    @Transactional
    public String createPasswordResetSession(User user, PasswordResetToken verifiedToken) {
        log.info("Creating password reset session for user: {}", user.getUserId());
        
        // Generate a secure random session token
        String sessionToken = generateSessionToken();
        
        // Store it in DB with expiration
        verifiedToken.setSessionToken(sessionToken);
        verifiedToken.setSessionExpiresAt(LocalDateTime.now().plusMinutes(10));
        passwordResetTokenRepository.save(verifiedToken);
        
        log.info("Password reset session created successfully");
        return sessionToken;
    }
    
    /**
     * Generate a secure session token (32 characters)
     */
    private String generateSessionToken() {
        StringBuilder token = new StringBuilder(32);
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        
        for (int i = 0; i < 32; i++) {
            token.append(chars.charAt(secureRandom.nextInt(chars.length())));
        }
        
        return token.toString();
    }
    
    /**
     * Validate a session token and return the associated user
     */
    public Optional<User> validateSessionToken(String sessionToken) {
        log.debug("Validating session token");
        
        Optional<PasswordResetToken> tokenOpt = passwordResetTokenRepository
            .findValidSessionToken(sessionToken, LocalDateTime.now());
        
        if (tokenOpt.isPresent()) {
            log.debug("Valid session token found for user: {}", tokenOpt.get().getUser().getUserId());
            return Optional.of(tokenOpt.get().getUser());
        } else {
            log.debug("No valid session token found");
            return Optional.empty();
        }
    }
    
    /**
     * Invalidate a session token after password reset
     */
    @Transactional
    public void invalidateSessionToken(String sessionToken) {
        log.debug("Invalidating session token");
        
        passwordResetTokenRepository.findBySessionToken(sessionToken)
            .ifPresent(token -> {
                token.setUsed(true);
                passwordResetTokenRepository.save(token);
                log.debug("Session token invalidated successfully");
            });
    }
}

