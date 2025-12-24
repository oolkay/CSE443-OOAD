package com.appointment.api.service;

import com.appointment.api.dto.*;
import com.appointment.api.entity.Customer;
import com.appointment.api.entity.PasswordResetToken;
import com.appointment.api.repository.CustomerRepository;
import com.appointment.api.repository.PasswordResetTokenRepository;
import com.appointment.api.util.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Authentication Service
 * Handles login, registration, and password reset functionality
 */
@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;

    /**
     * Login user with email and password
     * Returns JWT token and user information
     */
    public LoginResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        String token = jwtTokenProvider.generateToken(authentication);
        String roles = jwtTokenProvider.getRolesFromToken(token);

        Optional<Customer> customer = customerRepository.findByEmail(loginRequest.getEmail());
        if (customer.isPresent()) {
            Customer c = customer.get();
            return new LoginResponse(
                    token,
                    c.getUserId(),
                    c.getEmail(),
                    c.getName(),
                    roles,
                    jwtExpirationMs / 1000  // Convert to seconds
            );
        }

        throw new RuntimeException("User not found");
    }

    /**
     * Register new customer
     */
    public LoginResponse register(RegisterRequest registerRequest) {
        // Check if email already exists
        if (customerRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        // Create new customer
        Customer customer = new Customer();
        customer.setName(registerRequest.getName());
        customer.setEmail(registerRequest.getEmail());
        customer.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        customer.setPhoneNumber(registerRequest.getPhoneNumber());

        Customer savedCustomer = customerRepository.save(customer);

        // Generate token for newly registered user
        String roles = "ROLE_CUSTOMER";
        String token = jwtTokenProvider.generateTokenFromUsername(savedCustomer.getEmail(), roles);

        return new LoginResponse(
                token,
                savedCustomer.getUserId(),
                savedCustomer.getEmail(),
                savedCustomer.getName(),
                roles,
                jwtExpirationMs / 1000
        );
    }

}
