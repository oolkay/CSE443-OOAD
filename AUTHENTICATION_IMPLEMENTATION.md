# JWT Authentication & RBAC Implementation Summary

## Overview

This document outlines the complete implementation of JWT Authentication with Role-Based Access Control (RBAC) for the Appointment Management System, including customer registration and password reset functionality.

## Backend Implementation

### 1. JWT Token Provider (`JwtTokenProvider.java`)

- Generates JWT tokens from user authentication
- Validates JWT tokens
- Extracts username and roles from tokens
- Uses HS512 algorithm for signing
- Token expiration configured in `application.properties`

### 2. JWT Authentication Filter (`JwtAuthenticationFilter.java`)

- Intercepts HTTP requests
- Extracts JWT token from `Authorization` header (Bearer format)
- Validates and parses tokens
- Sets authentication in SecurityContext
- Supports role-based authorization

### 3. Security Configuration (`SecurityConfig.java`)

- Implements JWT-based stateless authentication
- Configures RBAC with four roles:
  - `ROLE_SUPER_ADMIN`: Full system access
  - `ROLE_MANAGER`: Manager operations access
  - `ROLE_EMPLOYEE`: Employee operations access
  - `ROLE_CUSTOMER`: Customer operations access
- Public endpoints: `/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password`, `/api/auth/validate-reset-token`, `/api/auth/reset-password`
- CSRF disabled for API
- Session management: STATELESS

### 4. Custom User Details Service (`CustomUserDetailsService.java`)

- Loads user details from database by email
- Implements Spring Security's `UserDetailsService`
- Used by authentication manager for credential validation

### 5. Authentication Service (`AuthService.java`)

Handles three main operations:

#### Login (FR-SYS-004)

- Authenticates user with email and password
- Returns JWT token + user information
- Token expires based on `jwt.expiration` setting

#### Customer Registration (FR-SYS-005)

- Validates email uniqueness
- Encrypts password using BCryptPasswordEncoder
- Creates new Customer entity
- Returns JWT token for auto-login
- Validates:
  - Email format and uniqueness
  - Password minimum 8 characters
  - Required fields

#### Password Reset (FR-SYS-006)

**Flow:**

1. User requests reset via `forgot-password` endpoint
2. System generates unique reset token
3. Token stored in `password_reset_tokens` table
4. Token valid for 1 hour
5. User receives reset link via email (TODO: Email service)
6. User validates token with `validate-reset-token` endpoint
7. User submits new password to `reset-password` endpoint
8. System validates token, email match, and updates password
9. Token marked as used to prevent reuse

### 6. DTOs (Data Transfer Objects)

- `LoginRequest`: Email, password
- `LoginResponse`: Token, user info, expiration
- `RegisterRequest`: Name, email, password, phone
- `ForgotPasswordRequest`: Email
- `ResetPasswordRequest`: Token, email, new password
- `ApiResponse`: Generic response wrapper

### 7. Authentication Controller (`AuthController.java`)

**Endpoints:**

| Endpoint                         | Method | Purpose                | Auth Required |
| -------------------------------- | ------ | ---------------------- | ------------- |
| `/api/auth/login`                | POST   | User login             | No            |
| `/api/auth/register`             | POST   | Customer registration  | No            |
| `/api/auth/forgot-password`      | POST   | Request password reset | No            |
| `/api/auth/validate-reset-token` | GET    | Validate reset token   | No            |
| `/api/auth/reset-password`       | POST   | Reset password         | No            |

### 8. Entities

- `PasswordResetToken`: Stores temporary reset tokens
  - Token: Unique UUID
  - Email: Associated user email
  - ExpiryDate: Token expiration
  - Used: Flag to prevent reuse
  - CreatedAt: Timestamp

### 9. Configuration (`application.properties`)

```properties
jwt.secret=jwt_secret_key
jwt.expiration=86400000  # 24 hours in milliseconds
```

## Frontend Implementation

### 1. Auth Service (`authService.js`)

Centralized service for all authentication API calls:

- `loginUser(email, password)`: Login endpoint
- `registerUser(name, email, password, phoneNumber)`: Register endpoint
- `requestPasswordReset(email)`: Forgot password endpoint
- `validateResetToken(token)`: Validate reset token
- `resetPassword(token, email, newPassword)`: Reset password endpoint
- `logoutUser()`: Clear tokens and user info
- `getCurrentUser()`: Get stored user info
- `isAuthenticated()`: Check if user has valid token

### 2. Token Management

- Stores JWT token in `localStorage` under key `authToken`
- Stores user info in `localStorage` under key `user`
- Includes token in all API requests via `Authorization: Bearer {token}` header
- Clears tokens on logout

### 3. Updated Components

#### Login.js

- Integrated with backend login API
- Error handling and display
- Loading state during authentication
- Automatic redirect on successful login

#### Register.js

- Integrated with backend registration API
- Email uniqueness validation at backend
- Password confirmation validation
- Phone number optional field
- Auto-login on successful registration
- Proper error messages

#### RequestReset.js

- Integrated with backend forgot password API
- Email validation
- Success message with redirect to login
- Error handling

#### EnterNewPassword.js

- Token validation on component mount
- Token expiration handling
- Reset password with backend API
- Password strength validation (8+ chars)
- Confirmation validation
- Success redirect to login

### 4. Styling

Added error and success message styling in `Auth.css`:

- `.auth-error`: Red error messages
- `.auth-success-message`: Green success messages
- `.auth-error-message`: Red error messages

## Security Features

1. **JWT Tokens**

   - Signed with HS512
   - Contains username and roles
   - Includes expiration

2. **Password Security**

   - Bcrypt encryption
   - Minimum 8 characters required
   - Server-side validation

3. **Email Uniqueness**

   - Prevents duplicate registrations
   - Validated at registration

4. **Token Management**

   - Unique tokens per reset request
   - Expiration after 1 hour
   - One-time use (marked as used)

5. **RBAC**
   - Four distinct roles
   - Method-level security with `@PreAuthorize`
   - Endpoint-level authorization

## API Flow Diagrams

### Login Flow

```
1. User submits email + password
2. Frontend calls POST /api/auth/login
3. Backend authenticates with Spring Security
4. Returns JWT token + user info
5. Frontend stores token in localStorage
6. Include token in future API requests
```

### Registration Flow

```
1. User fills registration form
2. Frontend validates inputs
3. Frontend calls POST /api/auth/register
4. Backend checks email uniqueness
5. Backend encrypts password with Bcrypt
6. Backend creates Customer entity
7. Returns JWT token for auto-login
8. Frontend stores token and redirects
```

### Password Reset Flow

```
1. User requests reset: POST /api/auth/forgot-password
2. Backend generates UUID token
3. Token stored with 1-hour expiration
4. (TODO) Email sent to user with reset link
5. User opens reset link with token
6. Frontend validates token: GET /api/auth/validate-reset-token?token={token}
7. User enters new password and submits
8. Frontend calls POST /api/auth/reset-password
9. Backend validates token, updates password
10. Token marked as used
11. User redirected to login
```

## Configuration Steps

### Backend

1. Ensure JWT dependencies in `pom.xml` (already added)
2. Configure `jwt.secret` in `application.properties` (use strong key in production)
3. Configure `jwt.expiration` (default: 24 hours)
4. Deploy backend services

### Frontend

1. Set `REACT_APP_API_URL` environment variable (default: http://localhost:8080/api)
2. Import authService in components
3. Call appropriate functions for auth flows

## Error Handling

### HTTP Status Codes

- `200 OK`: Successful login
- `201 CREATED`: Successful registration
- `400 BAD_REQUEST`: Invalid request or validation failure
- `401 UNAUTHORIZED`: Invalid credentials
- `404 NOT_FOUND`: User not found
- `500 SERVER_ERROR`: Server error

### Error Messages

All error responses include descriptive messages:

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

## TODO Items

1. Implement email service for password reset links
2. Add JWT refresh token mechanism
3. Implement 2FA (Two-Factor Authentication)
4. Add rate limiting for login/registration
5. Implement session management for multiple devices
6. Add audit logging for auth events
7. Implement password complexity requirements
8. Add CORS configuration for production

## Testing

### Manual Testing

1. Register new user: POST /api/auth/register
2. Login with credentials: POST /api/auth/login
3. Test RBAC by accessing role-specific endpoints
4. Request password reset: POST /api/auth/forgot-password
5. Validate token: GET /api/auth/validate-reset-token
6. Reset password: POST /api/auth/reset-password

### Using Postman

1. Create collection with auth endpoints
2. Test without token (should work)
3. Test with invalid token (should fail)
4. Test with valid token (should work)
5. Verify RBAC restrictions

## Production Deployment

1. **Generate strong JWT secret**

   ```bash
   # Generate 256-bit key
   openssl rand -base64 32
   ```

2. **Use environment variables**

   - `JWT_SECRET`: Strong random key
   - `JWT_EXPIRATION`: Token lifetime in ms

3. **Enable HTTPS**

   - All API calls must use HTTPS
   - Tokens should be transmitted securely

4. **CORS Configuration**

   - Whitelist frontend domain
   - Restrict allowed origins

5. **Email Service**

   - Configure SMTP for password reset emails
   - Use professional email templates

6. **Database**
   - Use production database (PostgreSQL)
   - Ensure proper backups
   - Configure password encryption key management
