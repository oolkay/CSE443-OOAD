package com.appointment.api.controller;

import com.appointment.api.dto.WorkingShiftRequestDTO;
import com.appointment.api.entity.WorkingShift;
import com.appointment.api.service.WorkingShiftService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/working-shifts")
@RequiredArgsConstructor
public class WorkingShiftController {

    private final WorkingShiftService workingShiftService;

    @PostMapping("/{employeeId}")
    public ResponseEntity<WorkingShift> defineShift(
            @PathVariable Long employeeId,
            @Valid @RequestBody WorkingShiftRequestDTO request) {
        
        WorkingShift definedShift = workingShiftService.defineWorkingShift(employeeId, request);
        return ResponseEntity.ok(definedShift);
    }

    @PostMapping("/{employeeId}/weekly")
    public ResponseEntity<List<WorkingShift>> defineWeeklySchedule(
            @PathVariable Long employeeId,
            @Valid @RequestBody List<WorkingShiftRequestDTO> requests) {
        
        List<WorkingShift> weeklySchedule = workingShiftService.defineWeeklySchedule(employeeId, requests);
        return ResponseEntity.ok(weeklySchedule);
    }

    @GetMapping("/{employeeId}")
    public ResponseEntity<List<WorkingShift>> getEmployeeSchedule(@PathVariable Long employeeId) {
        // Service katmanında "findByEmployee_UserId" metodunu kullandığımız varsayılmıştır.
        List<WorkingShift> schedule = workingShiftService.getScheduleForEmployee(employeeId);
        return ResponseEntity.ok(schedule);
    }
}