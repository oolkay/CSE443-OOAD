package com.appointment.api.repository;

import com.appointment.api.entity.WorkingShift;
import com.appointment.api.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface WorkingShiftRepository extends JpaRepository<WorkingShift, Long> {
    Optional<WorkingShift> findByEmployeeAndDayOfWeek(Employee employee, String dayOfWeek);
    List<WorkingShift> findByUserId(Long employeeId);
}