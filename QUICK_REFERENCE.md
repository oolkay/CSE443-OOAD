# Quick Reference - Authentication Integration

## What Was Implemented

### Backend ✅

- [x] JWT Token Provider & Validator
- [x] JWT Authentication Filter
- [x] Security Configuration with RBAC
- [x] Login API (`POST /api/auth/login`)
- [x] Customer Registration API (`POST /api/auth/register`)
- [x] Password Reset APIs:
  - `POST /api/auth/forgot-password` - Request reset
  - `GET /api/auth/validate-reset-token` - Validate token
  - `POST /api/auth/reset-password` - Set new password
- [x] Password Reset Token Entity & Repository
- [x] Authentication Service with business logic

### Frontend ✅

- [x] Auth Service (centralized API calls)
- [x] Login integration
- [x] Registration integration
- [x] Password reset request integration
- [x] Password reset form integration
- [x] JWT token storage in localStorage
- [x] Error handling and messages

## Supported Roles (RBAC)

```
ROLE_CUSTOMER    - Customer operations
ROLE_EMPLOYEE    - Employee operations
ROLE_MANAGER     - Manager operations
ROLE_SUPER_ADMIN - Full system access
```

## API Endpoints

| Method | Endpoint                               | Purpose        | Auth |
| ------ | -------------------------------------- | -------------- | ---- |
| POST   | /api/auth/login                        | Login          | No   |
| POST   | /api/auth/register                     | Register       | No   |
| POST   | /api/auth/forgot-password              | Request reset  | No   |
| GET    | /api/auth/validate-reset-token?token=X | Check token    | No   |
| POST   | /api/auth/reset-password               | Reset password | No   |

## How to Use

### Backend Changes

1. Ensure `application.properties` has JWT config:

   ```properties
   jwt.secret=your_secret_key
   jwt.expiration=86400000
   ```

2. Create `Customer` entity if not exists:
   - Should extend `User` base class
   - Implements `getUserType()` returning "CUSTOMER"

### Frontend Integration

```javascript
import authService from "../../services/authService";

// Login
const result = await authService.loginUser(email, password);
if (result.success) {
  const user = authService.getCurrentUser();
  // redirect to dashboard
}

// Register
const result = await authService.registerUser(name, email, password, phone);

// Password Reset
const result = await authService.requestPasswordReset(email);

// Validate Token
const result = await authService.validateResetToken(token);

// Reset Password
const result = await authService.resetPassword(token, email, newPassword);

// Check if authenticated
if (authService.isAuthenticated()) {
  // User has valid token
}
```

## Token Format

```
Header: Authorization
Value: Bearer <jwt_token>
```

## Response Examples

### Login Success

```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "userId": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "ROLE_CUSTOMER",
  "expiresIn": 86400
}
```

### Login Failure

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Registration Success

```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "userId": 2,
  "email": "newuser@example.com",
  "name": "Jane Doe",
  "role": "ROLE_CUSTOMER",
  "expiresIn": 86400
}
```

## Security Notes

1. **JWT Secret**: Change `jwt.secret` in production to a strong random key
2. **Token Expiration**: Default is 24 hours. Adjust `jwt.expiration` as needed
3. **HTTPS**: Use HTTPS in production
4. **Password Storage**: Passwords encrypted with Bcrypt
5. **Email Validation**: Unique email per registration
6. **Password Reset Tokens**: Valid for 1 hour, one-time use

## Testing Guide

### Test Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Test Registration

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phoneNumber": "+905001234567"
  }'
```

### Test with Token

```bash
curl -X GET http://localhost:8080/api/customer/profile \
  -H "Authorization: Bearer <token>"
```

## Files Created/Modified

### Backend Files Created

- `JwtTokenProvider.java` - Token generation and validation
- `JwtAuthenticationFilter.java` - HTTP request filter
- `CustomUserDetailsService.java` - User details loading
- `AuthService.java` - Business logic
- `AuthController.java` - REST endpoints
- `PasswordResetToken.java` - Entity for reset tokens
- `PasswordResetTokenRepository.java` - Database repository
- DTOs: `LoginRequest.java`, `LoginResponse.java`, `RegisterRequest.java`, `ForgotPasswordRequest.java`, `ResetPasswordRequest.java`, `ApiResponse.java`

### Backend Files Modified

- `SecurityConfig.java` - Updated with JWT and RBAC

### Frontend Files Created

- `authService.js` - Centralized auth API service

### Frontend Files Modified

- `Login.js` - Integrated backend login
- `Register.js` - Integrated backend registration
- `RequestReset.js` - Integrated forgot password
- `EnterNewPassword.js` - Integrated password reset
- `Auth.css` - Added error/success message styles

## Environment Variables

### Frontend (.env)

```
REACT_APP_API_URL=http://localhost:8080/api
```

### Backend (application.properties)

```properties
jwt.secret=your-secret-key-here
jwt.expiration=86400000
cors.allowed.origins=http://localhost:3000
```

## Next Steps

1. **Email Service**: Implement email notifications for password reset
2. **Refresh Tokens**: Add refresh token mechanism for longer sessions
3. **Rate Limiting**: Add rate limiting to prevent brute force attacks
4. **Audit Logging**: Log all authentication events
5. **2FA**: Implement two-factor authentication
6. **Remember Me**: Add "remember me" functionality

## Troubleshooting

### "Invalid JWT token"

- Check that token is sent with `Authorization: Bearer <token>`
- Verify token hasn't expired
- Ensure jwt.secret matches on backend

### "User not found"

- Verify email exists in database
- Check customer registration worked

### "Email already registered"

- User already has account
- Direct to login page

### CORS errors

- Check `cors.allowed.origins` in application.properties
- Verify frontend URL matches

## References

- JWT Documentation: https://jwt.io
- Spring Security: https://spring.io/projects/spring-security
- JJWT Library: https://github.com/jwtk/jjwt
