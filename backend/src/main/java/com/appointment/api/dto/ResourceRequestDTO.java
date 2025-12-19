package com.appointment.api.dto;

import com.appointment.api.entity.ResourceStatus;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Data Transfer Object for creating and updating a Resource
 * Used to transfer data from client to server
 *
 * Examples:
 * - Create: Massage Table, Saç Kesim Sandalyesi, etc.
 * - Status: AVAILABLE (Uygun), OUT_OF_SERVICE (Servis Dışı)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResourceRequestDTO {

    @NotNull(message = "Company ID is required")
    private Long companyId;

    @NotBlank(message = "Resource name is required")
    @Size(min = 2, max = 100, message = "Resource name must be between 2 and 100 characters")
    private String name;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotEmpty(message = "En az bir kaynak türü gereklidir")
    @Size(max = 4, message = "Bir kaynak en fazla 4 tür olabilir")
    private List<@NotBlank(message = "Kaynak türü boş olamaz")
                @Size(max = 100, message = "Kaynak türü en fazla 100 karakter olabilir") String> types;

    @NotNull(message = "Status is required")
    private ResourceStatus status;
}