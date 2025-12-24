package com.appointment.api.repository;

import com.appointment.api.entity.BranchManager;
import com.appointment.api.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BranchManagerRepository extends JpaRepository<BranchManager, Long> {
    Optional<BranchManager> findByEmail(String email);
    boolean existsByEmail(String email);
    List<BranchManager> findByCompany(Company company);
}
