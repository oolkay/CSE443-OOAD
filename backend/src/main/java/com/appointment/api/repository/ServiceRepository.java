package com.appointment.api.repository;

import com.appointment.api.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Service entity
 * Provides database operations without writing SQL
 * Spring Data JPA generates implementation automatically
 */
@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {

    // Custom query methods - Spring Data JPA generates SQL automatically

    List<Service> findByNameContainingIgnoreCase(String name);

    boolean existsByName(String name);

    List<Service> findByCompany_CompanyId(Long companyId);

    List<Service> findByResources_ResourceId(Long resourceId);
}
