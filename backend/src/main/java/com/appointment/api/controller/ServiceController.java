package com.appointment.api.controller;

import com.appointment.api.dto.ServiceRequestDTO;
import com.appointment.api.dto.ServiceResponseDTO;
import com.appointment.api.service.ServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.security.Principal;
import org.springframework.security.access.AccessDeniedException;
import com.appointment.api.entity.User;
import com.appointment.api.repository.UserRepository;
import com.appointment.api.entity.BranchManager;
import com.appointment.api.entity.SuperAdmin;

/**
 * REST Controller for Service endpoints.
 * Handles HTTP requests and returns HTTP responses.
 * Base path: /api/services
 */
@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceService serviceService;
    private final UserRepository userRepository;

    /**
     * Create a new service.
     * POST /api/services
     */
    @PostMapping
    public ResponseEntity<ServiceResponseDTO> createService(@Valid @RequestBody ServiceRequestDTO requestDTO,
            Principal principal) {
        setCompanyIdFromPrincipal(requestDTO, principal);
        ServiceResponseDTO response = serviceService.createService(requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get all services.
     * GET /api/services
     */
    @GetMapping
    public ResponseEntity<List<ServiceResponseDTO>> getAllServices() {
        List<ServiceResponseDTO> services = serviceService.getAllServices();
        return ResponseEntity.ok(services);
    }

    /**
     * Get service by ID.
     * GET /api/services/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ServiceResponseDTO> getServiceById(@PathVariable Long id) {
        ServiceResponseDTO service = serviceService.getServiceById(id);
        return ResponseEntity.ok(service);
    }

    /**
     * Update an existing service.
     * PUT /api/services/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ServiceResponseDTO> updateService(
            @PathVariable Long id,
            @Valid @RequestBody ServiceRequestDTO requestDTO,
            Principal principal) {
        setCompanyIdFromPrincipal(requestDTO, principal);
        ServiceResponseDTO response = serviceService.updateService(id, requestDTO);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete an service.
     * DELETE /api/services/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean confirm) {
        serviceService.deleteService(id, confirm);
        return ResponseEntity.noContent().build();
    }

    /**
     * Search services by name.
     * GET /api/services/search?name={name}
     */
    @GetMapping("/search")
    public ResponseEntity<List<ServiceResponseDTO>> searchServices(@RequestParam String name) {
        List<ServiceResponseDTO> services = serviceService.searchServicesByName(name);
        return ResponseEntity.ok(services);
    }

    /**
     * Get services by Company ID.
     * GET /api/services/company/{companyId}
     */
    @GetMapping("/company/{companyId}")
    @org.springframework.security.access.prepost.PreAuthorize("permitAll()")
    public ResponseEntity<List<ServiceResponseDTO>> getServicesByCompany(@PathVariable Long companyId) {
        List<ServiceResponseDTO> services = serviceService.getServicesByCompany(companyId);
        return ResponseEntity.ok(services);
    }

    private void setCompanyIdFromPrincipal(ServiceRequestDTO requestDTO, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user instanceof BranchManager) {
            BranchManager manager = (BranchManager) user;
            requestDTO.setCompanyId(manager.getCompany().getCompanyId());
        } else if (user instanceof SuperAdmin) {
            if (requestDTO.getCompanyId() == null) {
                throw new IllegalArgumentException("Company ID is required for Super Admin");
            }
        } else {
            throw new AccessDeniedException("Unauthorized access");
        }
    }
}
