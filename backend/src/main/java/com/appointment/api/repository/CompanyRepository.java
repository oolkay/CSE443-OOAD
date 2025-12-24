package com.appointment.api.repository;

import com.appointment.api.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Company entity operations
 */
@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByEmail(String email);
    boolean existsByEmail(String email);
}
