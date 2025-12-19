package com.appointment.api.dto;

import com.appointment.api.entity.ResourceStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Data Transfer Object for returning Resource data to client
 * Used to transfer data from server to client
 *
 * Contains what frontend needs:
 * - Basic resource info (name, description)
 * - Status for toggling (AVAILABLE/OUT_OF_SERVICE)
 * - Timestamps for tracking
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResourceResponseDTO {

    private Long resourceId;
    private String name;
    private String description;
    private List<String> types;
    private ResourceStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}