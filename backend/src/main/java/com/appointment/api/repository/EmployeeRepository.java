package com.appointment.api.repository;

import com.appointment.api.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    boolean existsByEmail(String email);

    List<Employee> findByCompany_CompanyId(Long companyId);

    List<Employee> findByManager_UserId(Long managerId);
}