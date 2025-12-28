package com.appointment.api.repository;

import com.appointment.api.entity.Appointment;
import com.appointment.api.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByCustomer_UserId(Long customerId);

    List<Appointment> findByEmployee_UserId(Long employeeId);

    List<Appointment> findByService_ServiceId(Long serviceId);

    List<Appointment> findByStatus(AppointmentStatus status);

    List<Appointment> findByEmployee_UserIdAndStartTimeBetween(Long employeeId, LocalDateTime start, LocalDateTime end);

    boolean existsByEmployee_UserId(Long employeeId);

    List<Appointment> findByResources_ResourceId(Long resourceId);

    boolean existsByResources_ResourceId(Long resourceId);

    boolean existsByService_ServiceId(Long serviceId);
}
