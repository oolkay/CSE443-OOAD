# API Specification for Password Reset

## Endpoints

### 1. Request Password Reset

**Endpoint:** `POST /api/auth/request-reset`

**Request:**

```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**

```json
{
  "message": "Reset instructions sent to your email",
  "success": true
}
```

**Error Response (400/404):**

```json
{
  "message": "User not found with this email",
  "success": false
}
```

---

### 2. Validate Reset Token

**Endpoint:** `GET /api/auth/validate-reset-token?token={token}`

**Parameters:**

- `token` (query param, required): The reset token from URL

**Success Response (200):**

```json
{
  "valid": true,
  "message": "Token is valid"
}
```

**Error Response (400/401):**

```json
{
  "valid": false,
  "message": "Token has expired or is invalid"
}
```

---

### 3. Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Request:**

```json
{
  "token": "abc123def456...",
  "email": "user@example.com",
  "newPassword": "NewSecurePassword123!"
}
```

**Success Response (200):**

```json
{
  "message": "Password has been successfully reset",
  "success": true
}
```

**Error Response (400/401):**

```json
{
  "message": "Invalid token or password reset failed",
  "success": false
}
```

---

## Database Schema

### Users Table

Add these columns to the existing `users` table:

```sql
ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN reset_token_expiry TIMESTAMP NULL;
```

### Entity Model

```java
@Column(name = "reset_token", length = 255, nullable = true)
private String resetToken;

@Column(name = "reset_token_expiry", nullable = true)
private LocalDateTime resetTokenExpiry;
```

---

## Email Template

When sending reset email, include:

**Subject:** Password Reset Request

**Body (HTML):**

```html
<p>Hello {{USER_NAME}},</p>

<p>
  We received a request to reset your password. Click the link below to set a
  new password:
</p>

<p>
  <a
    href="{{FRONTEND_URL}}/reset-password?token={{RESET_TOKEN}}&email={{USER_EMAIL}}"
  >
    Reset Your Password
  </a>
</p>

<p>This link will expire in 24 hours.</p>

<p>If you didn't request this reset, please ignore this email.</p>

<p>
  Best regards,<br />
  Appointment System Team
</p>
```

---

## Security Considerations

1. **Token Generation:**

   - Use `UUID.randomUUID().toString()` or similar
   - Never use sequential or predictable tokens
   - Length: 32+ characters (UUID is 36)

2. **Token Expiration:**

   - Set to 24 hours from generation
   - Clear token and expiry after successful password reset
   - Clear token if invalid reset attempt

3. **Rate Limiting:**

   - Limit to 3 reset requests per email per hour
   - Return generic message to avoid email enumeration

4. **Password Hashing:**

   - Use BCryptPasswordEncoder (already configured)
   - Never store plain text passwords

5. **HTTPS Only:**
   - Always send reset links via HTTPS
   - Ensure application runs on HTTPS in production

---

## Implementation Checklist

- [ ] Create `AuthController.java`
- [ ] Create `AuthService.java`
- [ ] Create DTOs: `EmailDTO`, `PasswordResetDTO`
- [ ] Create repository method to find user by email
- [ ] Add reset_token and reset_token_expiry columns to users table
- [ ] Configure email service (JavaMailSender)
- [ ] Create email template for reset link
- [ ] Add password validation rules
- [ ] Add rate limiting (consider using Spring's RateLimiter or similar)
- [ ] Write unit tests for reset logic
- [ ] Test the full flow end-to-end

---

## Frontend Implementation Status

✅ **RequestReset.js** - Fully implemented
✅ **EnterNewPassword.js** - Fully implemented
✅ **App.js routing** - Updated with new routes
✅ **Auth.css styling** - Added error/success messages
⏳ **Backend API** - Awaiting implementation

---

## Example curl Commands for Testing

```bash
# 1. Request reset
curl -X POST http://localhost:8080/api/auth/request-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'

# 2. Validate token
curl -X GET "http://localhost:8080/api/auth/validate-reset-token?token=abc123def456"

# 3. Reset password
curl -X POST http://localhost:8080/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123def456",
    "email": "user@example.com",
    "newPassword": "NewSecurePassword123!"
  }'
```
