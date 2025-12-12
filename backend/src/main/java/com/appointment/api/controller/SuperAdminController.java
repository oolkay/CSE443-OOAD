package com.appointment.api.controller;

import com.appointment.api.dto.SuperAdminRequestDTO;
import com.appointment.api.dto.SuperAdminResponseDTO;
import com.appointment.api.exception.DuplicateResourceException;
import com.appointment.api.exception.ResourceNotFoundException;
import com.appointment.api.service.SuperAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

/**
 * REST Controller for Super Admin CRUD operations
 * Only Super Admins can manage other Super Admins
 */
@RestController
@RequestMapping("/api/super-admins")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@Slf4j
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    /**
     * Get all Super Admins
     */
    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<SuperAdminResponseDTO>> getAllSuperAdmins() {
        log.info("Fetching all Super Admins");
        List<SuperAdminResponseDTO> superAdmins = superAdminService.getAllSuperAdmins();
        return ResponseEntity.ok(superAdmins);
    }

    /**
     * Get Super Admin by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<SuperAdminResponseDTO> getSuperAdminById(@PathVariable Long id) {
        log.info("Fetching Super Admin with id: {}", id);
        SuperAdminResponseDTO superAdmin = superAdminService.getSuperAdminById(id);
        return ResponseEntity.ok(superAdmin);
    }

    /**
     * Create new Super Admin
     */
    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<SuperAdminResponseDTO> createSuperAdmin(@Valid @RequestBody SuperAdminRequestDTO requestDTO) {
        log.info("Creating new Super Admin with email: {}", requestDTO.getEmail());
        try {
            SuperAdminResponseDTO createdSuperAdmin = superAdminService.createSuperAdmin(requestDTO);
            return new ResponseEntity<>(createdSuperAdmin, HttpStatus.CREATED);
        } catch (DuplicateResourceException e) {
            log.warn("Failed to create Super Admin - duplicate resource: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error creating Super Admin: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Update existing Super Admin
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<SuperAdminResponseDTO> updateSuperAdmin(
            @PathVariable Long id,
            @Valid @RequestBody SuperAdminRequestDTO requestDTO) {

        log.info("Updating Super Admin with id: {}", id);
        try {
            SuperAdminResponseDTO updatedSuperAdmin = superAdminService.updateSuperAdmin(id, requestDTO);
            return ResponseEntity.ok(updatedSuperAdmin);
        } catch (ResourceNotFoundException e) {
            log.warn("Failed to update Super Admin - not found: {}", e.getMessage());
            throw e;
        } catch (DuplicateResourceException e) {
            log.warn("Failed to update Super Admin - duplicate resource: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error updating Super Admin: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Delete Super Admin
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deleteSuperAdmin(@PathVariable Long id) {
        log.info("Deleting Super Admin with id: {}", id);
        try {
            superAdminService.deleteSuperAdmin(id);
            return ResponseEntity.noContent().build();
        } catch (ResourceNotFoundException e) {
            log.warn("Failed to delete Super Admin - not found: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error deleting Super Admin: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Check if Super Admin exists by email
     */
    @GetMapping("/check-email")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Boolean> checkEmailExists(@RequestParam String email) {
        log.info("Checking if Super Admin exists with email: {}", email);
        boolean exists = superAdminService.existsByEmail(email);
        return ResponseEntity.ok(exists);
    }
}