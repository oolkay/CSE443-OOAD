package com.appointment.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

/**
 * Employee entity - performs appointments and has working shifts
 */
@Entity
@Table(name = "employees")
@DiscriminatorValue("EMPLOYEE")
@Data
@EqualsAndHashCode(callSuper = true, exclude = { "manager", "company", "services" })
@ToString(callSuper = true, exclude = { "manager", "company", "services" })
@NoArgsConstructor
public class Employee extends User {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private BranchManager manager;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToMany
    @JoinTable(name = "employee_services", joinColumns = @JoinColumn(name = "employee_id"), inverseJoinColumns = @JoinColumn(name = "service_id"))
    private List<Service> services = new ArrayList<>();

    @Override
    public String getUserType() {
        return "EMPLOYEE";
    }
}
