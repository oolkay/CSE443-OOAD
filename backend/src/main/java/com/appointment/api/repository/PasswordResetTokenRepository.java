package com.appointment.api.repository;

import com.appointment.api.entity.PasswordResetToken;
import com.appointment.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    
    /**
     * Find a valid (not used and not expired) token by code and user
     */
    @Query("SELECT prt FROM PasswordResetToken prt WHERE prt.code = :code AND prt.user = :user AND prt.used = false AND prt.expiresAt > :now")
    Optional<PasswordResetToken> findValidTokenByCodeAndUser(@Param("code") String code, @Param("user") User user, @Param("now") LocalDateTime now);
    
    /**
     * Find a token by code
     */
    Optional<PasswordResetToken> findByCode(String code);
    
    /**
     * Find all tokens for a specific user
     */
    Optional<PasswordResetToken> findByUser(User user);
    
    /**
     * Delete all expired tokens (cleanup method)
     */
    @Modifying
    @Query("DELETE FROM PasswordResetToken prt WHERE prt.expiresAt < :now")
    void deleteExpiredTokens(@Param("now") LocalDateTime now);
    
    /**
     * Mark all previous tokens for a user as used when generating a new one
     */
    @Modifying
    @Query("UPDATE PasswordResetToken prt SET prt.used = true WHERE prt.user = :user AND prt.used = false")
    void invalidateUserTokens(@Param("user") User user);
    
    /**
     * Find a valid session token (not used and not expired)
     */
    @Query("SELECT prt FROM PasswordResetToken prt WHERE prt.sessionToken = :sessionToken AND prt.used = false AND prt.sessionExpiresAt > :now")
    Optional<PasswordResetToken> findValidSessionToken(@Param("sessionToken") String sessionToken, @Param("now") LocalDateTime now);
    
    /**
     * Find a token by session token
     */
    Optional<PasswordResetToken> findBySessionToken(String sessionToken);
}

