package com.appointment.api.controller;

import com.appointment.api.dto.EmployeeRequestDTO;
import com.appointment.api.dto.EmployeeResponseDTO;
import com.appointment.api.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.security.Principal;
import org.springframework.security.access.AccessDeniedException;
import com.appointment.api.entity.User;
import com.appointment.api.repository.UserRepository;
import com.appointment.api.entity.BranchManager;
import com.appointment.api.entity.SuperAdmin;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    public ResponseEntity<EmployeeResponseDTO> createEmployee(@Valid @RequestBody EmployeeRequestDTO requestDTO,
            Principal principal) {
        setCompanyIdFromPrincipal(requestDTO, principal);
        return new ResponseEntity<>(employeeService.createEmployee(requestDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    public ResponseEntity<EmployeeResponseDTO> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeRequestDTO requestDTO,
            Principal principal) {
        setCompanyIdFromPrincipal(requestDTO, principal);
        return ResponseEntity.ok(employeeService.updateEmployee(id, requestDTO));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<EmployeeResponseDTO>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<EmployeeResponseDTO> getEmployee(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/company/{companyId}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<EmployeeResponseDTO>> getEmployeesByCompany(@PathVariable Long companyId) {
        return ResponseEntity.ok(employeeService.getEmployeesByCompany(companyId));
    }

    private void setCompanyIdFromPrincipal(EmployeeRequestDTO requestDTO, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user instanceof BranchManager) {
            BranchManager manager = (BranchManager) user;
            requestDTO.setCompanyId(manager.getCompany().getCompanyId());
        } else if (user instanceof SuperAdmin) {
            if (requestDTO.getCompanyId() == null) {
                throw new IllegalArgumentException("Company ID is required for Super Admin");
            }
        } else {
            throw new AccessDeniedException("Unauthorized access");
        }
    }
}