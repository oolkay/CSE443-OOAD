package com.appointment.api.service;

import com.appointment.api.dto.WorkingShiftRequestDTO;
import com.appointment.api.entity.Employee;
import com.appointment.api.entity.WorkingShift;
import com.appointment.api.repository.EmployeeRepository;
import com.appointment.api.repository.WorkingShiftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkingShiftService {

    private final WorkingShiftRepository workingShiftRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional
    public WorkingShift defineWorkingShift(Long employeeId, WorkingShiftRequestDTO request) {
        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time.");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + employeeId));

        WorkingShift workingShift = workingShiftRepository
                .findByEmployeeAndDayOfWeek(employee, request.getDayOfWeek().toUpperCase())
                .orElse(new WorkingShift());

        workingShift.setEmployee(employee);
        workingShift.setDayOfWeek(request.getDayOfWeek().toUpperCase());
        workingShift.setStartTime(request.getStartTime());
        workingShift.setEndTime(request.getEndTime());
        
        workingShift.setShiftName(request.getShiftName() != null ? request.getShiftName() : "Standard Shift");

        return workingShiftRepository.save(workingShift);
    }

    @Transactional
    public List<WorkingShift> defineWeeklySchedule(Long employeeId, List<WorkingShiftRequestDTO> requests) {
        return requests.stream()
                .map(req -> defineWorkingShift(employeeId, req))
                .collect(Collectors.toList());
    }
    
    public List<WorkingShift> getScheduleForEmployee(Long employeeId) {
        return workingShiftRepository.findByUserId(employeeId);
    }
}