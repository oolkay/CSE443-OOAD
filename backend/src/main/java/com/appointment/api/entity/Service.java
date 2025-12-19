package com.appointment.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Entity class representing a Service offered by the appointment system
 * This corresponds to a database table
 */
@Entity
@Table(name = "services")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long serviceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private Long timeDuration; // Duration in minutes

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(length = 400)
    private String requiredResourceTypes; // Required resource types (comma-separated): "Epilasyon Cihazı, Lazer Bölümü"

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper method to get duration as Duration object
    public Duration getDuration() {
        return Duration.ofMinutes(timeDuration);
    }

    /**
     * Get required resource types as a List<String>
     */
    public List<String> getRequiredResourceTypesList() {
        if (requiredResourceTypes == null || requiredResourceTypes.trim().isEmpty()) {
            return List.of();
        }
        return Arrays.stream(requiredResourceTypes.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    /**
     * Set required resource types from a List<String>
     */
    public void setRequiredResourceTypesList(List<String> resourceTypesList) {
        if (resourceTypesList == null || resourceTypesList.isEmpty()) {
            this.requiredResourceTypes = null;
            return;
        }

        List<String> validTypes = resourceTypesList.stream()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .collect(Collectors.toList());

        if (validTypes.isEmpty()) {
            this.requiredResourceTypes = null;
        } else {
            this.requiredResourceTypes = String.join(", ", validTypes);
        }
    }

    /**
     * Check if service requires a specific resource type
     */
    public boolean requiresResourceType(String type) {
        return getRequiredResourceTypesList().contains(type);
    }
}