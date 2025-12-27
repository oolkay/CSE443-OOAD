package com.appointment.api.service;

import com.appointment.api.dto.ResourceRequestDTO;
import com.appointment.api.dto.ResourceResponseDTO;
import com.appointment.api.entity.Company;
import com.appointment.api.entity.Resource;
import com.appointment.api.entity.ResourceStatus;
import com.appointment.api.exception.ResourceNotFoundException;
import com.appointment.api.exception.DuplicateResourceException;
import com.appointment.api.repository.CompanyRepository;
import com.appointment.api.repository.ResourceRepository;
import com.appointment.api.repository.AppointmentRepository;
import com.appointment.api.dto.WorkingShiftResponseDTO;
import com.appointment.api.entity.Appointment;
import com.appointment.api.provider.NotificationProvider;
import com.appointment.api.dto.EmailTemplateData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.concurrent.CompletableFuture;

/**
 * Service layer for Resource management - Contains business logic
 * Acts as a bridge between Controller and Repository
 *
 * Key concepts:
 * - Each employee is actually a resource (for scheduling)
 * - Resources can be AVAILABLE (Uygun) or OUT_OF_SERVICE (Servis Dışı)
 * - Resources belong to a company (multi-tenant)
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final CompanyRepository companyRepository;
    private final AppointmentRepository appointmentRepository;
    private final NotificationProvider notificationProvider;

    /**
     * Create a new resource
     * Example: Massage Table, Saç Kesim Sandalyesi
     */
    public ResourceResponseDTO createResource(ResourceRequestDTO requestDTO) {
        log.info("Creating new resource: {} for company: {}", requestDTO.getName(), requestDTO.getCompanyId());

        // Business logic: Check if company exists
        Company company = companyRepository.findById(requestDTO.getCompanyId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Company not found with ID: " + requestDTO.getCompanyId()));

        // Business logic: Check if resource with same name already exists in the
        // company
        if (resourceRepository.existsByCompanyCompanyIdAndNameIgnoreCase(requestDTO.getCompanyId(),
                requestDTO.getName())) {
            throw new DuplicateResourceException(
                    "Resource with name '" + requestDTO.getName() + "' already exists in this company");
        }

        // Convert DTO to Entity
        Resource resource = new Resource();
        resource.setCompany(company);
        resource.setName(requestDTO.getName());
        resource.setDescription(requestDTO.getDescription());
        resource.setStatus(requestDTO.getStatus());

        // Save to database
        Resource savedResource = resourceRepository.save(resource);

        log.info("Resource created successfully with ID: {}", savedResource.getResourceId());

        // Convert Entity to Response DTO
        return convertToResponseDTO(savedResource);
    }

    /**
     * Get all resources for a specific company
     */
    @Transactional(readOnly = true)
    public List<ResourceResponseDTO> getAllResourcesByCompany(Long companyId) {
        log.info("Fetching all resources for company: {}", companyId);

        // Verify company exists
        if (!companyRepository.existsById(companyId)) {
            throw new ResourceNotFoundException("Company not found with ID: " + companyId);
        }

        return resourceRepository.findByCompanyCompanyId(companyId)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get resource by ID (must belong to specified company)
     */
    @Transactional(readOnly = true)
    public ResourceResponseDTO getResourceById(Long companyId, Long resourceId) {
        log.info("Fetching resource {} for company: {}", resourceId, companyId);

        Resource resource = resourceRepository.findByCompanyCompanyIdAndResourceId(companyId, resourceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resource not found with ID: " + resourceId + " for company: " + companyId));

        return convertToResponseDTO(resource);
    }

    /**
     * Update existing resource
     */
    public ResourceResponseDTO updateResource(Long companyId, Long resourceId, ResourceRequestDTO requestDTO) {
        log.info("Updating resource {} for company: {}", resourceId, companyId);

        Resource resource = resourceRepository.findByCompanyCompanyIdAndResourceId(companyId, resourceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resource not found with ID: " + resourceId + " for company: " + companyId));

        // Check if name is being changed and if new name already exists in the company
        if (!resource.getName().equals(requestDTO.getName()) &&
                resourceRepository.existsByNameInCompanyExcludingResource(companyId, requestDTO.getName(),
                        resourceId)) {
            throw new DuplicateResourceException(
                    "Resource with name '" + requestDTO.getName() + "' already exists in this company");
        }

        // Update fields
        resource.setName(requestDTO.getName());
        resource.setDescription(requestDTO.getDescription());
        resource.setStatus(requestDTO.getStatus());

        Resource updatedResource = resourceRepository.save(resource);

        log.info("Resource updated successfully with ID: {}", updatedResource.getResourceId());

        return convertToResponseDTO(updatedResource);
    }

    /**
     * Delete resource
     */
    public void deleteResource(Long companyId, Long resourceId, boolean confirm) {
        log.info("Deleting resource {} for company: {}", resourceId, companyId);

        Resource resource = resourceRepository.findByCompanyCompanyIdAndResourceId(companyId, resourceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resource not found with ID: " + resourceId + " for company: " + companyId));

        if (appointmentRepository.existsByResources_ResourceId(resourceId)) {
            if (!confirm) {
                throw new IllegalArgumentException(
                        "Cannot delete resource. This resource is associated with existing appointments.");
            }

            // Confirm is true, send cancellations and delete appointments
            List<Appointment> appointments = appointmentRepository.findByResources_ResourceId(resourceId);
            for (Appointment appointment : appointments) {
                if (appointment.getCustomer() != null && appointment.getCustomer().getEmail() != null) {
                    EmailTemplateData emailData = EmailTemplateData.builder()
                            .customerName(appointment.getCustomer().getName())
                            .companyName(appointment.getService().getCompany().getName())
                            .serviceName(appointment.getService().getName())
                            .employeeName(appointment.getEmployee().getName())
                            .appointmentDate(appointment.getStartTime().toLocalDate())
                            .appointmentTime(appointment.getStartTime().toLocalTime())
                            .appointmentDateTime(appointment.getStartTime()
                                    .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                            .reason("Resource deletion: " + resource.getName())
                            .build();

                    CompletableFuture.runAsync(() -> {
                        try {
                            notificationProvider.sendTemplatedNotification(
                                    appointment.getCustomer().getEmail(),
                                    "APPOINTMENT_CANCELLATION",
                                    emailData);
                        } catch (Exception e) {
                            System.err.println("Failed to send cancellation email: " + e.getMessage());
                        }
                    });
                }
                appointmentRepository.delete(appointment);
            }
        }

        resourceRepository.delete(resource);

        log.info("Resource deleted successfully with ID: {}", resourceId);
    }

    /**
     * Quick status toggle - for frontend toggle functionality
     * Changes between AVAILABLE and OUT_OF_SERVICE
     */
    public ResourceResponseDTO toggleResourceStatus(Long companyId, Long resourceId) {
        log.info("Toggling status for resource {} in company: {}", resourceId, companyId);

        Resource resource = resourceRepository.findByCompanyCompanyIdAndResourceId(companyId, resourceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resource not found with ID: " + resourceId + " for company: " + companyId));

        // Toggle logic: AVAILABLE -> OUT_OF_SERVICE, OUT_OF_SERVICE -> AVAILABLE
        ResourceStatus newStatus = (resource.getStatus() == ResourceStatus.OUT_OF_SERVICE)
                ? ResourceStatus.AVAILABLE
                : ResourceStatus.OUT_OF_SERVICE;

        resource.setStatus(newStatus);
        Resource updatedResource = resourceRepository.save(resource);

        log.info("Resource status toggled to {} for resource: {}", newStatus, resourceId);

        return convertToResponseDTO(updatedResource);
    }

    /**
     * Search resources by name/description with optional status filter
     * Used by frontend search and filter functionality
     */
    @Transactional(readOnly = true)
    public List<ResourceResponseDTO> searchResources(Long companyId, String keyword, ResourceStatus status) {
        log.info("Searching resources in company: {} with keyword: {} and status: {}", companyId, keyword, status);

        // Verify company exists
        if (!companyRepository.existsById(companyId)) {
            throw new ResourceNotFoundException("Company not found with ID: " + companyId);
        }

        List<Resource> resources;

        if (status != null) {
            resources = resourceRepository.searchResourcesByCompanyWithStatus(companyId, keyword, status);
        } else {
            resources = resourceRepository.searchResourcesByCompany(companyId, keyword);
        }

        return resources.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get resources by status for a company
     * Useful for filtering: Uygun, Servis Dışı, Kullanımda
     */
    @Transactional(readOnly = true)
    public List<ResourceResponseDTO> getResourcesByStatus(Long companyId, ResourceStatus status) {
        log.info("Fetching resources by status {} for company: {}", status, companyId);

        return resourceRepository.findByCompanyCompanyIdAndStatus(companyId, status)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get available resources (for scheduling appointments)
     * This will be important when we implement employee-as-resource logic
     */
    @Transactional(readOnly = true)
    public List<ResourceResponseDTO> getAvailableResources(Long companyId) {
        log.info("Fetching available resources for company: {}", companyId);

        return resourceRepository.findByCompanyCompanyIdAndStatus(companyId, ResourceStatus.AVAILABLE)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get statistics for dashboard
     */
    @Transactional(readOnly = true)
    public ResourceStatsDTO getResourceStats(Long companyId) {
        log.info("Getting resource statistics for company: {}", companyId);

        long total = resourceRepository.countByCompanyCompanyIdAndStatus(companyId, ResourceStatus.AVAILABLE) +
                resourceRepository.countByCompanyCompanyIdAndStatus(companyId, ResourceStatus.OUT_OF_SERVICE) +
                resourceRepository.countByCompanyCompanyIdAndStatus(companyId, ResourceStatus.IN_USE);

        long available = resourceRepository.countByCompanyCompanyIdAndStatus(companyId, ResourceStatus.AVAILABLE);
        long outOfService = resourceRepository.countByCompanyCompanyIdAndStatus(companyId,
                ResourceStatus.OUT_OF_SERVICE);
        long inUse = resourceRepository.countByCompanyCompanyIdAndStatus(companyId, ResourceStatus.IN_USE);

        return new ResourceStatsDTO(total, available, outOfService, inUse);
    }

    /**
     * Helper method to convert Entity to Response DTO
     */
    private ResourceResponseDTO convertToResponseDTO(Resource resource) {
        ResourceResponseDTO responseDTO = new ResourceResponseDTO();
        responseDTO.setResourceId(resource.getResourceId());
        responseDTO.setName(resource.getName());
        responseDTO.setDescription(resource.getDescription());
        responseDTO.setStatus(resource.getStatus());
        responseDTO.setCreatedAt(resource.getCreatedAt());
        responseDTO.setUpdatedAt(resource.getUpdatedAt());
        return responseDTO;
    }

    /**
     * Inner class for statistics response
     */
    @lombok.Data
    @lombok.AllArgsConstructor
    public static class ResourceStatsDTO {
        private long total;
        private long available;
        private long outOfService;
        private long inUse;
    }
}