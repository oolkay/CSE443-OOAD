package com.appointment.api.controller;

import com.appointment.api.dto.AppointmentRequestDTO;
import com.appointment.api.dto.AppointmentResponse;
import com.appointment.api.dto.EmployeeAvailabilityResponse;
import com.appointment.api.exception.ErrorResponse;
import com.appointment.api.service.AppointmentService;
import com.appointment.api.util.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Create a new appointment
     * POST /api/appointments
     */
    @PostMapping
    public ResponseEntity<?> createAppointment(@Valid @RequestBody AppointmentRequestDTO dto,
            HttpServletRequest servletRequest) {
        try {
            AppointmentResponse response = appointmentService.createAppointment(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            ErrorResponse error = new ErrorResponse(LocalDateTime.now(), HttpStatus.BAD_REQUEST.value(), "Bad Request",
                    e.getMessage(), servletRequest.getRequestURI());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Update an existing appointment
     * PUT /api/appointments/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAppointment(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentRequestDTO dto,
            HttpServletRequest servletRequest) {
        try {
            AppointmentResponse response = appointmentService.updateAppointment(id, dto);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            ErrorResponse error = new ErrorResponse(LocalDateTime.now(), HttpStatus.BAD_REQUEST.value(), "Bad Request",
                    e.getMessage(), servletRequest.getRequestURI());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Cancel/Delete an appointment
     * DELETE /api/appointments/{id}
     * Cannot cancel if less than 24 hours remain
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAppointment(
            @PathVariable Long id,
            HttpServletRequest servletRequest) {
        try {
            appointmentService.deleteAppointment(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            ErrorResponse error = new ErrorResponse(LocalDateTime.now(), HttpStatus.BAD_REQUEST.value(),
                    "Appointment Cancellation Error", e.getMessage(), servletRequest.getRequestURI());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get appointment by ID
     * GET /api/appointments/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointmentById(@PathVariable Long id, HttpServletRequest servletRequest) {
        try {
            AppointmentResponse response = appointmentService.getAppointmentById(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            ErrorResponse error = new ErrorResponse(LocalDateTime.now(), HttpStatus.NOT_FOUND.value(), "Not Found",
                    e.getMessage(), servletRequest.getRequestURI());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * Get all appointments for a customer
     * GET /api/appointments/customer/{customerId}
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<?> getCustomerAppointments(
            @PathVariable Long customerId,
            @RequestHeader("Authorization") String authHeader) {

        // Extract token and verify userId matches
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        Long tokenUserId = jwtTokenProvider.getUserIdFromToken(token);

        if (tokenUserId == null || !tokenUserId.equals(customerId)) {
            ErrorResponse error = new ErrorResponse(
                    LocalDateTime.now(),
                    HttpStatus.FORBIDDEN.value(),
                    "Forbidden",
                    "You can only view your own appointments",
                    "/api/appointments/customer/" + customerId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }

        List<AppointmentResponse> appointments = appointmentService.getCustomerAppointments(customerId);
        return ResponseEntity.ok(appointments);
    }

    /**
     * Get all appointments for an employee
     * GET /api/appointments/employee/{employeeId}
     */
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<?> getEmployeeAppointments(
            @PathVariable Long employeeId,
            @RequestHeader("Authorization") String authHeader) {
        // Access control is handled by PreAuthorize for roles, detailed ownership check
        // can be added if needed
        // For Manager/Super Admin, they can view any employee's appointments (scoped by
        // company ideally)
        List<AppointmentResponse> appointments = appointmentService.getEmployeeAppointments(employeeId);
        return ResponseEntity.ok(appointments);
    }

    /**
     * Get all appointments for a resource
     * GET /api/appointments/resource/{resourceId}
     */
    @GetMapping("/resource/{resourceId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<?> getResourceAppointments(@PathVariable Long resourceId) {
        try {
            List<AppointmentResponse> appointments = appointmentService.getResourceAppointments(resourceId);
            return ResponseEntity.ok(appointments);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(
                    LocalDateTime.now(), HttpStatus.NOT_FOUND.value(), "Not Found", e.getMessage(),
                    "/api/appointments/resource/" + resourceId));
        }
    }

    /**
     * Get all appointments for a service
     * GET /api/appointments/service/{serviceId}
     */
    @GetMapping("/service/{serviceId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<?> getServiceAppointments(@PathVariable Long serviceId) {
        try {
            List<AppointmentResponse> appointments = appointmentService.getServiceAppointments(serviceId);
            return ResponseEntity.ok(appointments);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(
                    LocalDateTime.now(), HttpStatus.NOT_FOUND.value(), "Not Found", e.getMessage(),
                    "/api/appointments/service/" + serviceId));
        }
    }

    /**
     * Get employee availability for a specific date
     * GET
     * /api/appointments/availability/employee/{employeeId}?date=2025-12-10&serviceDuration=30
     */
    @GetMapping("/availability/employee/{employeeId}")
    public ResponseEntity<?> getEmployeeAvailability(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam Long serviceDuration,
            @RequestParam(required = false) Long serviceId,
            HttpServletRequest servletRequest) {
        try {
            EmployeeAvailabilityResponse availability = appointmentService.getEmployeeAvailability(
                    employeeId, date, serviceDuration, serviceId);
            return ResponseEntity.ok(availability);
        } catch (RuntimeException e) {
            ErrorResponse error = new ErrorResponse(LocalDateTime.now(), HttpStatus.BAD_REQUEST.value(), "Bad Request",
                    e.getMessage(), servletRequest.getRequestURI());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get employee availability for a date range
     * GET
     * /api/appointments/availability/employee/{employeeId}/range?startDate=2025-12-10&endDate=2025-12-17&serviceDuration=30
     */
    @GetMapping("/availability/employee/{employeeId}/range")
    public ResponseEntity<?> getEmployeeAvailabilityRange(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam Long serviceDuration,
            @RequestParam(required = false) Long serviceId,
            HttpServletRequest servletRequest) {
        try {
            List<EmployeeAvailabilityResponse> availabilities = appointmentService.getEmployeeAvailabilityRange(
                    employeeId, startDate, endDate, serviceDuration, serviceId);
            return ResponseEntity.ok(availabilities);
        } catch (RuntimeException e) {
            ErrorResponse error = new ErrorResponse(LocalDateTime.now(), HttpStatus.BAD_REQUEST.value(), "Bad Request",
                    e.getMessage(), servletRequest.getRequestURI());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get all appointments for branch manager's company
     * GET /api/appointments/manager/{managerId}
     */
    @GetMapping("/manager/{managerId}")
    public ResponseEntity<?> getCompanyAppointments(@PathVariable Long managerId, HttpServletRequest servletRequest) {
        try {
            List<AppointmentResponse> appointments = appointmentService.getCompanyAppointments(managerId);
            return ResponseEntity.ok(appointments);
        } catch (RuntimeException e) {
            ErrorResponse error = new ErrorResponse(LocalDateTime.now(), HttpStatus.BAD_REQUEST.value(), "Bad Request",
                    e.getMessage(), servletRequest.getRequestURI());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get conflicting appointments for a specific time slot (Employee version)
     * GET
     * /api/appointments/employee/{employeeId}/conflicts?startTime={startTime}&endTime={endTime}
     */
    @GetMapping("/employee/{employeeId}/conflicts")
    public ResponseEntity<?> getConflictingAppointments(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            HttpServletRequest servletRequest) {
        try {
            List<AppointmentResponse> conflicts = appointmentService.getConflictingAppointments(employeeId,
                    startTime, endTime);
            return ResponseEntity.ok(conflicts);
        } catch (RuntimeException e) {
            ErrorResponse error = new ErrorResponse(LocalDateTime.now(), HttpStatus.BAD_REQUEST.value(), "Bad Request",
                    e.getMessage(), servletRequest.getRequestURI());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get conflicting appointments for a specific time slot (Manager version)
     * GET
     * /api/appointments/manager/{managerId}/conflicts?employeeId={employeeId}&startTime={startTime}&endTime={endTime}
     */
    @GetMapping("/manager/{managerId}/conflicts")
    public ResponseEntity<?> getConflictingAppointmentsForManager(
            @PathVariable Long managerId,
            @RequestParam Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            HttpServletRequest servletRequest) {
        try {
            List<AppointmentResponse> conflicts = appointmentService.getConflictingAppointmentsForManager(
                    managerId, employeeId, startTime, endTime);
            return ResponseEntity.ok(conflicts);
        } catch (RuntimeException e) {
            ErrorResponse error = new ErrorResponse(LocalDateTime.now(), HttpStatus.BAD_REQUEST.value(), "Bad Request",
                    e.getMessage(), servletRequest.getRequestURI());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Approve an appointment (automatically rejects conflicting ones)
     * PUT /api/appointments/employee/{employeeId}/approve/{appointmentId}
     */
    @PutMapping("/employee/{employeeId}/approve/{appointmentId}")
    public ResponseEntity<?> approveAppointment(
            @PathVariable Long employeeId,
            @PathVariable Long appointmentId,
            HttpServletRequest servletRequest) {
        try {
            AppointmentResponse response = appointmentService.approveAppointment(employeeId, appointmentId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            ErrorResponse error = new ErrorResponse(LocalDateTime.now(), HttpStatus.BAD_REQUEST.value(),
                    "Approval Failed", e.getMessage(), servletRequest.getRequestURI());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Reject an appointment
     * PUT /api/appointments/employee/{employeeId}/reject/{appointmentId}
     */
    @PutMapping("/employee/{employeeId}/reject/{appointmentId}")
    public ResponseEntity<?> rejectAppointment(
            @PathVariable Long employeeId,
            @PathVariable Long appointmentId,
            HttpServletRequest servletRequest) {
        try {
            AppointmentResponse response = appointmentService.rejectAppointment(employeeId, appointmentId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            ErrorResponse error = new ErrorResponse(LocalDateTime.now(), HttpStatus.BAD_REQUEST.value(),
                    "Rejection Failed", e.getMessage(), servletRequest.getRequestURI());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Handle validation errors
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(
            MethodArgumentNotValidException ex,
            HttpServletRequest servletRequest) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ErrorResponse error = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Validation Failed",
                "Invalid input data: " + errors.toString(),
                servletRequest.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}