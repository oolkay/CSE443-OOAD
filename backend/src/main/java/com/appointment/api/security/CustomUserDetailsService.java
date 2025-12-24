package com.appointment.api.security;

import com.appointment.api.repository.UserRepository;
import com.appointment.api.entity.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * Custom User Details Service
 * Loads user details from database for authentication
 * Supports all user types: Customer, SuperAdmin, BranchManager, Employee
 */
@Service
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        com.appointment.api.entity.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Determine role based on user type
        String role = determineRole(user);
        log.info("Loading user: {} with role: {}", email, role);

        // Return user details with appropriate role
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority(role))
        );
    }

    /**
     * Determine role based on user entity type
     */
    private String determineRole(com.appointment.api.entity.User user) {
        if (user instanceof SuperAdmin) {
            return "ROLE_SUPER_ADMIN";
        } else if (user instanceof BranchManager) {
            return "ROLE_MANAGER";
        } else if (user instanceof Employee) {
            return "ROLE_EMPLOYEE";
        } else if (user instanceof Customer) {
            return "ROLE_CUSTOMER";
        }
        throw new IllegalStateException("Unknown user type: " + user.getClass().getSimpleName());
    }

    /**
     * Load user by email (custom method)
     */
    public UserDetails loadUserByEmail(String email) throws UsernameNotFoundException {
        return loadUserByUsername(email);
    }
}
