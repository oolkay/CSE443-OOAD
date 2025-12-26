package com.appointment.api.service;

import com.appointment.api.dto.ServiceRequestDTO;
import com.appointment.api.dto.ServiceResponseDTO;
import com.appointment.api.entity.Company;
import com.appointment.api.entity.Service;
import com.appointment.api.exception.DuplicateResourceException;
import com.appointment.api.exception.ResourceNotFoundException;
import com.appointment.api.repository.CompanyRepository;
import com.appointment.api.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer - Contains business logic including validation and mapping for
 * Service entity.
 * Acts as a bridge between Controller and Repository.
 */
@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ServiceService {

    private final ServiceRepository serviceRepository;
    private final CompanyRepository companyRepository;

    /**
     * Create a new service.
     *
     * @param requestDTO existing service data
     * @return created service response
     * @throws DuplicateResourceException if service with name already exists
     */
    public ServiceResponseDTO createService(ServiceRequestDTO requestDTO) {
        log.info("Attempting to create new service with name: {}", requestDTO.getName());

        validateServiceNameUnique(requestDTO.getName());

        // Fetch Company
        Company company = companyRepository.findById(requestDTO.getCompanyId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Company not found with ID: " + requestDTO.getCompanyId()));

        Service service = new Service();
        service.setName(requestDTO.getName());
        service.setDescription(requestDTO.getDescription());
        service.setTimeDuration(requestDTO.getDurationMinutes().longValue());
        service.setPrice(requestDTO.getPrice());
        service.setCompany(company); // Set Company

        Service savedService = serviceRepository.save(service);

        log.info("Service created successfully with ID: {}", savedService.getServiceId());
        return mapToResponseDTO(savedService);
    }

    /**
     * Get all services.
     *
     * @return list of all services
     */
    @Transactional(readOnly = true)
    public List<ServiceResponseDTO> getAllServices() {
        log.debug("Fetching all services");
        return serviceRepository.findAll()
                .stream()
                .sorted(java.util.Comparator.comparing(Service::getServiceId))
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get service by ID.
     *
     * @param id service ID
     * @return service response
     * @throws ResourceNotFoundException if service not found
     */
    @Transactional(readOnly = true)
    public ServiceResponseDTO getServiceById(Long id) {
        log.debug("Fetching service with ID: {}", id);
        Service service = getServiceEntityById(id);
        return mapToResponseDTO(service);
    }

    /**
     * Update existing service.
     *
     * @param id         service ID
     * @param requestDTO update data
     * @return updated service response
     * @throws ResourceNotFoundException  if service not found
     * @throws DuplicateResourceException if new name already conflicts
     */
    public ServiceResponseDTO updateService(Long id, ServiceRequestDTO requestDTO) {
        log.info("Attempting to update service with ID: {}", id);

        Service existingService = getServiceEntityById(id);

        if (!existingService.getName().equals(requestDTO.getName())) {
            validateServiceNameUnique(requestDTO.getName());
        }

        // Update company if provided (and different)
        if (requestDTO.getCompanyId() != null &&
                (existingService.getCompany() == null
                        || !existingService.getCompany().getCompanyId().equals(requestDTO.getCompanyId()))) {
            Company company = companyRepository.findById(requestDTO.getCompanyId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Company not found with ID: " + requestDTO.getCompanyId()));
            existingService.setCompany(company);
        }

        updateEntityFromDTO(existingService, requestDTO);
        Service updatedService = serviceRepository.save(existingService);

        log.info("Service updated successfully with ID: {}", updatedService.getServiceId());
        return mapToResponseDTO(updatedService);
    }

    /**
     * Delete service.
     *
     * @param id service ID
     * @throws ResourceNotFoundException if service not found
     */
    public void deleteService(Long id) {
        log.warn("Attempting to delete service with ID: {}", id);

        if (!serviceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Service not found with ID: " + id);
        }

        serviceRepository.deleteById(id);
        log.info("Service deleted successfully with ID: {}", id);
    }

    /**
     * Search services by name.
     *
     * @param name search term
     * @return list of matching services
     */
    @Transactional(readOnly = true)
    public List<ServiceResponseDTO> searchServicesByName(String name) {
        log.debug("Searching services by name containing: {}", name);
        return serviceRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get services by Company ID.
     */
    @Transactional(readOnly = true)
    public List<ServiceResponseDTO> getServicesByCompany(Long companyId) {
        return serviceRepository.findByCompany_CompanyId(companyId)
                .stream()
                .sorted(java.util.Comparator.comparing(Service::getServiceId))
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    // --- Helper Methods ---

    private void validateServiceNameUnique(String name) {
        if (serviceRepository.existsByName(name)) {
            log.error("Duplicate service name attempted: {}", name);
            throw new DuplicateResourceException("Service with name '" + name + "' already exists");
        }
    }

    private Service getServiceEntityById(Long id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Service not found with ID: {}", id);
                    return new ResourceNotFoundException("Service not found with ID: " + id);
                });
    }

    private Service mapToEntity(ServiceRequestDTO dto) {
        Service service = new Service();
        updateEntityFromDTO(service, dto);
        return service;
    }

    private void updateEntityFromDTO(Service service, ServiceRequestDTO dto) {
        service.setName(dto.getName());
        service.setDescription(dto.getDescription());
        service.setTimeDuration(dto.getDurationMinutes().longValue());
        service.setPrice(dto.getPrice());
    }

    private ServiceResponseDTO mapToResponseDTO(Service service) {
        ServiceResponseDTO responseDTO = new ServiceResponseDTO();
        responseDTO.setId(service.getServiceId());
        responseDTO.setName(service.getName());
        responseDTO.setDescription(service.getDescription());
        responseDTO.setDurationMinutes(service.getTimeDuration().intValue());
        responseDTO.setPrice(service.getPrice());
        responseDTO.setCreatedAt(service.getCreatedAt());
        responseDTO.setUpdatedAt(service.getUpdatedAt());
        return responseDTO;
    }
}
