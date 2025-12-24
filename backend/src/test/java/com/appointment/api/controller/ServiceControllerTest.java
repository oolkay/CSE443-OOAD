package com.appointment.api.controller;

import com.appointment.api.dto.ServiceRequestDTO;
import com.appointment.api.dto.ServiceResponseDTO;
import com.appointment.api.exception.DuplicateResourceException;
import com.appointment.api.exception.GlobalExceptionHandler;
import com.appointment.api.exception.ResourceNotFoundException;
import com.appointment.api.service.ServiceService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ServiceControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ServiceService serviceService;

    @InjectMocks
    private ServiceController serviceController;

    private ObjectMapper objectMapper;
    private ServiceRequestDTO requestDTO;
    private ServiceResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(serviceController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();

        requestDTO = ServiceRequestDTO.builder()
                .name("New Service")
                .description("Description")
                .durationMinutes(60)
                .price(new BigDecimal("100.00"))
                .build();

        responseDTO = ServiceResponseDTO.builder()
                .id(1L)
                .name("New Service")
                .description("Description")
                .durationMinutes(60)
                .price(new BigDecimal("100.00"))
                .build();
    }

    @Test
    void createService_Success() throws Exception {
        when(serviceService.createService(any(ServiceRequestDTO.class))).thenReturn(responseDTO);

        mockMvc.perform(post("/api/services")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("New Service"))
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void createService_ValidationFailure() throws Exception {
        requestDTO.setName(""); // Invalid name

        mockMvc.perform(post("/api/services")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"));
    }

    @Test
    void createService_DuplicateName_ReturnsConflict() throws Exception {
        when(serviceService.createService(any(ServiceRequestDTO.class)))
                .thenThrow(new DuplicateResourceException("Service already exists"));

        mockMvc.perform(post("/api/services")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Conflict"));
    }

    @Test
    void getAllServices_Success() throws Exception {
        when(serviceService.getAllServices()).thenReturn(Collections.singletonList(responseDTO));

        mockMvc.perform(get("/api/services"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("New Service"));
    }

    @Test
    void getServiceById_Success() throws Exception {
        when(serviceService.getServiceById(1L)).thenReturn(responseDTO);

        mockMvc.perform(get("/api/services/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New Service"));
    }

    @Test
    void getServiceById_NotFound_ReturnsNotFound() throws Exception {
        when(serviceService.getServiceById(1L)).thenThrow(new ResourceNotFoundException("Not found"));

        mockMvc.perform(get("/api/services/1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Not found"));
    }

    @Test
    void updateService_Success() throws Exception {
        when(serviceService.updateService(eq(1L), any(ServiceRequestDTO.class))).thenReturn(responseDTO);

        mockMvc.perform(put("/api/services/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New Service"));
    }

    @Test
    void deleteService_Success() throws Exception {
        doNothing().when(serviceService).deleteService(1L);

        mockMvc.perform(delete("/api/services/1"))
                .andExpect(status().isNoContent());
    }
}
