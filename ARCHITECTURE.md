# Authentication Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Login.js   │  │Register.js   │  │EnterPassword │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│              ┌─────────────▼──────────────┐                 │
│              │   authService.js           │                 │
│              │ (Centralized API calls)    │                 │
│              └──────────┬──────────────────┘                │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │ HTTP/HTTPS
                          │ Authorization: Bearer <token>
        ┌─────────────────▼──────────────────┐
        │  API Gateway / CORS                │
        └─────────────────┬──────────────────┘
                          │
┌─────────────────────────┼────────────────────────────────────┐
│  BACKEND (Spring Boot)  │                                    │
│  ┌─────────────────────▼──────────────────┐                 │
│  │    AuthController                      │                 │
│  │  GET/POST /api/auth/*                  │                 │
│  └──────────────────┬─────────────────────┘                 │
│                     │                                        │
│  ┌──────────────────▼─────────────────────┐                 │
│  │ JwtAuthenticationFilter                │                 │
│  │ (Validate token on each request)       │                 │
│  └──────────────────┬─────────────────────┘                 │
│                     │                                        │
│  ┌──────────────────▼─────────────────────┐                 │
│  │ SecurityContext (Spring Security)      │                 │
│  │ (Sets user authentication & roles)     │                 │
│  └──────────────────┬─────────────────────┘                 │
│                     │                                        │
│  ┌──────────────────▼─────────────────────┐                 │
│  │ AuthService                            │                 │
│  │ - login()                              │                 │
│  │ - register()                           │                 │
│  │ - generatePasswordResetToken()         │                 │
│  │ - validatePasswordResetToken()         │                 │
│  │ - resetPassword()                      │                 │
│  └──────────────────┬─────────────────────┘                 │
│                     │                                        │
│  ┌──────────────────▼─────────────────────┐                 │
│  │ CustomUserDetailsService               │                 │
│  │ (Load user from database)              │                 │
│  └──────────────────┬─────────────────────┘                 │
│                     │                                        │
│  ┌──────────────────▼─────────────────────┐                 │
│  │ PasswordEncoder (BCrypt)               │                 │
│  │ (Encrypt & verify passwords)           │                 │
│  └──────────────────┬─────────────────────┘                 │
│                     │                                        │
│  ┌──────────────────▼─────────────────────┐                 │
│  │ JwtTokenProvider                       │                 │
│  │ - generateToken()                      │                 │
│  │ - validateToken()                      │                 │
│  │ - getUsernameFromToken()               │                 │
│  │ - getRolesFromToken()                  │                 │
│  └──────────────────┬─────────────────────┘                 │
│                     │                                        │
└─────────────────────┼────────────────────────────────────────┘
                      │
        ┌─────────────▼──────────────┐
        │  DATABASE                  │
        │  ┌────────────────────┐    │
        │  │ users (Customer)   │    │
        │  │ - userId           │    │
        │  │ - email            │    │
        │  │ - password (hash)  │    │
        │  │ - name             │    │
        │  └────────────────────┘    │
        │  ┌────────────────────┐    │
        │  │ password_reset_    │    │
        │  │ tokens             │    │
        │  │ - token            │    │
        │  │ - email            │    │
        │  │ - expiryDate       │    │
        │  │ - used             │    │
        │  └────────────────────┘    │
        └────────────────────────────┘
```

## Request/Response Flow

### 1. Login Flow

```
Client                          Backend
   │                              │
   ├─ POST /api/auth/login ──────►│
   │  { email, password }         │
   │                              │
   │                         ┌────▼─────┐
   │                         │Authenticate
   │                         │(Spring    │
   │                         │Security)  │
   │                         └────┬──────┘
   │                              │
   │                         ┌────▼──────────┐
   │                         │Generate JWT   │
   │                         │Token          │
   │                         └────┬──────────┘
   │                              │
   │◄────────────────────────────┤
   │  200 OK                      │
   │  {                           │
   │    token: "eyJ...",          │
   │    userId: 1,                │
   │    email: "user@x.com",      │
   │    role: "ROLE_CUSTOMER"     │
   │  }                           │
   │                              │
   ├─ Store token in localStorage │
   └──► Access protected routes   │
        with: Bearer {token}      │
```

### 2. Registration Flow

```
Client                          Backend
   │                              │
   ├─ POST /api/auth/register ───►│
   │  {name, email, password}     │
   │                              │
   │                         ┌────▼─────────┐
   │                         │Check email   │
   │                         │uniqueness    │
   │                         └────┬─────────┘
   │                              │
   │                         ┌────▼──────────┐
   │                         │Encrypt         │
   │                         │password with   │
   │                         │Bcrypt         │
   │                         └────┬──────────┘
   │                              │
   │                         ┌────▼──────────┐
   │                         │Create Customer│
   │                         │entity in DB   │
   │                         └────┬──────────┘
   │                              │
   │                         ┌────▼──────────┐
   │                         │Generate JWT   │
   │                         │Token          │
   │                         └────┬──────────┘
   │                              │
   │◄────────────────────────────┤
   │  201 CREATED                 │
   │  {                           │
   │    token: "eyJ...",          │
   │    userId: 2,                │
   │    email: "new@x.com",       │
   │    role: "ROLE_CUSTOMER"     │
   │  }                           │
   │                              │
   ├─ Store token & redirect      │
   └──► Auto-logged in           │
```

### 3. Password Reset Flow

```
Client                          Backend
   │                              │
   ├─ POST /api/auth/forgot-password
   │  { email }                   │
   │                              │
   │                         ┌────▼──────────┐
   │                         │Find customer  │
   │                         │by email       │
   │                         └────┬──────────┘
   │                              │
   │                         ┌────▼──────────┐
   │                         │Generate UUID  │
   │                         │token          │
   │                         └────┬──────────┘
   │                              │
   │                         ┌────▼──────────┐
   │                         │Save token with│
   │                         │1-hour expiry  │
   │                         └────┬──────────┘
   │                              │
   │                         ┌────▼──────────┐
   │                         │(TODO) Send    │
   │                         │email with link│
   │                         └────┬──────────┘
   │                              │
   │◄────────────────────────────┤
   │  200 OK                      │
   │  { message: "Email sent" }   │
   │                              │
   ├─ User clicks email link      │
   │  /reset-password?            │
   │  token=XXX&email=YYY         │
   │                              │
   ├─ GET /api/auth/validate-reset-token
   │  ?token=XXX                  │
   │                              │
   │                         ┌────▼──────────┐
   │                         │Find token     │
   │                         │Check valid    │
   │                         │& not expired  │
   │                         └────┬──────────┘
   │                              │
   │◄────────────────────────────┤
   │  200 OK                      │
   │  { message: "Token valid" }  │
   │                              │
   ├─ User enters new password    │
   ├─ POST /api/auth/reset-password
   │  { token, email, newPassword}│
   │                              │
   │                         ┌────▼──────────┐
   │                         │Validate token │
   │                         │& email match  │
   │                         └────┬──────────┘
   │                              │
   │                         ┌────▼──────────┐
   │                         │Encrypt new    │
   │                         │password       │
   │                         └────┬──────────┘
   │                              │
   │                         ┌────▼──────────┐
   │                         │Update user    │
   │                         │password       │
   │                         └────┬──────────┘
   │                              │
   │                         ┌────▼──────────┐
   │                         │Mark token as  │
   │                         │used           │
   │                         └────┬──────────┘
   │                              │
   │◄────────────────────────────┤
   │  200 OK                      │
   │  { message: "Password reset"}│
   │                              │
   └─► Redirect to login         │
```

## JWT Token Structure

```
JWT Token Format: header.payload.signature

Header:
{
  "alg": "HS512",
  "typ": "JWT"
}

Payload:
{
  "sub": "user@example.com",
  "roles": "ROLE_CUSTOMER",
  "iat": 1702776000,
  "exp": 1702862400
}

Signature:
HmacSHA512(
  base64(header) + "." + base64(payload),
  secret_key
)

Complete Token:
eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZXMiOiJST0xFX0NVU1RPTUVSIiwiaWF0IjoxNzAyNzc2MDAwLCJleHAiOjE3MDI4NjI0MDB9.
signature...
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                   Layer 1: Transport                         │
│                   (HTTPS/TLS in production)                  │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Layer 2: Authentication                    │
│              (JWT validation, signature check)               │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Layer 3: Authorization                     │
│              (RBAC roles and permissions)                    │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Layer 4: Data Encryption                   │
│              (Bcrypt password hashing)                       │
└─────────────────────────────────────────────────────────────┘
```

## Role-Based Access Control (RBAC)

```
┌────────────────────────────────────────────────────────────┐
│                    ROLES HIERARCHY                          │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ROLE_SUPER_ADMIN                                          │
│  ├─ /api/admin/*                (Full access)             │
│  ├─ /api/manager/*              (Manager operations)       │
│  ├─ /api/employee/*             (Employee operations)      │
│  └─ /api/customer/*             (Customer operations)      │
│                                                             │
│  ROLE_MANAGER                                              │
│  ├─ /api/manager/*              (Manager operations)       │
│  ├─ /api/employee/*             (Employee operations)      │
│  └─ /api/customer/*             (Customer operations)      │
│                                                             │
│  ROLE_EMPLOYEE                                              │
│  ├─ /api/employee/*             (Employee operations)      │
│  └─ /api/customer/*             (Customer operations)      │
│                                                             │
│  ROLE_CUSTOMER                                              │
│  └─ /api/customer/*             (Own operations only)      │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

## Token Lifecycle

```
┌──────────────┐
│  Token       │
│  Generated   │
└──────┬───────┘
       │ Stored in localStorage
       ▼
┌──────────────────┐
│  Token Valid     │ (< 24 hours)
│  & Usable        │
└──────┬───────────┘
       │ Include in Authorization header
       ▼
┌──────────────────────┐
│  Verified by         │ (JWT signature & expiry check)
│  JwtAuthFilter       │
└──────┬───────────────┘
       │ Success
       ▼
┌──────────────────────┐
│  SecurityContext     │ (User authenticated with roles)
│  Set with User Info  │
└──────┬───────────────┘
       │ If expired
       ▼
┌──────────────────┐
│  Token Expired   │ (> 24 hours)
│  & Removed       │
└──────┬───────────┘
       │ Removed from localStorage
       ▼
┌──────────────────┐
│  User Must       │
│  Login Again     │
└──────────────────┘
```

## Component Dependencies

```
Spring Security Framework
├── AuthenticationManager
├── PasswordEncoder (BCrypt)
├── UserDetailsService
└── SecurityFilterChain

JWT Library (JJWT)
├── Jwts (Token builder)
├── JwtParser
└── Claims (Token contents)

Custom Components
├── JwtTokenProvider
├── JwtAuthenticationFilter
├── CustomUserDetailsService
├── AuthService
└── AuthController

Database Entities
├── User (Base class)
├── Customer (Extends User)
└── PasswordResetToken
```

## Error Handling Flow

```
┌─────────────────────┐
│  Invalid Token      │
│  Malformed JWT      │
│  Expired Token      │
│  Invalid Signature  │
└────────┬────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  JwtAuthenticationFilter catches it │
│  Logs error                         │
│  Does NOT set authentication        │
└────────┬────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  Request continues without auth    │
│  @PreAuthorize fails               │
│  Endpoint returns 403 Forbidden    │
└────────────────────────────────────┘
```

## Performance Considerations

1. **Token Validation**: O(1) - Crypto operation
2. **Database Lookup**: O(1) for indexed email field
3. **Password Hashing**: Takes ~100ms (intentional, for security)
4. **Token Generation**: < 1ms
5. **Stateless**: No session storage needed

## Scalability

- **Horizontal Scaling**: Tokens are stateless, no need for session replication
- **Database**: Can scale independently
- **API Gateway**: Add load balancer before backend
- **Email Service**: Can use async/background jobs
- **Token Validation**: CPU-bound, can benefit from caching
