package com.appointment.api.service;

import com.appointment.api.dto.*;
import com.appointment.api.entity.*;
import com.appointment.api.repository.CustomerRepository;
import com.appointment.api.repository.UserRepository;
import com.appointment.api.repository.PasswordResetTokenRepository;
import com.appointment.api.util.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Authentication Service
 * Handles login, registration, and password reset functionality
 */
@Service
@Slf4j
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private UserRepository userRepository;

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
     * Supports all user types: Customer, SuperAdmin, BranchManager, Employee
     */
    public LoginResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()));

        // Find user first to get userId (supports all user types)
        Optional<User> userOpt = userRepository.findByEmail(loginRequest.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // Generate token with userId claim
            String token = jwtTokenProvider.generateToken(authentication, user.getUserId());
            String roles = jwtTokenProvider.getRolesFromToken(token);

            // Check if user is BranchManager or Employee and extract company info
            Long companyId = null;

            if (user instanceof BranchManager) {
                BranchManager manager = (BranchManager) user;
                if (manager.getCompany() != null) {
                    companyId = manager.getCompany().getCompanyId();
                }
            } else if (user instanceof Employee) {
                Employee employee = (Employee) user;
                if (employee.getCompany() != null) {
                    companyId = employee.getCompany().getCompanyId();
                }
            }

            return new LoginResponse(
                token,
                user.getUserId(),
                user.getEmail(),
                user.getName(),
                roles,
                jwtExpirationMs / 1000, // Convert to seconds
                companyId
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
        String token = jwtTokenProvider.generateTokenFromUsername(
                savedCustomer.getEmail(),
                savedCustomer.getUserId(),
                roles);

        return new LoginResponse(
                token,
                savedCustomer.getUserId(),
                savedCustomer.getEmail(),
                savedCustomer.getName(),
                roles,
                jwtExpirationMs / 1000);
    }

}
