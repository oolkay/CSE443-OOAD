package com.appointment.api.controller;

import com.appointment.api.dto.CompanyRequestDTO;
import com.appointment.api.dto.CompanyResponseDTO;
import com.appointment.api.dto.CompanyWithManagerRequestDTO;
import com.appointment.api.dto.ManagerRequestDTO;
import com.appointment.api.dto.EmailTemplateData;
import com.appointment.api.entity.BranchManager;
import com.appointment.api.entity.Company;
import com.appointment.api.entity.Employee;
import com.appointment.api.entity.Resource;
import com.appointment.api.entity.Service;
import com.appointment.api.entity.Appointment;
import com.appointment.api.exception.DuplicateResourceException;
import com.appointment.api.exception.ResourceNotFoundException;
import com.appointment.api.repository.BranchManagerRepository;
import com.appointment.api.repository.CompanyRepository;
import com.appointment.api.repository.EmployeeRepository;
import com.appointment.api.repository.ResourceRepository;
import com.appointment.api.repository.ServiceRepository;
import com.appointment.api.repository.AppointmentRepository;
import com.appointment.api.repository.WorkingShiftRepository;
import com.appointment.api.provider.NotificationProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import java.util.concurrent.CompletableFuture;

/**
 * REST Controller for Company CRUD operations
 * Super Admin can manage companies
 */
@RestController
@Slf4j
@RequestMapping("/api/companies")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class CompanyController {

    private final CompanyRepository companyRepository;
    private final BranchManagerRepository managerRepository;
    private final EmployeeRepository employeeRepository;
    private final ResourceRepository resourceRepository;
    private final ServiceRepository serviceRepository;
    private final AppointmentRepository appointmentRepository;
    private final WorkingShiftRepository workingShiftRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationProvider notificationProvider;

    /**
     * Get all companies
     */
    @GetMapping
    public ResponseEntity<List<CompanyResponseDTO>> getAllCompanies() {
        List<Company> companies = companyRepository.findAll();
        List<CompanyResponseDTO> response = companies.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Get company by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponseDTO> getCompanyById(@PathVariable Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));
        return ResponseEntity.ok(convertToResponseDTO(company));
    }

    /**
     * Create new company with required branch manager
     * According to schema: Every Company must have a Branch Manager
     */
    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<CompanyResponseDTO> createCompany(@RequestBody CompanyWithManagerRequestDTO requestDTO) {
        log.info("Creating company: {}", requestDTO);
        // Check if company email already exists
        if (companyRepository.existsByEmail(requestDTO.getCompanyEmail())) {
            log.error("Company with this email already exists: {}", requestDTO.getCompanyEmail());
            throw new DuplicateResourceException("Company with this email already exists");
        }

        // Check if manager email already exists
        if (managerRepository.existsByEmail(requestDTO.getManagerEmail())) {
            log.error("Manager with this email already exists: {}", requestDTO.getManagerEmail());
            throw new DuplicateResourceException("Manager with this email already exists");
        }

        // Create company first
        Company company = new Company();
        company.setName(requestDTO.getCompanyName());
        company.setEmail(requestDTO.getCompanyEmail());
        company.setAddress(requestDTO.getCompanyAddress());
        company.setPhoneNumber(requestDTO.getCompanyPhoneNumber());

        Company savedCompany = companyRepository.save(company);

        // Create required branch manager
        BranchManager manager = new BranchManager();
        manager.setName(requestDTO.getManagerName());
        manager.setEmail(requestDTO.getManagerEmail());
        manager.setPassword(passwordEncoder.encode(requestDTO.getManagerPassword()));
        manager.setPhoneNumber(requestDTO.getManagerPhoneNumber());
        manager.setCompany(savedCompany);

        BranchManager savedManager = managerRepository.save(manager);

        // Create response directly to avoid lazy loading issues
        CompanyResponseDTO response = new CompanyResponseDTO();
        response.setCompanyId(savedCompany.getCompanyId());
        response.setName(savedCompany.getName());
        response.setEmail(savedCompany.getEmail());
        response.setAddress(savedCompany.getAddress());
        response.setPhoneNumber(savedCompany.getPhoneNumber());
        response.setManagerId(savedManager.getUserId());
        response.setManagerName(savedManager.getName());
        response.setManagerEmail(savedManager.getEmail());
        response.setManagerPhoneNumber(savedManager.getPhoneNumber());
        response.setCreatedAt(savedCompany.getCreatedAt());
        response.setUpdatedAt(savedCompany.getUpdatedAt());

        log.info("Company created successfully: {}", response);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Update company
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<CompanyResponseDTO> updateCompany(
            @PathVariable Long id,
            @RequestBody CompanyRequestDTO companyDTO) {

        Company existingCompany = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));

        // Check if email already exists for another company
        if (!existingCompany.getEmail().equals(companyDTO.getEmail()) &&
                companyRepository.existsByEmail(companyDTO.getEmail())) {
            throw new DuplicateResourceException("Company with this email already exists");
        }

        // Update company fields
        existingCompany.setName(companyDTO.getName());
        existingCompany.setEmail(companyDTO.getEmail());
        existingCompany.setAddress(companyDTO.getAddress());
        existingCompany.setPhoneNumber(companyDTO.getPhoneNumber());

        Company updatedCompany = companyRepository.save(existingCompany);
        return ResponseEntity.ok(convertToResponseDTO(updatedCompany));
    }

    /**
     * Delete company and all related entities
     * Deletes in order: Appointments -> WorkingShifts -> Employees -> Services
     * (removes service_resources join table references) -> Resources -> Company
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Transactional
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        log.info("Deleting company with id: {}", id);

        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));

        // 1. Find all employees of this company
        List<Employee> employees = employeeRepository.findByCompany_CompanyId(id);
        log.info("Found {} employees for company {}", employees.size(), id);

        // 2. Find all services of this company
        List<Service> services = serviceRepository.findByCompany_CompanyId(id);
        log.info("Found {} services for company {}", services.size(), id);

        // 3. Delete all appointments with these employees
        int appointmentCount = 0;
        for (Employee employee : employees) {
            List<Appointment> employeeAppointments = appointmentRepository.findByEmployee_UserId(employee.getUserId());
            appointmentCount += employeeAppointments.size();
            appointmentRepository.deleteAll(employeeAppointments);
        }
        log.info("Deleted {} appointments by employee", appointmentCount);

        // 4. Delete all appointments with these services
        int serviceAppointmentCount = 0;
        for (Service service : services) {
            List<Appointment> serviceAppointments = appointmentRepository
                    .findByService_ServiceId(service.getServiceId());
            serviceAppointmentCount += serviceAppointments.size();
            appointmentRepository.deleteAll(serviceAppointments);
        }
        log.info("Deleted {} appointments by service", serviceAppointmentCount);

        // 5. Delete all working shifts for employees
        int workingShiftCount = 0;
        for (Employee employee : employees) {
            workingShiftRepository.deleteByEmployeeUserId(employee.getUserId());
            workingShiftCount++;
        }
        log.info("Deleted working shifts for {} employees", workingShiftCount);

        // 6. Delete all employees (will cascade delete employee_services join table)
        log.info("Deleting {} employees", employees.size());
        employeeRepository.deleteAll(employees);

        // 7. Delete all services (will remove service_resources join table references)
        log.info("Deleting {} services", services.size());
        serviceRepository.deleteAll(services);

        // 8. Delete all resources (now safe, no more references from service_resources)
        List<Resource> resources = resourceRepository.findByCompanyCompanyId(id);
        log.info("Deleting {} resources", resources.size());
        resourceRepository.deleteAll(resources);

        // 9. Delete company (will cascade delete BranchManager due to CascadeType.ALL)
        log.info("Deleting company with id: {}", id);
        companyRepository.delete(company);

        log.info("Company {} deleted successfully with all related entities", id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Convert Company entity to CompanyResponseDTO
     */
    private CompanyResponseDTO convertToResponseDTO(Company company) {
        CompanyResponseDTO dto = new CompanyResponseDTO();
        dto.setCompanyId(company.getCompanyId());
        dto.setName(company.getName());
        dto.setEmail(company.getEmail());
        dto.setAddress(company.getAddress());
        dto.setPhoneNumber(company.getPhoneNumber());
        dto.setCreatedAt(company.getCreatedAt());
        dto.setUpdatedAt(company.getUpdatedAt());

        // Every company must have a manager according to schema (1:1 relationship)
        if (company.getBranchManager() != null) {
            dto.setManagerId(company.getBranchManager().getUserId());
            dto.setManagerName(company.getBranchManager().getName());
            dto.setManagerEmail(company.getBranchManager().getEmail());
            dto.setManagerPhoneNumber(company.getBranchManager().getPhoneNumber());
        } else {
            // Manager is optional - can be null if not yet assigned
            dto.setManagerId(null);
            dto.setManagerName(null);
            dto.setManagerEmail(null);
            dto.setManagerPhoneNumber(null);
        }

        return dto;
    }

    /**
     * Convert CompanyRequestDTO to Company entity
     */
    private Company convertToEntity(CompanyRequestDTO dto) {
        Company company = new Company();
        company.setName(dto.getName());
        company.setEmail(dto.getEmail());
        company.setAddress(dto.getAddress());
        company.setPhoneNumber(dto.getPhoneNumber());
        return company;
    }
}