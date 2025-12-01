package com.appointment.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * SuperAdmin entity - highest level admin user
 * Manages companies and branch managers
 */
@Entity
@Table(name = "super_admins")
@DiscriminatorValue("SUPER_ADMIN")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class SuperAdmin extends User {

    @Override
    public String getUserType() {
        return "SUPER_ADMIN";
    }
}
