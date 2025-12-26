package com.appointment.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity for storing password reset tokens
 * Stores one-time 6-character codes for password reset functionality
 */
@Entity
@Table(name = "password_reset_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 6)
    private String code;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private boolean used;

    // Session token for password reset (generated after code verification)
    @Column(length = 64, unique = true)
    private String sessionToken;

    @Column
    private LocalDateTime sessionExpiresAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        used = false;
    }

    /**
     * Check if the token is expired
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    /**
     * Check if the token is valid (not used and not expired)
     */
    public boolean isValid() {
        return !used && !isExpired();
    }
}

