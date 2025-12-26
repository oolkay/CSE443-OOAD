package com.appointment.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Data;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Employee entity - performs appointments and has working shifts
 */
@Entity
@Table(name = "employees")
@DiscriminatorValue("EMPLOYEE")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class Employee extends User {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private BranchManager manager;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Company company;

    // Employee can perform multiple services
    @ManyToMany
    @JoinTable(name = "employee_services", joinColumns = @JoinColumn(name = "employee_id"), inverseJoinColumns = @JoinColumn(name = "service_id"))
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Service> services = new ArrayList<>();

    @Override
    public String getUserType() {
        return "EMPLOYEE";
    }
}
