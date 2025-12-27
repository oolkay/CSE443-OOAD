package com.appointment.api.service;

import com.appointment.api.dto.EmployeeRequestDTO;
import com.appointment.api.dto.EmployeeResponseDTO;
import com.appointment.api.dto.ServiceResponseDTO;
import com.appointment.api.entity.Company;
import com.appointment.api.entity.Employee;
import com.appointment.api.entity.Service;
import com.appointment.api.exception.DuplicateResourceException;
import com.appointment.api.exception.ResourceNotFoundException;
import com.appointment.api.repository.CompanyRepository;
import com.appointment.api.repository.EmployeeRepository;
import com.appointment.api.repository.ServiceRepository;
import com.appointment.api.repository.AppointmentRepository;
import com.appointment.api.dto.WorkingShiftResponseDTO;
import com.appointment.api.entity.Appointment;
import com.appointment.api.provider.NotificationProvider;
import com.appointment.api.dto.EmailTemplateData;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.concurrent.CompletableFuture;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final CompanyRepository companyRepository;
    private final ServiceRepository serviceRepository;
    private final AppointmentRepository appointmentRepository;
    private final WorkingShiftService workingShiftService;
    private final com.appointment.api.repository.BranchManagerRepository branchManagerRepository;
    private final NotificationProvider notificationProvider;

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

        // Handle Manager relationship
        if (requestDTO.getManagerId() != null) {
            com.appointment.api.entity.BranchManager manager = branchManagerRepository
                    .findById(requestDTO.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Manager not found with id: " + requestDTO.getManagerId()));
            employee.setManager(manager);
        }

        // Handle Services relationship
        if (requestDTO.getServiceIds() != null && !requestDTO.getServiceIds().isEmpty()) {
            List<Service> services = serviceRepository.findAllById(requestDTO.getServiceIds());
            if (services.size() != requestDTO.getServiceIds().size()) {
                throw new ResourceNotFoundException("One or more services not found");
            }
            employee.setServices(services);
        }

        Employee savedEmployee = employeeRepository.save(employee);

        // Save schedule if provided
        if (requestDTO.getSchedule() != null) {
            workingShiftService.defineWeeklySchedule(savedEmployee.getUserId(), requestDTO.getSchedule());
        }

        return mapToResponseDTO(savedEmployee);
    }

    @Transactional
    public EmployeeResponseDTO updateEmployee(Long id, EmployeeRequestDTO requestDTO) {

        /* print the request */
        System.out.println("\n\nRequest: " + requestDTO);

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

        Employee updatedEmployee = employeeRepository.save(employee);

        // Update schedule if provided
        // Update schedule if provided (including empty list to clear shifts)
        if (requestDTO.getSchedule() != null) {
            workingShiftService.defineWeeklySchedule(updatedEmployee.getUserId(), requestDTO.getSchedule());
        }

        return mapToResponseDTO(updatedEmployee);
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponseDTO> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteEmployee(Long id, boolean confirm) {
        if (!employeeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Employee not found with id: " + id);
        }

        if (appointmentRepository.existsByEmployee_UserId(id)) {
            if (!confirm) {
                throw new IllegalArgumentException(
                        "Cannot delete employee. This employee has associated appointments.");
            }

            // Confirm is true, send cancellations and delete appointments
            List<Appointment> appointments = appointmentRepository.findByEmployee_UserId(id);
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
                            .reason("Employee deletion")
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

        workingShiftService.deleteAllShiftsForEmployee(id);
        employeeRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public EmployeeResponseDTO getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return mapToResponseDTO(employee);
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponseDTO> getEmployeesByCompany(Long companyId) {
        return employeeRepository.findByCompany_CompanyId(companyId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponseDTO> getEmployeesByManager(Long managerId) {
        return employeeRepository.findByManager_UserId(managerId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
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

        // Map schedule
        List<WorkingShiftResponseDTO> scheduleDTOs = workingShiftService.getScheduleForEmployee(employee.getUserId())
                .stream()
                .map(shift -> {
                    WorkingShiftResponseDTO shiftDTO = new WorkingShiftResponseDTO();
                    shiftDTO.setDayOfWeek(shift.getDayOfWeek());
                    shiftDTO.setStartTime(shift.getStartTime());
                    shiftDTO.setEndTime(shift.getEndTime());
                    shiftDTO.setShiftName(shift.getShiftName());
                    return shiftDTO;
                })
                .collect(Collectors.toList());
        dto.setSchedule(scheduleDTOs);

        return dto;
    }
}