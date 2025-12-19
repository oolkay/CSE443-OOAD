package com.appointment.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Resource entity - represents equipment or facilities required for services
 */
@Entity
@Table(name = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long resourceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(length = 400)
    private String types; // Resource types (comma-separated, max 4): "Epilasyon Cihazı, Lazer Bölümü, Cilt Bakımı"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ResourceStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = ResourceStatus.AVAILABLE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Get types as a List<String>
     */
    public List<String> getTypesList() {
        if (types == null || types.trim().isEmpty()) {
            return List.of();
        }
        return Arrays.stream(types.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .limit(4) // Maximum 4 types
                .collect(Collectors.toList());
    }

    /**
     * Set types from a List<String>
     */
    public void setTypesList(List<String> typesList) {
        if (typesList == null || typesList.isEmpty()) {
            this.types = null;
            return;
        }

        // Limit to 4 types and filter empty strings
        List<String> validTypes = typesList.stream()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .limit(4)
                .collect(Collectors.toList());

        if (validTypes.isEmpty()) {
            this.types = null;
        } else {
            this.types = String.join(", ", validTypes);
        }
    }

    /**
     * Check if resource has a specific type
     */
    public boolean hasType(String type) {
        return getTypesList().contains(type);
    }

    /**
     * Add a type to the resource (max 4 types)
     */
    public void addType(String type) {
        if (type == null || type.trim().isEmpty()) {
            return;
        }

        List<String> currentTypes = getTypesList();
        if (currentTypes.size() >= 4) {
            throw new IllegalStateException("Resource cannot have more than 4 types");
        }

        String trimmedType = type.trim();
        if (!currentTypes.contains(trimmedType)) {
            currentTypes.add(trimmedType);
            setTypesList(currentTypes);
        }
    }

    /**
     * Remove a type from the resource
     */
    public void removeType(String type) {
        if (type == null || type.trim().isEmpty()) {
            return;
        }

        List<String> currentTypes = getTypesList();
        currentTypes.remove(type.trim());
        setTypesList(currentTypes);
    }
}
