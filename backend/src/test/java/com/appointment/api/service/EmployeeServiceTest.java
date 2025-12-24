package com.appointment.api.service;

import com.appointment.api.dto.EmployeeRequestDTO;
import com.appointment.api.dto.EmployeeResponseDTO;
import com.appointment.api.entity.Company;
import com.appointment.api.entity.Employee;
import com.appointment.api.exception.DuplicateResourceException;
import com.appointment.api.exception.ResourceNotFoundException;
import com.appointment.api.repository.CompanyRepository;
import com.appointment.api.repository.EmployeeRepository;
import com.appointment.api.repository.ServiceRepository;
import com.appointment.api.repository.WorkingShiftRepository;
import com.appointment.api.entity.WorkingShift;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private ServiceRepository serviceRepository;

    @Mock
    private WorkingShiftRepository workingShiftRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private EmployeeService employeeService;

    private EmployeeRequestDTO requestDTO;
    private Employee employee;
    private Company company;

    @BeforeEach
    void setUp() {
        company = new Company();
        company.setCompanyId(1L);
        company.setName("Test Company");

        requestDTO = new EmployeeRequestDTO();
        requestDTO.setName("John Doe");
        requestDTO.setEmail("john.doe@example.com");
        requestDTO.setPassword("password123");
        requestDTO.setCompanyId(1L);

        employee = new Employee();
        employee.setUserId(1L);
        employee.setName("John Doe");
        employee.setEmail("john.doe@example.com");
        employee.setPassword("encodedPassword");
        employee.setCompany(company);
    }

    @Test
    void createEmployee_Success() {
        when(employeeRepository.existsByEmail(anyString())).thenReturn(false);
        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(employeeRepository.save(any(Employee.class))).thenReturn(employee);

        EmployeeResponseDTO response = employeeService.createEmployee(requestDTO);

        assertNotNull(response);
        assertEquals(requestDTO.getName(), response.getName());
        assertEquals(requestDTO.getEmail(), response.getEmail());
        verify(passwordEncoder).encode("password123");
        verify(employeeRepository).save(any(Employee.class));
    }

    @Test
    void createEmployee_DuplicateEmail_ThrowsException() {
        when(employeeRepository.existsByEmail(anyString())).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> employeeService.createEmployee(requestDTO));
        verify(employeeRepository, never()).save(any(Employee.class));
    }

    @Test
    void createEmployee_CompanyNotFound_ThrowsException() {
        when(employeeRepository.existsByEmail(anyString())).thenReturn(false);
        when(companyRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> employeeService.createEmployee(requestDTO));
    }

    @Test
    void updateEmployee_Success() {
        Long employeeId = 1L;
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));
        when(passwordEncoder.encode(anyString())).thenReturn("newEncodedPassword");
        when(employeeRepository.save(any(Employee.class))).thenReturn(employee);

        requestDTO.setPassword("newPassword");
        EmployeeResponseDTO response = employeeService.updateEmployee(employeeId, requestDTO);

        assertNotNull(response);
        verify(passwordEncoder).encode("newPassword");
        verify(employeeRepository).save(any(Employee.class));
    }

    @Test
    void getEmployeeById_Success() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));

        EmployeeResponseDTO response = employeeService.getEmployeeById(1L);

        assertNotNull(response);
        assertEquals(employee.getUserId(), response.getId());
    }

    @Test
    void getEmployeeById_NotFound_ThrowsException() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> employeeService.getEmployeeById(1L));
    }

    @Test
    void createEmployee_WithSchedule_Success() {
        // Prepare schedule
        com.appointment.api.dto.WorkingShiftRequestDTO shiftRequest = new com.appointment.api.dto.WorkingShiftRequestDTO();
        shiftRequest.setDayOfWeek("MONDAY");
        shiftRequest.setStartTime(java.time.LocalTime.of(9, 0));
        shiftRequest.setEndTime(java.time.LocalTime.of(18, 0));
        shiftRequest.setShiftName("Standard Shift");
        requestDTO.setSchedule(java.util.Collections.singletonList(shiftRequest));

        // Mock dependencies
        when(employeeRepository.existsByEmail(anyString())).thenReturn(false);
        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");

        // Return employee when saved
        Employee savedEmployee = new Employee();
        savedEmployee.setUserId(1L);
        savedEmployee.setName(requestDTO.getName());
        savedEmployee.setEmail(requestDTO.getEmail());
        savedEmployee.setCompany(company);

        when(employeeRepository.save(any(Employee.class))).thenReturn(savedEmployee);

        // Mock finding shifts for response mapping
        WorkingShift shift = new WorkingShift();
        shift.setDayOfWeek("MONDAY");
        shift.setStartTime(java.time.LocalTime.of(9, 0));
        shift.setEndTime(java.time.LocalTime.of(18, 0));
        shift.setShiftName("Standard Shift");
        shift.setEmployee(savedEmployee);

        when(workingShiftRepository.findByEmployeeUserId(1L)).thenReturn(Collections.singletonList(shift));

        // Execute service
        EmployeeResponseDTO response = employeeService.createEmployee(requestDTO);

        // Verify
        assertNotNull(response);
        assertNotNull(response.getSchedule());
        assertEquals(1, response.getSchedule().size());
        assertEquals("MONDAY", response.getSchedule().get(0).getDayOfWeek());
        verify(employeeRepository).save(any(Employee.class));
        verify(workingShiftRepository).save(any(WorkingShift.class));
    }

    @Test
    void deleteEmployee_Success() {
        Long employeeId = 1L;
        when(employeeRepository.existsById(employeeId)).thenReturn(true);

        WorkingShift shift1 = new WorkingShift();
        shift1.setShiftId(101L);
        WorkingShift shift2 = new WorkingShift();
        shift2.setShiftId(102L);
        List<WorkingShift> shifts = java.util.Arrays.asList(shift1, shift2);

        when(workingShiftRepository.findByEmployeeUserId(employeeId)).thenReturn(shifts);

        employeeService.deleteEmployee(employeeId);

        verify(workingShiftRepository).deleteAll(shifts);
        verify(employeeRepository).deleteById(employeeId);
    }
}
