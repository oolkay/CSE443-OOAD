package com.appointment.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Data;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * BranchManager entity - manages employees, services and resources for a
 * company
 */
@Entity
@Table(name = "branch_managers")
@DiscriminatorValue("BRANCH_MANAGER")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class BranchManager extends User {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Company company;

    @Override
    public String getUserType() {
        return "BRANCH_MANAGER";
    }
}
