package com.appointment.api.controller;

import com.appointment.api.dto.ResourceRequestDTO;
import com.appointment.api.dto.ResourceResponseDTO;
import com.appointment.api.entity.ResourceStatus;
import com.appointment.api.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Resource Management endpoints (FR-MGR-006)
 * Handles HTTP requests and returns HTTP responses
 * Base path: /api/resources
 *
 * Key Features:
 * - Full CRUD operations for resources (e.g., Massage Tables, Equipment)
 * - Status management: AVAILABLE (Uygun) / OUT_OF_SERVICE (Servis Dışı)
 * - Company-scoped resources (multi-tenant)
 * - Search and filter functionality
 * - Quick status toggle for frontend
 *
 * Note: Each employee is actually a resource for scheduling purposes
 */
@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    /**
     * POST /api/resources
     * Create a new resource (e.g., Massage Table, Saç Kesim Sandalyesi)
     *
     * Example Request:
     * {
     * "companyId": 1,
     * "name": "Masaj Masası 1",
     * "description": "Elektrikli masaj masası, ayarlanabilir yükseklik",
     * "status": "AVAILABLE"
     * }
     */
    @PostMapping
    public ResponseEntity<ResourceResponseDTO> createResource(@Valid @RequestBody ResourceRequestDTO requestDTO) {
        ResourceResponseDTO response = resourceService.createResource(requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * GET /api/resources/company/{companyId}
     * Get all resources for a specific company
     */
    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<ResourceResponseDTO>> getAllResourcesByCompany(@PathVariable Long companyId) {
        List<ResourceResponseDTO> resources = resourceService.getAllResourcesByCompany(companyId);
        return ResponseEntity.ok(resources);
    }

    /**
     * GET /api/resources/company/{companyId}/{resourceId}
     * Get specific resource by ID (must belong to specified company)
     */
    @GetMapping("/company/{companyId}/{resourceId}")
    public ResponseEntity<ResourceResponseDTO> getResourceById(
            @PathVariable Long companyId,
            @PathVariable Long resourceId) {
        ResourceResponseDTO resource = resourceService.getResourceById(companyId, resourceId);
        return ResponseEntity.ok(resource);
    }

    /**
     * PUT /api/resources/company/{companyId}/{resourceId}
     * Update existing resource
     */
    @PutMapping("/company/{companyId}/{resourceId}")
    public ResponseEntity<ResourceResponseDTO> updateResource(
            @PathVariable Long companyId,
            @PathVariable Long resourceId,
            @Valid @RequestBody ResourceRequestDTO requestDTO) {
        ResourceResponseDTO response = resourceService.updateResource(companyId, resourceId, requestDTO);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/resources/company/{companyId}/{resourceId}
     * Delete a resource
     */
    @DeleteMapping("/company/{companyId}/{resourceId}")
    public ResponseEntity<Void> deleteResource(
            @PathVariable Long companyId,
            @PathVariable Long resourceId,
            @RequestParam(required = false, defaultValue = "false") boolean confirm) {
        resourceService.deleteResource(companyId, resourceId, confirm);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/resources/company/{companyId}/{resourceId}/toggle
     * Quick status toggle for frontend toggle functionality
     * Changes between AVAILABLE and OUT_OF_SERVICE
     *
     * This is used by the frontend toggle switches
     */
    @PatchMapping("/company/{companyId}/{resourceId}/toggle")
    public ResponseEntity<ResourceResponseDTO> toggleResourceStatus(
            @PathVariable Long companyId,
            @PathVariable Long resourceId) {
        ResourceResponseDTO response = resourceService.toggleResourceStatus(companyId, resourceId);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/resources/company/{companyId}/search
     * Search resources by name/description with optional status filter
     * Used by frontend search and filter functionality
     *
     * Query Parameters:
     * - keyword: search term for name/description
     * - status: optional filter by status (AVAILABLE, OUT_OF_SERVICE, IN_USE)
     *
     * Examples:
     * GET /api/resources/company/1/search?keyword=masaj
     * GET /api/resources/company/1/search?keyword=masa&status=AVAILABLE
     * GET /api/resources/company/1/search?status=OUT_OF_SERVICE
     */
    @GetMapping("/company/{companyId}/search")
    public ResponseEntity<List<ResourceResponseDTO>> searchResources(
            @PathVariable Long companyId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ResourceStatus status) {

        // If no keyword provided, search for all (will be filtered by status if
        // provided)
        String searchKeyword = (keyword != null) ? keyword : "";

        List<ResourceResponseDTO> resources = resourceService.searchResources(companyId, searchKeyword, status);
        return ResponseEntity.ok(resources);
    }

    /**
     * GET /api/resources/company/{companyId}/status/{status}
     * Get resources by status for a company
     * Useful for frontend filter dropdown
     *
     * Examples:
     * GET /api/resources/company/1/status/AVAILABLE -> "Uygun" resources
     * GET /api/resources/company/1/status/OUT_OF_SERVICE -> "Servis Dışı" resources
     */
    @GetMapping("/company/{companyId}/status/{status}")
    public ResponseEntity<List<ResourceResponseDTO>> getResourcesByStatus(
            @PathVariable Long companyId,
            @PathVariable ResourceStatus status) {
        List<ResourceResponseDTO> resources = resourceService.getResourcesByStatus(companyId, status);
        return ResponseEntity.ok(resources);
    }

    /**
     * GET /api/resources/company/{companyId}/available
     * Get available resources (for scheduling appointments)
     * This will be important when we implement employee-as-resource logic
     */
    @GetMapping("/company/{companyId}/available")
    public ResponseEntity<List<ResourceResponseDTO>> getAvailableResources(@PathVariable Long companyId) {
        List<ResourceResponseDTO> resources = resourceService.getAvailableResources(companyId);
        return ResponseEntity.ok(resources);
    }

    /**
     * GET /api/resources/company/{companyId}/stats
     * Get resource statistics for dashboard
     * Returns counts by status
     */
    @GetMapping("/company/{companyId}/stats")
    public ResponseEntity<ResourceService.ResourceStatsDTO> getResourceStats(@PathVariable Long companyId) {
        ResourceService.ResourceStatsDTO stats = resourceService.getResourceStats(companyId);
        return ResponseEntity.ok(stats);
    }
}