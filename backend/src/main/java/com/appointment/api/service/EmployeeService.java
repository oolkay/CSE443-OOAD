package com.appointment.api.service;

import com.appointment.api.dto.EmployeeRequestDTO;
import com.appointment.api.dto.EmployeeResponseDTO;
import com.appointment.api.dto.ServiceResponseDTO;
import com.appointment.api.dto.WorkingShiftRequestDTO;
import com.appointment.api.entity.Company;
import com.appointment.api.entity.Employee;
import com.appointment.api.entity.Service;
import com.appointment.api.entity.WorkingShift;
import com.appointment.api.exception.DuplicateResourceException;
import com.appointment.api.exception.ResourceNotFoundException;
import com.appointment.api.repository.CompanyRepository;
import com.appointment.api.repository.EmployeeRepository;
import com.appointment.api.repository.ServiceRepository;
import com.appointment.api.repository.WorkingShiftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final CompanyRepository companyRepository;
    private final ServiceRepository serviceRepository;
    private final WorkingShiftRepository workingShiftRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public EmployeeResponseDTO createEmployee(EmployeeRequestDTO requestDTO) {
        // Check for duplicate email
        if (employeeRepository.existsByEmail(requestDTO.getEmail())) {
            throw new DuplicateResourceException("Employee with email " + requestDTO.getEmail() + " already exists");
        }

        Employee employee = new Employee();

        employee.setName(requestDTO.getName());
        employee.setEmail(requestDTO.getEmail());

        // Şifre kontrolü (Oluşturmada zorunlu)
        if (requestDTO.getPassword() == null || requestDTO.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Şifre alanı zorunludur");
        }
        employee.setPassword(passwordEncoder.encode(requestDTO.getPassword()));

        // Handle Company relationship
        Company company = companyRepository.findById(requestDTO.getCompanyId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Company not found with id: " + requestDTO.getCompanyId()));
        employee.setCompany(company);

        // Handle Services relationship
        if (requestDTO.getServiceIds() != null && !requestDTO.getServiceIds().isEmpty()) {
            List<Service> services = serviceRepository.findAllById(requestDTO.getServiceIds());
            if (services.size() != requestDTO.getServiceIds().size()) {
                throw new ResourceNotFoundException("One or more services not found");
            }
            employee.setServices(services);
        }

        Employee savedEmployee = employeeRepository.save(employee);

        // Handle Shifts (Schedule) - Create manually
        if (requestDTO.getSchedule() != null && !requestDTO.getSchedule().isEmpty()) {
            List<WorkingShiftRequestDTO> shiftDTOs = requestDTO.getSchedule();
            for (WorkingShiftRequestDTO shiftDTO : shiftDTOs) {
                // Validate time
                if (shiftDTO.getStartTime().isAfter(shiftDTO.getEndTime())) {
                    throw new IllegalArgumentException(
                            "Start time must be before end time for day: " + shiftDTO.getDayOfWeek());
                }

                WorkingShift shift = new WorkingShift();
                shift.setDayOfWeek(shiftDTO.getDayOfWeek());
                shift.setStartTime(shiftDTO.getStartTime());
                shift.setEndTime(shiftDTO.getEndTime());
                shift.setShiftName(shiftDTO.getShiftName() != null ? shiftDTO.getShiftName() : "Standard Shift");

                shift.setEmployee(savedEmployee);
                workingShiftRepository.save(shift);
            }
        }

        return mapToResponseDTO(savedEmployee);
    }

    @Transactional
    public EmployeeResponseDTO updateEmployee(Long id, EmployeeRequestDTO requestDTO) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        // Check if email is being changed to one that already exists
        if (!employee.getEmail().equals(requestDTO.getEmail()) &&
                employeeRepository.existsByEmail(requestDTO.getEmail())) {
            throw new DuplicateResourceException("Employee with email " + requestDTO.getEmail() + " already exists");
        }

        employee.setName(requestDTO.getName());
        employee.setEmail(requestDTO.getEmail());

        // Only update password if provided and not empty
        if (requestDTO.getPassword() != null && !requestDTO.getPassword().trim().isEmpty()) {
            employee.setPassword(passwordEncoder.encode(requestDTO.getPassword()));
        }


        // Update Services
        if (requestDTO.getServiceIds() != null) {
            List<Service> services = serviceRepository.findAllById(requestDTO.getServiceIds());
            if (services.size() != requestDTO.getServiceIds().size()) {
                throw new ResourceNotFoundException("One or more services not found");
            }
            employee.setServices(services);
        }

        // Update Shifts
        if (requestDTO.getSchedule() != null) {
            // Clear existing shifts (OrphanRemoval will delete them from DB)
            // Manual delete via repository
            List<WorkingShift> existingShifts = workingShiftRepository.findByEmployeeUserId(id);
            workingShiftRepository.deleteAll(existingShifts);

            for (WorkingShiftRequestDTO shiftDTO : requestDTO.getSchedule()) {
                // Validate time
                if (shiftDTO.getStartTime().isAfter(shiftDTO.getEndTime())) {
                    throw new IllegalArgumentException(
                            "Start time must be before end time for day: " + shiftDTO.getDayOfWeek());
                }

                WorkingShift shift = new WorkingShift();
                shift.setDayOfWeek(shiftDTO.getDayOfWeek());
                shift.setStartTime(shiftDTO.getStartTime());
                shift.setEndTime(shiftDTO.getEndTime());
                shift.setShiftName(shiftDTO.getShiftName() != null ? shiftDTO.getShiftName() : "Standard Shift");

                shift.setEmployee(employee);
                workingShiftRepository.save(shift);
            }
        }

        Employee updatedEmployee = employeeRepository.save(employee);
        return mapToResponseDTO(updatedEmployee);
    }

    public List<EmployeeResponseDTO> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteEmployee(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Employee not found with id: " + id);
        }

        // Delete associated working shifts first
        List<WorkingShift> shifts = workingShiftRepository.findByEmployeeUserId(id);
        workingShiftRepository.deleteAll(shifts);

        employeeRepository.deleteById(id);
    }

    public EmployeeResponseDTO getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return mapToResponseDTO(employee);
    }

    private EmployeeResponseDTO mapToResponseDTO(Employee employee) {
        EmployeeResponseDTO dto = new EmployeeResponseDTO();
        dto.setId(employee.getUserId());
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
                        service.getUpdatedAt()))
                .collect(Collectors.toList());

        dto.setAssignedServices(serviceDTOs);

        List<WorkingShift> shifts = workingShiftRepository.findByEmployeeUserId(employee.getUserId());
        List<com.appointment.api.dto.WorkingShiftResponseDTO> shiftDTOs = shifts.stream()
                .map(shift -> {
                    com.appointment.api.dto.WorkingShiftResponseDTO shiftDTO = new com.appointment.api.dto.WorkingShiftResponseDTO();
                    shiftDTO.setShiftId(shift.getShiftId());
                    shiftDTO.setDayOfWeek(shift.getDayOfWeek());
                    shiftDTO.setStartTime(shift.getStartTime());
                    shiftDTO.setEndTime(shift.getEndTime());
                    shiftDTO.setShiftName(shift.getShiftName());
                    return shiftDTO;
                })
                .collect(Collectors.toList());

        dto.setSchedule(shiftDTOs);

        return dto;
    }
}