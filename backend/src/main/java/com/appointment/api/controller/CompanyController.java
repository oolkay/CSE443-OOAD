package com.appointment.api.controller;

import com.appointment.api.dto.CompanyRequestDTO;
import com.appointment.api.dto.CompanyResponseDTO;
import com.appointment.api.dto.CompanyWithManagerRequestDTO;
import com.appointment.api.dto.ManagerRequestDTO;
import com.appointment.api.entity.BranchManager;
import com.appointment.api.entity.Company;
import com.appointment.api.exception.DuplicateResourceException;
import com.appointment.api.exception.ResourceNotFoundException;
import com.appointment.api.repository.BranchManagerRepository;
import com.appointment.api.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST Controller for Company CRUD operations
 * Super Admin can manage companies
 */
@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class CompanyController {

    private final CompanyRepository companyRepository;
    private final BranchManagerRepository managerRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Get all companies
     */
    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<CompanyResponseDTO>> getAllCompanies() {
        List<Company> companies = companyRepository.findAll();
        List<CompanyResponseDTO> response = companies.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Get company by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<CompanyResponseDTO> getCompanyById(@PathVariable Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));
        return ResponseEntity.ok(convertToResponseDTO(company));
    }

    /**
     * Create new company with required branch manager
     * According to schema: Every Company must have a Branch Manager
     */
    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<CompanyResponseDTO> createCompany(@RequestBody CompanyWithManagerRequestDTO requestDTO) {
        // Check if company email already exists
        if (companyRepository.existsByEmail(requestDTO.getCompanyEmail())) {
            throw new DuplicateResourceException("Company with this email already exists");
        }

        // Check if manager email already exists
        if (managerRepository.existsByEmail(requestDTO.getManagerEmail())) {
            throw new DuplicateResourceException("Manager with this email already exists");
        }

        // Create company first
        Company company = new Company();
        company.setName(requestDTO.getCompanyName());
        company.setEmail(requestDTO.getCompanyEmail());
        company.setAddress(requestDTO.getCompanyAddress());
        company.setPhoneNumber(requestDTO.getCompanyPhoneNumber());

        Company savedCompany = companyRepository.save(company);

        // Create required branch manager
        BranchManager manager = new BranchManager();
        manager.setName(requestDTO.getManagerName());
        manager.setEmail(requestDTO.getManagerEmail());
        manager.setPassword(passwordEncoder.encode(requestDTO.getManagerPassword()));
        manager.setCompany(savedCompany);

        BranchManager savedManager = managerRepository.save(manager);

        // Create response directly to avoid lazy loading issues
        CompanyResponseDTO response = new CompanyResponseDTO();
        response.setCompanyId(savedCompany.getCompanyId());
        response.setName(savedCompany.getName());
        response.setEmail(savedCompany.getEmail());
        response.setAddress(savedCompany.getAddress());
        response.setPhoneNumber(savedCompany.getPhoneNumber());
        response.setManagerId(savedManager.getUserId());
        response.setManagerName(savedManager.getName());
        response.setManagerEmail(savedManager.getEmail());
        response.setCreatedAt(savedCompany.getCreatedAt());
        response.setUpdatedAt(savedCompany.getUpdatedAt());

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    
    /**
     * Update company
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<CompanyResponseDTO> updateCompany(
            @PathVariable Long id,
            @RequestBody CompanyRequestDTO companyDTO) {

        Company existingCompany = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));

        // Check if email already exists for another company
        if (!existingCompany.getEmail().equals(companyDTO.getEmail()) &&
            companyRepository.existsByEmail(companyDTO.getEmail())) {
            throw new DuplicateResourceException("Company with this email already exists");
        }

        // Update company fields
        existingCompany.setName(companyDTO.getName());
        existingCompany.setEmail(companyDTO.getEmail());
        existingCompany.setAddress(companyDTO.getAddress());
        existingCompany.setPhoneNumber(companyDTO.getPhoneNumber());

        Company updatedCompany = companyRepository.save(existingCompany);
        return ResponseEntity.ok(convertToResponseDTO(updatedCompany));
    }

    /**
     * Delete company
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));

        companyRepository.delete(company);
        return ResponseEntity.noContent().build();
    }

    /**
     * Convert Company entity to CompanyResponseDTO
     */
    private CompanyResponseDTO convertToResponseDTO(Company company) {
        CompanyResponseDTO dto = new CompanyResponseDTO();
        dto.setCompanyId(company.getCompanyId());
        dto.setName(company.getName());
        dto.setEmail(company.getEmail());
        dto.setAddress(company.getAddress());
        dto.setPhoneNumber(company.getPhoneNumber());
        dto.setCreatedAt(company.getCreatedAt());
        dto.setUpdatedAt(company.getUpdatedAt());

        // Every company must have a manager according to schema
        if (company.getBranchManagers() != null && !company.getBranchManagers().isEmpty()) {
            // Get the first manager (1:1 relationship in schema)
            var firstManager = company.getBranchManagers().iterator().next();
            dto.setManagerId(firstManager.getUserId());
            dto.setManagerName(firstManager.getName());
            dto.setManagerEmail(firstManager.getEmail());
        } else {
            throw new IllegalStateException("Company must have at least one Branch Manager according to schema");
        }

        return dto;
    }

    /**
     * Convert CompanyRequestDTO to Company entity
     */
    private Company convertToEntity(CompanyRequestDTO dto) {
        Company company = new Company();
        company.setName(dto.getName());
        company.setEmail(dto.getEmail());
        company.setAddress(dto.getAddress());
        company.setPhoneNumber(dto.getPhoneNumber());
        return company;
    }
}