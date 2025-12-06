package com.appointment.api.controller;

import com.appointment.api.dto.AppointmentRequestDTO;
import com.appointment.api.dto.AppointmentResponse;
import com.appointment.api.dto.EmployeeAvailabilityResponse;
import com.appointment.api.exception.ErrorResponse;
import com.appointment.api.service.AppointmentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

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

    /**
     * Create a new appointment
     * POST /api/appointments
     */
    @PostMapping
    public ResponseEntity<?> createAppointment(@Valid @RequestBody AppointmentRequestDTO dto, HttpServletRequest servletRequest) {
        try {
            AppointmentResponse response = appointmentService.createAppointment(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            ErrorResponse error = new ErrorResponse(LocalDateTime.now(), HttpStatus.BAD_REQUEST.value(), "Bad Request", e.getMessage(), servletRequest.getRequestURI());
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
            ErrorResponse error = new ErrorResponse(LocalDateTime.now(), HttpStatus.BAD_REQUEST.value(), "Bad Request", e.getMessage(), servletRequest.getRequestURI());
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
            ErrorResponse error = new ErrorResponse(LocalDateTime.now(), HttpStatus.BAD_REQUEST.value(), "Appointment Cancellation Error", e.getMessage(), servletRequest.getRequestURI());
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
            ErrorResponse error = new ErrorResponse(LocalDateTime.now(), HttpStatus.NOT_FOUND.value(), "Not Found", e.getMessage(), servletRequest.getRequestURI());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * Get all appointments for a customer
     * GET /api/appointments/customer/{customerId}
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<AppointmentResponse>> getCustomerAppointments(@PathVariable Long customerId) {
        List<AppointmentResponse> appointments = appointmentService.getCustomerAppointments(customerId);
        return ResponseEntity.ok(appointments);
    }

    /**
     * Get employee availability for a specific date
     * GET /api/appointments/availability/employee/{employeeId}?date=2025-12-10&serviceDuration=30
     */
    @GetMapping("/availability/employee/{employeeId}")
    public ResponseEntity<?> getEmployeeAvailability(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam Long serviceDuration,
            HttpServletRequest servletRequest) {
        try {
            EmployeeAvailabilityResponse availability = appointmentService.getEmployeeAvailability(
                    employeeId, date, serviceDuration);
            return ResponseEntity.ok(availability);
        } catch (RuntimeException e) {
            ErrorResponse error = new ErrorResponse(LocalDateTime.now(), HttpStatus.BAD_REQUEST.value(), "Bad Request", e.getMessage(), servletRequest.getRequestURI());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get employee availability for a date range
     * GET /api/appointments/availability/employee/{employeeId}/range?startDate=2025-12-10&endDate=2025-12-17&serviceDuration=30
     */
    @GetMapping("/availability/employee/{employeeId}/range")
    public ResponseEntity<?> getEmployeeAvailabilityRange(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam Long serviceDuration,
            HttpServletRequest servletRequest) {
        try {
            List<EmployeeAvailabilityResponse> availabilities = appointmentService.getEmployeeAvailabilityRange(
                    employeeId, startDate, endDate, serviceDuration);
            return ResponseEntity.ok(availabilities);
        } catch (RuntimeException e) {
            ErrorResponse error = new ErrorResponse(LocalDateTime.now(), HttpStatus.BAD_REQUEST.value(), "Bad Request", e.getMessage(), servletRequest.getRequestURI());
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
            ErrorResponse error = new ErrorResponse(LocalDateTime.now(), HttpStatus.BAD_REQUEST.value(), "Bad Request", e.getMessage(), servletRequest.getRequestURI());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get conflicting appointments for a specific time slot
     * GET /api/appointments/manager/{managerId}/conflicts?employeeId={employeeId}&startTime={startTime}&endTime={endTime}
     */
    @GetMapping("/manager/{managerId}/conflicts")
    public ResponseEntity<?> getConflictingAppointments(
            @PathVariable Long managerId,
            @RequestParam Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            HttpServletRequest servletRequest) {
        try {
            List<AppointmentResponse> conflicts = appointmentService.getConflictingAppointments(managerId, employeeId, startTime, endTime);
            return ResponseEntity.ok(conflicts);
        } catch (RuntimeException e) {
            ErrorResponse error = new ErrorResponse(LocalDateTime.now(), HttpStatus.BAD_REQUEST.value(), "Bad Request", e.getMessage(), servletRequest.getRequestURI());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Approve an appointment (automatically rejects conflicting ones)
     * PUT /api/appointments/manager/{managerId}/approve/{appointmentId}
     */
    @PutMapping("/manager/{managerId}/approve/{appointmentId}")
    public ResponseEntity<?> approveAppointment(
            @PathVariable Long managerId,
            @PathVariable Long appointmentId,
            HttpServletRequest servletRequest) {
        try {
            AppointmentResponse response = appointmentService.approveAppointment(managerId, appointmentId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            ErrorResponse error = new ErrorResponse(LocalDateTime.now(), HttpStatus.BAD_REQUEST.value(), "Approval Failed", e.getMessage(), servletRequest.getRequestURI());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Reject an appointment
     * PUT /api/appointments/manager/{managerId}/reject/{appointmentId}
     */
    @PutMapping("/manager/{managerId}/reject/{appointmentId}")
    public ResponseEntity<?> rejectAppointment(
            @PathVariable Long managerId,
            @PathVariable Long appointmentId,
            HttpServletRequest servletRequest) {
        try {
            AppointmentResponse response = appointmentService.rejectAppointment(managerId, appointmentId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            ErrorResponse error = new ErrorResponse(LocalDateTime.now(), HttpStatus.BAD_REQUEST.value(), "Rejection Failed", e.getMessage(), servletRequest.getRequestURI());
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
            servletRequest.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}