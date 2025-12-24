package com.appointment.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * BranchManager entity - manages employees, services and resources for a
 * company
 */
@Entity
@Table(name = "branch_managers")
@DiscriminatorValue("BRANCH_MANAGER")
@Data
@EqualsAndHashCode(callSuper = true, exclude = { "company" })
@ToString(callSuper = true, exclude = { "company" })
@NoArgsConstructor
public class BranchManager extends User {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Override
    public String getUserType() {
        return "BRANCH_MANAGER";
    }
}
