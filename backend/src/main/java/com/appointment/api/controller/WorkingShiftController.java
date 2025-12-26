package com.appointment.api.controller;

import com.appointment.api.dto.WorkingShiftRequestDTO;
import com.appointment.api.entity.WorkingShift;
import com.appointment.api.service.WorkingShiftService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.appointment.api.dto.WorkingShiftResponseDTO;
import java.util.List;
import java.util.stream.Collectors;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/working-shifts")
@RequiredArgsConstructor
public class WorkingShiftController {

    private final WorkingShiftService workingShiftService;

    @PostMapping("/{employeeId}")
    public ResponseEntity<WorkingShiftResponseDTO> defineShift(
            @PathVariable Long employeeId,
            @Valid @RequestBody WorkingShiftRequestDTO request) {

        WorkingShift definedShift = workingShiftService.defineWorkingShift(employeeId, request);
        return ResponseEntity.ok(mapToResponseDTO(definedShift));
    }

    @PostMapping("/{employeeId}/weekly")
    public ResponseEntity<List<WorkingShiftResponseDTO>> defineWeeklySchedule(
            @PathVariable Long employeeId,
            @Valid @RequestBody List<WorkingShiftRequestDTO> requests) {

        List<WorkingShift> weeklySchedule = workingShiftService.defineWeeklySchedule(employeeId, requests);
        List<WorkingShiftResponseDTO> response = weeklySchedule.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{employeeId}")
    public ResponseEntity<List<WorkingShiftResponseDTO>> getEmployeeSchedule(@PathVariable Long employeeId) {
        // Service katmanında "findByEmployee_UserId" metodunu kullandığımız
        // varsayılmıştır.
        List<WorkingShift> schedule = workingShiftService.getScheduleForEmployee(employeeId);
        List<WorkingShiftResponseDTO> response = schedule.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    private WorkingShiftResponseDTO mapToResponseDTO(WorkingShift shift) {
        WorkingShiftResponseDTO dto = new WorkingShiftResponseDTO();
        dto.setDayOfWeek(shift.getDayOfWeek());
        dto.setStartTime(shift.getStartTime());
        dto.setEndTime(shift.getEndTime());
        dto.setShiftName(shift.getShiftName());
        return dto;
    }
}