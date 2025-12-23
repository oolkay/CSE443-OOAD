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

    /**
     * Create a new service.
     * POST /api/services
     */
    @PostMapping
    public ResponseEntity<ServiceResponseDTO> createService(@Valid @RequestBody ServiceRequestDTO requestDTO) {
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
            @Valid @RequestBody ServiceRequestDTO requestDTO) {
        ServiceResponseDTO response = serviceService.updateService(id, requestDTO);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete an service.
     * DELETE /api/services/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        serviceService.deleteService(id);
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
}
