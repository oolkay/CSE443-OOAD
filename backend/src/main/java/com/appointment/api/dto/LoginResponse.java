package com.appointment.api.dto;

/**
 * Login Response DTO
 * Returns JWT token and user information upon successful login
 */
public class LoginResponse {

    private String token;
    private String type = "Bearer";
    private Long userId;
    private String email;
    private String name;
    private String role;
    private long expiresIn;

    public LoginResponse(String token, Long userId, String email, String name, String role, long expiresIn) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.name = name;
        this.role = role;
        this.expiresIn = expiresIn;
    }

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }
}
