package com.appointment.api.service;

import com.appointment.api.dto.EmployeeRequestDTO;
import com.appointment.api.dto.EmployeeResponseDTO;
import com.appointment.api.dto.ServiceResponseDTO;
import com.appointment.api.entity.Company;
import com.appointment.api.entity.Employee;
import com.appointment.api.entity.Service;
import com.appointment.api.repository.CompanyRepository;
import com.appointment.api.repository.EmployeeRepository;
import com.appointment.api.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final CompanyRepository companyRepository;
    private final ServiceRepository serviceRepository;

    @Transactional
    public EmployeeResponseDTO createEmployee(EmployeeRequestDTO requestDTO) {
        Employee employee = new Employee();
        
        employee.setName(requestDTO.getName());
        employee.setEmail(requestDTO.getEmail());
        employee.setPassword(requestDTO.getPassword());
        
        ///Company company = companyRepository.findById(requestDTO.getCompanyId())
        ///        .orElseThrow(() -> new RuntimeException("Company not found"));
        ///employee.setCompany(company);

        if (requestDTO.getServiceIds() != null && !requestDTO.getServiceIds().isEmpty()) {
            List<Service> services = serviceRepository.findAllById(requestDTO.getServiceIds());
            employee.setServices(services);
        }

        Employee savedEmployee = employeeRepository.save(employee);
        return mapToResponseDTO(savedEmployee);
    }

    @Transactional
    public EmployeeResponseDTO updateEmployee(Long id, EmployeeRequestDTO requestDTO) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        employee.setName(requestDTO.getName());
        employee.setEmail(requestDTO.getEmail());
        
        if (requestDTO.getServiceIds() != null) {
            List<Service> services = serviceRepository.findAllById(requestDTO.getServiceIds());
            employee.setServices(services);
        }

        Employee updatedEmployee = employeeRepository.save(employee);
        return mapToResponseDTO(updatedEmployee);
    }

    public EmployeeResponseDTO getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        return mapToResponseDTO(employee);
    }

    private EmployeeResponseDTO mapToResponseDTO(Employee employee) {
        EmployeeResponseDTO dto = new EmployeeResponseDTO();
        dto.setId(employee.getId());
        dto.setName(employee.getName());
        dto.setEmail(employee.getEmail());
        
        if (employee.getCompany() != null) {
            dto.setCompanyName(employee.getCompany().getName());
        }

        List<ServiceResponseDTO> serviceDTOs = employee.getServices().stream()
                .map(service -> new ServiceResponseDTO(
                        service.getServiceId(),
                        service.getName(),
                        service.getDescription(),
                        service.getTimeDuration().intValue(),
                        service.getPrice(),
                        service.getCreatedAt(),
                        service.getUpdatedAt()
                )).collect(Collectors.toList());
        
        dto.setAssignedServices(serviceDTOs);
        return dto;
    }
}