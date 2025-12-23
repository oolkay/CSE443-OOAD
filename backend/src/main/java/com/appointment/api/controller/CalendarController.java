package com.appointment.api.controller;

import com.appointment.api.dto.CalendarSlotDTO;
import com.appointment.api.exception.ErrorResponse;
import com.appointment.api.service.CalendarService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CalendarController {
    
    private final CalendarService calendarService;
    
    /**
     * Get calendar data with appointments
     * 
     * GET /api/calendar?start_time=2025-12-18T04:00:00&end_time=2025-12-18T20:00:00&interval=15&company_id=2&employee_id=11
     * 
     * @param startTime Start of the time range (ISO 8601 format)
     * @param endTime End of the time range (ISO 8601 format)
     * @param interval Time slot interval in minutes (15, 30, or 60)
     * @param companyId Company ID to filter appointments
     * @param employeeId Optional employee ID to filter appointments
     * @return List of time slots with appointment information
     */
    @GetMapping
    public ResponseEntity<?> getCalendarData(
            @RequestParam("start_time") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam("end_time") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @RequestParam("interval") Integer interval,
            @RequestParam("company_id") String companyId,
            @RequestParam(value = "employee_id", required = false) String employeeId,
            HttpServletRequest servletRequest) {
        try {
            log.info("Getting calendar data for company_id: {}, employee_id: {}, start_time: {}, end_time: {}, interval: {}", companyId, employeeId, startTime, endTime, interval);
            List<CalendarSlotDTO> calendarData = calendarService.getCalendarData(
                startTime, endTime, interval, companyId, employeeId
            );
            return ResponseEntity.ok(calendarData);
        } catch (RuntimeException e) {
            ErrorResponse error = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                e.getMessage(),
                servletRequest.getRequestURI()
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}

