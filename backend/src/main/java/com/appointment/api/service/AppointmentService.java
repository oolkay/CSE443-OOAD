package com.appointment.api.service;

import com.appointment.api.dto.AppointmentRequestDTO;
import com.appointment.api.dto.AppointmentResponse;
import com.appointment.api.dto.AvailableSlotDTO;
import com.appointment.api.dto.EmailTemplateData;
import com.appointment.api.dto.EmployeeAvailabilityResponse;
import com.appointment.api.entity.*;
import com.appointment.api.exception.AppointmentCancellationException;
import com.appointment.api.provider.EmailNotificationProvider;
import com.appointment.api.repository.AppointmentRepository;
import com.appointment.api.repository.BranchManagerRepository;
import com.appointment.api.repository.CustomerRepository;
import com.appointment.api.repository.EmployeeRepository;
import com.appointment.api.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;
    private final ServiceRepository serviceRepository;
    private final BranchManagerRepository branchManagerRepository;
    private final EmailNotificationProvider emailNotificationProvider;
    private final WorkingShiftService workingShiftService;

    @Transactional
    public AppointmentResponse createAppointment(AppointmentRequestDTO request) {
        // Validate that appointment is not in the past
        if (request.getStartTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot create appointments for past dates");
        }

        // Fetch customer
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + request.getCustomerId()));

        // Fetch service
        com.appointment.api.entity.Service service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + request.getServiceId()));

        // Calculate end time based on service duration
        LocalDateTime endTime = request.getStartTime().plusMinutes(service.getTimeDuration());

        // Check if customer already has an appointment at this time
        if (hasCustomerConflict(customer.getUserId(), request.getStartTime(), endTime)) {
            throw new RuntimeException("You already have an appointment scheduled at this time");
        }

        // Fetch employee
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + request.getEmployeeId()));

        // Create appointment
        Appointment appointment = new Appointment();
        appointment.setCustomer(customer);
        appointment.setEmployee(employee);
        appointment.setService(service);
        appointment.setStartTime(request.getStartTime());
        appointment.setEndTime(endTime);
        appointment.setStatus(AppointmentStatus.PENDING);

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Send confirmation email
        sendAppointmentConfirmationEmail(savedAppointment);

        return mapToResponse(savedAppointment);
    }

    @Transactional
    public AppointmentResponse updateAppointment(Long appointmentId, AppointmentRequestDTO request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + appointmentId));

        // Check if customer is the owner
        if (!appointment.getCustomer().getUserId().equals(request.getCustomerId())) {
            throw new RuntimeException("Unauthorized: You can only update your own appointments");
        }

        // Check if appointment can be updated (only PENDING appointments)
        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new RuntimeException("Only pending appointments can be updated");
        }

        // Update employee if changed
        if (request.getEmployeeId() != null && !request.getEmployeeId().equals(appointment.getEmployee().getUserId())) {
            Employee employee = employeeRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new RuntimeException("Employee not found with id: " + request.getEmployeeId()));
            appointment.setEmployee(employee);
        }

        // Update service if changed
        if (request.getServiceId() != null && !request.getServiceId().equals(appointment.getService().getServiceId())) {
            com.appointment.api.entity.Service service = serviceRepository.findById(request.getServiceId())
                    .orElseThrow(() -> new RuntimeException("Service not found with id: " + request.getServiceId()));
            appointment.setService(service);
        }

        // Update time if changed
        if (request.getStartTime() != null && !request.getStartTime().equals(appointment.getStartTime())) {
            LocalDateTime endTime = request.getStartTime().plusMinutes(appointment.getService().getTimeDuration());

            // Check if employee is available
            if (!isEmployeeAvailable(appointment.getEmployee().getUserId(), request.getStartTime(), endTime,
                    appointmentId)) {
                throw new RuntimeException("Employee is not available at the requested time");
            }

            appointment.setStartTime(request.getStartTime());
            appointment.setEndTime(endTime);
            appointment.setStatus(AppointmentStatus.PENDING);
        }

        Appointment updatedAppointment = appointmentRepository.save(appointment);

        // Send email notification
        // emailService.sendAppointmentUpdate(appointment.getCustomer().getEmail(),
        // updatedAppointment);

        return mapToResponse(updatedAppointment);
    }

    @Transactional
    public void deleteAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + appointmentId));

        // Check if appointment is less than 24 hours away
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime appointmentTime = appointment.getStartTime();
        long hoursUntilAppointment = java.time.Duration.between(now, appointmentTime).toHours();

        if (hoursUntilAppointment < 24 && hoursUntilAppointment >= 0) {
            throw new AppointmentCancellationException(
                    "Cannot cancel appointment: Less than 24 hours remainining. Please contact with the company.");
        }

        // Instead of deleting, mark as cancelled
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);

        // Send cancellation email
        sendAppointmentCancellationEmail(appointment);
    }

    public AppointmentResponse getAppointmentById(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + appointmentId));
        return mapToResponse(appointment);
    }

    public List<AppointmentResponse> getCustomerAppointments(Long customerId) {
        List<Appointment> appointments = appointmentRepository.findByCustomer_UserId(customerId);
        return appointments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AppointmentResponse> getEmployeeAppointments(Long employeeId) {
        List<Appointment> appointments = appointmentRepository.findByEmployee_UserId(employeeId);
        return appointments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AppointmentResponse> getResourceAppointments(Long resourceId) {
        List<Appointment> appointments = appointmentRepository.findByResources_ResourceId(resourceId);
        return appointments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AppointmentResponse> getServiceAppointments(Long serviceId) {
        List<Appointment> appointments = appointmentRepository.findByService_ServiceId(serviceId);
        return appointments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get employee availability for a specific date
     * Returns available time slots based on working hours and existing appointments
     */
    public EmployeeAvailabilityResponse getEmployeeAvailability(Long employeeId, LocalDate date, Long serviceDuration) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));

        // Get day of week from the requested date
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        String dayName = dayOfWeek.toString(); // "MONDAY", "TUESDAY", etc.

        // Fetch employee's schedule for this day
        List<WorkingShift> shifts = workingShiftService.getScheduleForEmployee(employeeId);
        Optional<WorkingShift> dayShift = shifts.stream()
                .filter(shift -> shift.getDayOfWeek().equalsIgnoreCase(dayName))
                .findFirst();

        // If no schedule for this day, employee doesn't work
        if (dayShift.isEmpty()) {
            return EmployeeAvailabilityResponse.builder()
                    .employeeId(employeeId)
                    .employeeName(employee.getName())
                    .date(date)
                    .workStartTime(null)
                    .workEndTime(null)
                    .availableSlots(new ArrayList<>())
                    .bookedSlots(new ArrayList<>())
                    .build();
        }

        // Use actual schedule times
        LocalTime workStart = dayShift.get().getStartTime();
        LocalTime workEnd = dayShift.get().getEndTime();

        // Get all appointments for this employee on this date
        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = date.atTime(23, 59, 59);

        List<Appointment> appointments = appointmentRepository
                .findByEmployee_UserIdAndStartTimeBetween(employeeId, dayStart, dayEnd)
                .stream()
                .filter(a -> a.getStatus() == AppointmentStatus.APPROVED)
                .collect(Collectors.toList());

        // Convert appointments to booked slots
        List<AvailableSlotDTO> bookedSlots = appointments.stream()
                .map(a -> AvailableSlotDTO.builder()
                        .startTime(a.getStartTime())
                        .endTime(a.getEndTime())
                        .build())
                .collect(Collectors.toList());

        // Calculate available slots
        List<AvailableSlotDTO> availableSlots = calculateAvailableSlots(
                date, workStart, workEnd, bookedSlots, serviceDuration);

        return EmployeeAvailabilityResponse.builder()
                .employeeId(employeeId)
                .employeeName(employee.getName())
                .date(date)
                .workStartTime(workStart)
                .workEndTime(workEnd)
                .availableSlots(availableSlots)
                .bookedSlots(bookedSlots)
                .build();
    }

    /**
     * Get employee availability for multiple days
     */
    public List<EmployeeAvailabilityResponse> getEmployeeAvailabilityRange(
            Long employeeId, LocalDate startDate, LocalDate endDate, Long serviceDuration) {

        List<EmployeeAvailabilityResponse> availabilities = new ArrayList<>();
        LocalDate currentDate = startDate;

        while (!currentDate.isAfter(endDate)) {
            availabilities.add(getEmployeeAvailability(employeeId, currentDate, serviceDuration));
            currentDate = currentDate.plusDays(1);
        }

        return availabilities;
    }

    /**
     * Calculate available time slots based on working hours and booked appointments
     */
    private List<AvailableSlotDTO> calculateAvailableSlots(
            LocalDate date, LocalTime workStart, LocalTime workEnd,
            List<AvailableSlotDTO> bookedSlots, Long serviceDuration) {

        List<AvailableSlotDTO> availableSlots = new ArrayList<>();
        LocalDateTime slotStart = date.atTime(workStart);
        LocalDateTime workEndDateTime = date.atTime(workEnd);

        // Slot interval in minutes (fixed at 30 minutes)
        int slotInterval = 30;

        // Loop until the service start time + duration exceeds work end time
        while (!slotStart.plusMinutes(serviceDuration).isAfter(workEndDateTime)) {

            final LocalDateTime currentSlotStart = slotStart;
            final LocalDateTime currentSlotEnd = slotStart.plusMinutes(serviceDuration);

            // Check if this slot conflicts with any booked appointment
            // IMPORTANT: Check if the ENTIRE duration [currentSlotStart, currentSlotEnd] is
            // free
            boolean isAvailable = bookedSlots.stream()
                    .noneMatch(booked -> hasTimeConflict(currentSlotStart, currentSlotEnd,
                            booked.getStartTime(), booked.getEndTime()));

            if (isAvailable) {
                availableSlots.add(AvailableSlotDTO.builder()
                        .startTime(currentSlotStart)
                        .endTime(currentSlotStart.plusMinutes(30)) // Show 30 min slot in UI, but availability is
                                                                   // checked for full
                                                                   // duration
                        .build());
            }

            slotStart = slotStart.plusMinutes(slotInterval);
        }

        return availableSlots;
    }

    /**
     * Check if two time ranges conflict
     */
    private boolean hasTimeConflict(LocalDateTime start1, LocalDateTime end1,
            LocalDateTime start2, LocalDateTime end2) {
        return !(end1.isBefore(start2) || end1.equals(start2) ||
                start1.isAfter(end2) || start1.equals(end2));
    }

    private boolean isEmployeeAvailable(Long employeeId, LocalDateTime startTime, LocalDateTime endTime) {
        return isEmployeeAvailable(employeeId, startTime, endTime, null);
    }

    private boolean isEmployeeAvailable(Long employeeId, LocalDateTime startTime, LocalDateTime endTime,
            Long excludeAppointmentId) {
        List<Appointment> conflictingAppointments = appointmentRepository
                .findByEmployee_UserIdAndStartTimeBetween(employeeId, startTime.minusHours(1), endTime.plusHours(1))
                .stream()
                .filter(a -> a.getStatus() != AppointmentStatus.CANCELLED)
                .filter(a -> excludeAppointmentId == null || !a.getAppointmentId().equals(excludeAppointmentId))
                .filter(a -> {
                    // Check if there's an overlap
                    return !(endTime.isBefore(a.getStartTime()) || endTime.isEqual(a.getStartTime()) ||
                            startTime.isAfter(a.getEndTime()) || startTime.isEqual(a.getEndTime()));
                })
                .collect(Collectors.toList());

        return conflictingAppointments.isEmpty();
    }

    /**
     * Check if customer has any conflicting appointment at the requested time
     * Checks both PENDING and APPROVED appointments (not CANCELLED or REJECTED)
     */
    private boolean hasCustomerConflict(Long customerId, LocalDateTime startTime, LocalDateTime endTime) {
        List<Appointment> customerAppointments = appointmentRepository
                .findByCustomer_UserId(customerId)
                .stream()
                .filter(a -> a.getStatus() == AppointmentStatus.PENDING ||
                        a.getStatus() == AppointmentStatus.APPROVED)
                .filter(a -> {
                    // Check if there's a time overlap
                    return !(endTime.isBefore(a.getStartTime()) || endTime.isEqual(a.getStartTime()) ||
                            startTime.isAfter(a.getEndTime()) || startTime.isEqual(a.getEndTime()));
                })
                .collect(Collectors.toList());

        return !customerAppointments.isEmpty();
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        return AppointmentResponse.builder()
                .appointmentId(appointment.getAppointmentId())
                .customerId(appointment.getCustomer().getUserId())
                .customerName(appointment.getCustomer().getName())
                .customerEmail(appointment.getCustomer().getEmail())
                .employeeId(appointment.getEmployee().getUserId())
                .employeeName(appointment.getEmployee().getName())
                .serviceId(appointment.getService().getServiceId())
                .serviceName(appointment.getService().getName())
                .serviceDuration(appointment.getService().getTimeDuration())
                .startTime(appointment.getStartTime())
                .endTime(appointment.getEndTime())
                .status(appointment.getStatus())
                .createdAt(appointment.getCreatedAt())
                .updatedAt(appointment.getUpdatedAt())
                .companyPhone(appointment.getEmployee().getCompany() != null
                        ? appointment.getEmployee().getCompany().getPhoneNumber()
                        : null)
                .build();
    }

    /**
     * Get all appointments for branch manager's company
     */
    public List<AppointmentResponse> getCompanyAppointments(Long managerId) {
        BranchManager manager = branchManagerRepository.findById(managerId)
                .orElseThrow(() -> new RuntimeException("Branch manager not found with id: " + managerId));

        Company company = manager.getCompany();
        if (company == null) {
            throw new RuntimeException("Branch manager is not assigned to any company");
        }

        // Get all employees of this company
        List<Employee> employees = employeeRepository.findByCompany_CompanyId(company.getCompanyId());

        // Get all appointments for these employees
        List<Appointment> appointments = new ArrayList<>();
        for (Employee employee : employees) {
            appointments.addAll(appointmentRepository.findByEmployee_UserId(employee.getUserId()));
        }

        return appointments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get conflicting appointments for a specific time slot
     */
    public List<AppointmentResponse> getConflictingAppointments(Long employeeId,
            LocalDateTime startTime, LocalDateTime endTime) {
        // Verify employee exists
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));

        // Find all PENDING appointments that conflict with this time slot
        List<Appointment> conflicts = appointmentRepository
                .findByEmployee_UserIdAndStartTimeBetween(employeeId, startTime.minusHours(1), endTime.plusHours(1))
                .stream()
                .filter(a -> a.getStatus() == AppointmentStatus.PENDING)
                .filter(a -> {
                    // Check if there's an overlap
                    return !(endTime.isBefore(a.getStartTime()) || endTime.isEqual(a.getStartTime()) ||
                            startTime.isAfter(a.getEndTime()) || startTime.isEqual(a.getEndTime()));
                })
                .collect(Collectors.toList());

        return conflicts.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get conflicting appointments for a specific time slot (Manager version)
     * Manager can check conflicts for any employee in their company
     */
    public List<AppointmentResponse> getConflictingAppointmentsForManager(Long managerId, Long employeeId,
            LocalDateTime startTime, LocalDateTime endTime) {
        // Verify manager has access to this employee
        BranchManager manager = branchManagerRepository.findById(managerId)
                .orElseThrow(() -> new RuntimeException("Branch manager not found with id: " + managerId));

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));

        if (!employee.getCompany().getCompanyId().equals(manager.getCompany().getCompanyId())) {
            throw new RuntimeException("Unauthorized: Employee does not belong to your company");
        }

        // Find all PENDING appointments that conflict with this time slot
        List<Appointment> conflicts = appointmentRepository
                .findByEmployee_UserIdAndStartTimeBetween(employeeId, startTime.minusHours(1), endTime.plusHours(1))
                .stream()
                .filter(a -> a.getStatus() == AppointmentStatus.PENDING)
                .filter(a -> {
                    // Check if there's an overlap
                    return !(endTime.isBefore(a.getStartTime()) || endTime.isEqual(a.getStartTime()) ||
                            startTime.isAfter(a.getEndTime()) || startTime.isEqual(a.getEndTime()));
                })
                .collect(Collectors.toList());

        return conflicts.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Approve an appointment (automatically rejects conflicting ones)
     * Now handled by Employee instead of BranchManager
     */
    @Transactional
    public AppointmentResponse approveAppointment(Long employeeId, Long appointmentId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Çalışan bulunamadı"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Randevu bulunamadı"));

        // Verify employee is the assigned employee for this appointment
        if (!appointment.getEmployee().getUserId().equals(employeeId)) {
            throw new RuntimeException("Bu randevuyu sadece size atanmış olduğunda onaylayabilirsiniz");
        }

        // Can only approve PENDING appointments
        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new RuntimeException("Sadece bekleyen randevular onaylanabilir");
        }

        // Find and reject all conflicting PENDING appointments
        List<Appointment> conflicts = appointmentRepository
                .findByEmployee_UserIdAndStartTimeBetween(
                        appointment.getEmployee().getUserId(),
                        appointment.getStartTime().minusHours(1),
                        appointment.getEndTime().plusHours(1))
                .stream()
                .filter(a -> a.getStatus() == AppointmentStatus.PENDING)
                .filter(a -> !a.getAppointmentId().equals(appointmentId))
                .filter(a -> {
                    // Check if there's an overlap
                    return !(appointment.getEndTime().isBefore(a.getStartTime())
                            || appointment.getEndTime().isEqual(a.getStartTime()) ||
                            appointment.getStartTime().isAfter(a.getEndTime())
                            || appointment.getStartTime().isEqual(a.getEndTime()));
                })
                .collect(Collectors.toList());

        // Reject conflicting appointments
        for (Appointment conflict : conflicts) {
            conflict.setStatus(AppointmentStatus.REJECTED);
            appointmentRepository.save(conflict);
            // Send rejection email
            sendAppointmentRejectionEmail(conflict, "Conflicting with approved appointment");
        }

        // Approve the appointment
        appointment.setStatus(AppointmentStatus.APPROVED);
        Appointment approvedAppointment = appointmentRepository.save(appointment);

        // Send approval email
        sendAppointmentApprovalEmail(approvedAppointment);

        return mapToResponse(approvedAppointment);
    }

    /**
     * Reject an appointment
     */
    @Transactional
    public AppointmentResponse rejectAppointment(Long employeeId, Long appointmentId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Çalışan bulunamadı"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Randevu bulunamadı"));

        // Verify employee is the assigned employee for this appointment
        if (!appointment.getEmployee().getUserId().equals(employeeId)) {
            throw new RuntimeException("Bu randevuyu sadece size atanmış olduğunda reddedebilirsiniz");
        }

        // Can only reject PENDING appointments
        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new RuntimeException("Sadece bekleyen randevular reddedilebilir");
        }

        // Reject the appointment
        appointment.setStatus(AppointmentStatus.REJECTED);
        Appointment rejectedAppointment = appointmentRepository.save(appointment);

        // Send rejection email
        sendAppointmentRejectionEmail(rejectedAppointment, "Rejected by employee");

        return mapToResponse(rejectedAppointment);
    }

    // Helper methods for sending emails
    private void sendAppointmentConfirmationEmail(Appointment appointment) {
        // Build data BEFORE async to avoid Hibernate session issues
        final EmailTemplateData data = buildEmailTemplateData(appointment);
        final String email = appointment.getCustomer().getEmail();

        CompletableFuture.runAsync(() -> {
            try {
                emailNotificationProvider.sendTemplatedNotification(
                        email,
                        "appointment_confirmation",
                        data);
            } catch (Exception e) {
                // Log error but don't fail the appointment creation
                System.err.println("Failed to send confirmation email: " + e.getMessage());
            }
        });
    }

    private void sendAppointmentApprovalEmail(Appointment appointment) {
        // Build data BEFORE async to avoid Hibernate session issues
        final EmailTemplateData data = buildEmailTemplateData(appointment);
        final String email = appointment.getCustomer().getEmail();

        CompletableFuture.runAsync(() -> {
            try {
                emailNotificationProvider.sendTemplatedNotification(
                        email,
                        "appointment_approval",
                        data);
            } catch (Exception e) {
                System.err.println("Failed to send approval email: " + e.getMessage());
            }
        });
    }

    private void sendAppointmentRejectionEmail(Appointment appointment, String reason) {
        // Build data BEFORE async to avoid Hibernate session issues
        final EmailTemplateData data = buildEmailTemplateData(appointment);
        final String email = appointment.getCustomer().getEmail();
        final Map<String, Object> additionalData = new HashMap<>();
        additionalData.put("rejectionReason", reason);
        data.setAdditionalData(additionalData);

        CompletableFuture.runAsync(() -> {
            try {
                emailNotificationProvider.sendTemplatedNotification(
                        email,
                        "appointment_rejection",
                        data);
            } catch (Exception e) {
                System.err.println("Failed to send rejection email: " + e.getMessage());
            }
        });
    }

    private void sendAppointmentCancellationEmail(Appointment appointment) {
        // Build data BEFORE async to avoid Hibernate session issues
        final EmailTemplateData data = buildEmailTemplateData(appointment);
        final String email = appointment.getCustomer().getEmail();

        CompletableFuture.runAsync(() -> {
            try {
                emailNotificationProvider.sendTemplatedNotification(
                        email,
                        "appointment_cancellation",
                        data);
            } catch (Exception e) {
                System.err.println("Failed to send cancellation email: " + e.getMessage());
            }
        });
    }

    private EmailTemplateData buildEmailTemplateData(Appointment appointment) {
        return EmailTemplateData.builder()
                .customerName(appointment.getCustomer().getName())
                .serviceName(appointment.getService().getName())
                .employeeName(appointment.getEmployee().getName())
                .companyName(appointment.getEmployee().getCompany().getName())
                .appointmentDate(appointment.getStartTime().toLocalDate())
                .appointmentTime(appointment.getStartTime().toLocalTime())
                .build();
    }
}