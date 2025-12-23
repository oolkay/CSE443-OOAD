package com.appointment.api.service;

import com.appointment.api.dto.SuperAdminRequestDTO;
import com.appointment.api.dto.SuperAdminResponseDTO;
import com.appointment.api.entity.SuperAdmin;
import com.appointment.api.exception.DuplicateResourceException;
import com.appointment.api.exception.ResourceNotFoundException;
import com.appointment.api.repository.SuperAdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service class for Super Admin business logic
 */
@Service
@RequiredArgsConstructor
@Transactional
public class SuperAdminService {

    private final SuperAdminRepository superAdminRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Get all Super Admins
     */
    public List<SuperAdminResponseDTO> getAllSuperAdmins() {
        List<SuperAdmin> superAdmins = superAdminRepository.findAll();
        return superAdmins.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get Super Admin by ID
     */
    public SuperAdminResponseDTO getSuperAdminById(Long id) {
        SuperAdmin superAdmin = superAdminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Super Admin not found with id: " + id));
        return convertToResponseDTO(superAdmin);
    }

    /**
     * Get Super Admin by email
     */
    public Optional<SuperAdminResponseDTO> getSuperAdminByEmail(String email) {
        return superAdminRepository.findByEmail(email)
                .map(this::convertToResponseDTO);
    }

    /**
     * Create new Super Admin
     */
    public SuperAdminResponseDTO createSuperAdmin(SuperAdminRequestDTO requestDTO) {
        // Check if email already exists
        if (superAdminRepository.existsByEmail(requestDTO.getEmail())) {
            throw new DuplicateResourceException("Super Admin with this email already exists");
        }

        // Check if phone number already exists (optional field)
        if (requestDTO.getPhoneNumber() != null &&
            !requestDTO.getPhoneNumber().trim().isEmpty() &&
            superAdminRepository.existsByPhoneNumber(requestDTO.getPhoneNumber())) {
            throw new DuplicateResourceException("Super Admin with this phone number already exists");
        }

        // Create new Super Admin
        SuperAdmin superAdmin = new SuperAdmin();
        superAdmin.setName(requestDTO.getName());
        superAdmin.setEmail(requestDTO.getEmail());
        superAdmin.setPassword(passwordEncoder.encode(requestDTO.getPassword()));
        superAdmin.setPhoneNumber(requestDTO.getPhoneNumber());

        SuperAdmin savedSuperAdmin = superAdminRepository.save(superAdmin);
        return convertToResponseDTO(savedSuperAdmin);
    }

    /**
     * Update existing Super Admin
     */
    public SuperAdminResponseDTO updateSuperAdmin(Long id, SuperAdminRequestDTO requestDTO) {
        SuperAdmin existingSuperAdmin = superAdminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Super Admin not found with id: " + id));

        // Check if email already exists for another Super Admin
        if (!existingSuperAdmin.getEmail().equals(requestDTO.getEmail()) &&
            superAdminRepository.existsByEmail(requestDTO.getEmail())) {
            throw new DuplicateResourceException("Super Admin with this email already exists");
        }

        // Check if phone number already exists for another Super Admin
        if (requestDTO.getPhoneNumber() != null &&
            !requestDTO.getPhoneNumber().trim().isEmpty() &&
            !requestDTO.getPhoneNumber().equals(existingSuperAdmin.getPhoneNumber()) &&
            superAdminRepository.existsByPhoneNumber(requestDTO.getPhoneNumber())) {
            throw new DuplicateResourceException("Super Admin with this phone number already exists");
        }

        // Update fields
        existingSuperAdmin.setName(requestDTO.getName());
        existingSuperAdmin.setEmail(requestDTO.getEmail());
        existingSuperAdmin.setPhoneNumber(requestDTO.getPhoneNumber());

        // Update password only if provided
        if (requestDTO.getPassword() != null && !requestDTO.getPassword().trim().isEmpty()) {
            existingSuperAdmin.setPassword(passwordEncoder.encode(requestDTO.getPassword()));
        }

        SuperAdmin updatedSuperAdmin = superAdminRepository.save(existingSuperAdmin);
        return convertToResponseDTO(updatedSuperAdmin);
    }

    /**
     * Delete Super Admin
     */
    public void deleteSuperAdmin(Long id) {
        SuperAdmin superAdmin = superAdminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Super Admin not found with id: " + id));

        superAdminRepository.delete(superAdmin);
    }

    /**
     * Check if Super Admin exists by email
     */
    public boolean existsByEmail(String email) {
        return superAdminRepository.existsByEmail(email);
    }

    /**
     * Convert SuperAdmin entity to SuperAdminResponseDTO
     */
    private SuperAdminResponseDTO convertToResponseDTO(SuperAdmin superAdmin) {
        SuperAdminResponseDTO dto = new SuperAdminResponseDTO();
        dto.setUserId(superAdmin.getUserId());
        dto.setName(superAdmin.getName());
        dto.setEmail(superAdmin.getEmail());
        dto.setPhoneNumber(superAdmin.getPhoneNumber());
        dto.setCreatedAt(superAdmin.getCreatedAt());
        dto.setUpdatedAt(superAdmin.getUpdatedAt());
        return dto;
    }

    /**
     * Convert SuperAdminRequestDTO to SuperAdmin entity
     */
    private SuperAdmin convertToEntity(SuperAdminRequestDTO dto) {
        SuperAdmin superAdmin = new SuperAdmin();
        superAdmin.setName(dto.getName());
        superAdmin.setEmail(dto.getEmail());
        superAdmin.setPassword(passwordEncoder.encode(dto.getPassword()));
        superAdmin.setPhoneNumber(dto.getPhoneNumber());
        return superAdmin;
    }
}