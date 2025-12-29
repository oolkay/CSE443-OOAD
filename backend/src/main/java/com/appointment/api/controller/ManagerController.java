package com.appointment.api.controller;

import com.appointment.api.dto.ManagerRequestDTO;
import com.appointment.api.dto.ManagerResponseDTO;
import com.appointment.api.entity.BranchManager;
import com.appointment.api.entity.Company;
import com.appointment.api.entity.User;
import com.appointment.api.exception.DuplicateResourceException;
import com.appointment.api.exception.ResourceNotFoundException;
import com.appointment.api.repository.BranchManagerRepository;
import com.appointment.api.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST Controller for Manager account management
 * Super Admin can create and manage branch managers
 */
@RestController
@Slf4j
@RequestMapping("/api/managers")
@RequiredArgsConstructor
public class ManagerController {

    private final BranchManagerRepository managerRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Get all managers
     */
    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<ManagerResponseDTO>> getAllManagers() {
        log.info("GET /api/managers - Fetching all managers");
        List<BranchManager> managers = managerRepository.findAll();
        log.info("Found {} managers", managers.size());
        List<ManagerResponseDTO> response = managers.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Get manager by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ManagerResponseDTO> getManagerById(@PathVariable Long id) {
        BranchManager manager = managerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + id));
        return ResponseEntity.ok(convertToResponseDTO(manager));
    }

    /**
     * Create new manager account and assign to company
     */
    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ManagerResponseDTO> createManager(@RequestBody ManagerRequestDTO managerDTO) {
        log.info("Creating manager: {}", managerDTO);
        
        // Check if email already exists
        if (managerRepository.existsByEmail(managerDTO.getEmail())) {
            log.error("Manager with this email already exists: {}", managerDTO.getEmail());
            throw new DuplicateResourceException("Manager with this email already exists");
        }

        // Get company
        Company company = companyRepository.findById(managerDTO.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + managerDTO.getCompanyId()));

        // Create manager
        BranchManager manager = new BranchManager();
        manager.setName(managerDTO.getName());
        manager.setEmail(managerDTO.getEmail());
        manager.setPassword(passwordEncoder.encode(managerDTO.getPassword()));
        manager.setPhoneNumber(managerDTO.getPhoneNumber());
        manager.setCompany(company);

        BranchManager savedManager = managerRepository.save(manager);
        log.info("Manager created successfully with id: {}", savedManager.getUserId());
        return new ResponseEntity<>(convertToResponseDTO(savedManager), HttpStatus.CREATED);
    }

    /**
     * Update manager
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ManagerResponseDTO> updateManager(
            @PathVariable Long id,
            @RequestBody ManagerRequestDTO managerDTO) {
        
        log.info("Updating manager with id: {}", id);
        log.info("Manager data: {}", managerDTO);

        BranchManager existingManager = managerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + id));

        // Check if email already exists for another manager
        if (managerDTO.getEmail() != null && !existingManager.getEmail().equals(managerDTO.getEmail()) &&
            managerRepository.existsByEmail(managerDTO.getEmail())) {
            throw new DuplicateResourceException("Manager with this email already exists");
        }

        // Update manager fields if provided
        if (managerDTO.getName() != null && !managerDTO.getName().isEmpty()) {
            existingManager.setName(managerDTO.getName());
        }
        
        if (managerDTO.getEmail() != null && !managerDTO.getEmail().isEmpty()) {
            existingManager.setEmail(managerDTO.getEmail());
        }

        // Update company if provided and changed
        if (managerDTO.getCompanyId() != null && 
            !existingManager.getCompany().getCompanyId().equals(managerDTO.getCompanyId())) {
            Company newCompany = companyRepository.findById(managerDTO.getCompanyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + managerDTO.getCompanyId()));
            existingManager.setCompany(newCompany);
        }

        // Update password if provided
        if (managerDTO.getPassword() != null && !managerDTO.getPassword().isEmpty()) {
            existingManager.setPassword(passwordEncoder.encode(managerDTO.getPassword()));
        }

        // Update phone number if provided
        if (managerDTO.getPhoneNumber() != null && !managerDTO.getPhoneNumber().isEmpty()) {
            existingManager.setPhoneNumber(managerDTO.getPhoneNumber());
        }

        BranchManager updatedManager = managerRepository.save(existingManager);
        log.info("Manager updated successfully: {}", updatedManager.getUserId());
        return ResponseEntity.ok(convertToResponseDTO(updatedManager));
    }

    /**
     * Delete manager
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deleteManager(@PathVariable Long id) {
        log.info("Deleting manager with id: {}", id);
        BranchManager manager = managerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + id));

        managerRepository.delete(manager);
        log.info("Manager deleted successfully: {}", id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get managers by company
     */
    @GetMapping("/company/{companyId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<ManagerResponseDTO>> getManagersByCompany(@PathVariable Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));

        List<BranchManager> managers = managerRepository.findByCompany(company);
        List<ManagerResponseDTO> response = managers.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Convert BranchManager entity to ManagerResponseDTO
     */
    private ManagerResponseDTO convertToResponseDTO(BranchManager manager) {
        ManagerResponseDTO dto = new ManagerResponseDTO();
        dto.setId(manager.getUserId());
        dto.setName(manager.getName());
        dto.setEmail(manager.getEmail());
        dto.setPhoneNumber(manager.getPhoneNumber());
        dto.setCompanyId(manager.getCompany().getCompanyId());
        dto.setCompanyName(manager.getCompany().getName());
        dto.setUserType(manager.getUserType());
        dto.setCreatedAt(manager.getCreatedAt());
        dto.setUpdatedAt(manager.getUpdatedAt());
        return dto;
    }
}