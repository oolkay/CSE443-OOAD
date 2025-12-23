package com.appointment.api.service;

import com.appointment.api.dto.ServiceRequestDTO;
import com.appointment.api.dto.ServiceResponseDTO;
import com.appointment.api.entity.Service;
import com.appointment.api.exception.DuplicateResourceException;
import com.appointment.api.exception.ResourceNotFoundException;
import com.appointment.api.repository.ServiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ServiceServiceTest {

    @Mock
    private ServiceRepository serviceRepository;

    @InjectMocks
    private ServiceService serviceService;

    private Service service;
    private ServiceRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        service = new Service();
        service.setServiceId(1L);
        service.setName("Test Service");
        service.setDescription("Test Description");
        service.setTimeDuration(60L);
        service.setPrice(new BigDecimal("100.00"));

        requestDTO = new ServiceRequestDTO();
        requestDTO.setName("Test Service");
        requestDTO.setDescription("Test Description");
        requestDTO.setDurationMinutes(60);
        requestDTO.setPrice(new BigDecimal("100.00"));
    }

    @Test
    void createService_Success() {
        when(serviceRepository.existsByName(anyString())).thenReturn(false);
        when(serviceRepository.save(any(Service.class))).thenReturn(service);

        ServiceResponseDTO response = serviceService.createService(requestDTO);

        assertNotNull(response);
        assertEquals(service.getName(), response.getName());
        verify(serviceRepository).save(any(Service.class));
    }

    @Test
    void createService_DuplicateName_ThrowsException() {
        when(serviceRepository.existsByName(anyString())).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> serviceService.createService(requestDTO));
        verify(serviceRepository, never()).save(any(Service.class));
    }

    @Test
    void getAllServices_Success() {
        when(serviceRepository.findAll()).thenReturn(Collections.singletonList(service));

        List<ServiceResponseDTO> services = serviceService.getAllServices();

        assertFalse(services.isEmpty());
        assertEquals(1, services.size());
    }

    @Test
    void getServiceById_Success() {
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(service));

        ServiceResponseDTO response = serviceService.getServiceById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
    }

    @Test
    void getServiceById_NotFound_ThrowsException() {
        when(serviceRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> serviceService.getServiceById(1L));
    }

    @Test
    void updateService_Success() {
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(service));
        when(serviceRepository.save(any(Service.class))).thenReturn(service);

        requestDTO.setDescription("Updated Description");
        ServiceResponseDTO response = serviceService.updateService(1L, requestDTO);

        assertNotNull(response);
        verify(serviceRepository).save(any(Service.class));
    }

    @Test
    void deleteService_Success() {
        when(serviceRepository.existsById(1L)).thenReturn(true);

        serviceService.deleteService(1L);

        verify(serviceRepository).deleteById(1L);
    }
}
