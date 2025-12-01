package com.appointment.api.service;

import com.appointment.api.dto.ServiceRequestDTO;
import com.appointment.api.dto.ServiceResponseDTO;
import com.appointment.api.entity.Service;
import com.appointment.api.exception.ResourceNotFoundException;
import com.appointment.api.exception.DuplicateResourceException;
import com.appointment.api.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer - Contains business logic
 * Acts as a bridge between Controller and Repository
 */
@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ServiceService {

    private final ServiceRepository serviceRepository;

    /**
     * Create a new service
     */
    public ServiceResponseDTO createService(ServiceRequestDTO requestDTO) {
        log.info("Creating new service: {}", requestDTO.getName());
        
        // Business logic: Check if service with same name already exists
        if (serviceRepository.existsByName(requestDTO.getName())) {
            throw new DuplicateResourceException("Service with name '" + requestDTO.getName() + "' already exists");
        }
        
        // Convert DTO to Entity
        Service service = new Service();
        service.setName(requestDTO.getName());
        service.setDescription(requestDTO.getDescription());
        service.setTimeDuration(requestDTO.getDurationMinutes().longValue());
        service.setPrice(requestDTO.getPrice());
        
        // Save to database
        Service savedService = serviceRepository.save(service);
        
        log.info("Service created successfully with ID: {}", savedService.getServiceId());
        
        // Convert Entity to Response DTO
        return convertToResponseDTO(savedService);
    }

    /**
     * Get all services
     */
    @Transactional(readOnly = true)
    public List<ServiceResponseDTO> getAllServices() {
        log.info("Fetching all services");
        return serviceRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get service by ID
     */
    @Transactional(readOnly = true)
    public ServiceResponseDTO getServiceById(Long id) {
        log.info("Fetching service with ID: {}", id);
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with ID: " + id));
        
        return convertToResponseDTO(service);
    }

    /**
     * Update existing service
     */
    public ServiceResponseDTO updateService(Long id, ServiceRequestDTO requestDTO) {
        log.info("Updating service with ID: {}", id);
        
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with ID: " + id));
        
        // Check if name is being changed and if new name already exists
        if (!service.getName().equals(requestDTO.getName()) && 
            serviceRepository.existsByName(requestDTO.getName())) {
            throw new DuplicateResourceException("Service with name '" + requestDTO.getName() + "' already exists");
        }
        
        // Update fields
        service.setName(requestDTO.getName());
        service.setDescription(requestDTO.getDescription());
        service.setTimeDuration(requestDTO.getDurationMinutes().longValue());
        service.setPrice(requestDTO.getPrice());
        
        Service updatedService = serviceRepository.save(service);
        
        log.info("Service updated successfully with ID: {}", updatedService.getServiceId());
        
        return convertToResponseDTO(updatedService);
    }

    /**
     * Delete service
     */
    public void deleteService(Long id) {
        log.info("Deleting service with ID: {}", id);
        
        serviceRepository.deleteById(id);
        
        log.info("Service deleted successfully with ID: {}", id);
    }

    /**
     * Search services by name
     */
    @Transactional(readOnly = true)
    public List<ServiceResponseDTO> searchServicesByName(String name) {
        log.info("Searching services by name: {}", name);
        return serviceRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Helper method to convert Entity to Response DTO
     */
    private ServiceResponseDTO convertToResponseDTO(Service service) {
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

