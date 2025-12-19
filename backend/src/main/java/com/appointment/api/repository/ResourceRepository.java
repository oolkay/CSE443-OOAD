package com.appointment.api.repository;

import com.appointment.api.entity.Resource;
import com.appointment.api.entity.ResourceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Resource entity operations
 */
@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    /**
     * Find all resources by company
     */
    List<Resource> findByCompanyCompanyId(Long companyId);

    /**
     * Find all resources by company and status
     */
    List<Resource> findByCompanyCompanyIdAndStatus(Long companyId, ResourceStatus status);

    /**
     * Find resource by company and resource ID
     */
    Optional<Resource> findByCompanyCompanyIdAndResourceId(Long companyId, Long resourceId);

    /**
     * Find all available resources by company
     */
    @Query("SELECT r FROM Resource r WHERE r.company.companyId = :companyId AND r.status = :status")
    List<Resource> findAvailableResourcesByCompany(@Param("companyId") Long companyId, @Param("status") ResourceStatus status);

    /**
     * Count resources by company and status
     */
    long countByCompanyCompanyIdAndStatus(Long companyId, ResourceStatus status);

    /**
     * Search resources by name or description within a company
     */
    @Query("SELECT r FROM Resource r WHERE r.company.companyId = :companyId AND " +
           "(LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(r.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Resource> searchResourcesByCompany(@Param("companyId") Long companyId, @Param("keyword") String keyword);

    /**
     * Search resources by name or description within a company with status filter
     */
    @Query("SELECT r FROM Resource r WHERE r.company.companyId = :companyId AND " +
           "(LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(r.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:status IS NULL OR r.status = :status)")
    List<Resource> searchResourcesByCompanyWithStatus(
            @Param("companyId") Long companyId,
            @Param("keyword") String keyword,
            @Param("status") ResourceStatus status
    );

    /**
     * Check if resource name exists within a company
     */
    boolean existsByCompanyCompanyIdAndNameIgnoreCase(Long companyId, String name);

    /**
     * Check if resource name exists within a company (excluding specific resource)
     */
    @Query("SELECT COUNT(r) > 0 FROM Resource r WHERE r.company.companyId = :companyId AND " +
           "LOWER(r.name) = LOWER(:name) AND r.resourceId != :resourceId")
    boolean existsByNameInCompanyExcludingResource(
            @Param("companyId") Long companyId,
            @Param("name") String name,
            @Param("resourceId") Long resourceId
    );

    /**
     * Find resources by company and containing a specific type
     */
    @Query("SELECT r FROM Resource r WHERE r.company.companyId = :companyId AND " +
           "r.types IS NOT NULL AND " +
           "(r.types LIKE CONCAT(:type, ',%') OR " +
           "r.types LIKE CONCAT('%,', :type, ',%') OR " +
           "r.types LIKE CONCAT('%,', :type) OR " +
           "r.types = :type)")
    List<Resource> findByCompanyCompanyIdAndTypesContaining(@Param("companyId") Long companyId, @Param("type") String type);

    /**
     * Get all unique resource types for a company
     * Simple approach: get all resources and extract types in service layer
     */
    @Query("SELECT r FROM Resource r WHERE r.company.companyId = :companyId AND r.types IS NOT NULL")
    List<Resource> findResourcesWithTypesByCompany(@Param("companyId") Long companyId);
}