package com.appointment.api.dto;

import lombok.Data;
import java.util.List;

@Data
public class EmployeeResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String companyName;

    // Atanmış hizmetlerin listesi
    private List<ServiceResponseDTO> assignedServices;

    // Çalışma Saatleri
    private List<WorkingShiftResponseDTO> schedule;
}