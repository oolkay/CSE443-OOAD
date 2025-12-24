# Password Reset Flow Implementation

## Summary

Created a complete password reset flow with token validation for the appointment system.

---

## Files Created

### 1. **RequestReset.js** (`/frontend/src/pages/Auth/RequestReset.js`)

**Purpose:** Request password reset page - allows users to enter their email address

**Features:**

- Email input validation
- Loading state handling
- Success/error message display
- Auto-redirect after successful submission
- Fallback for development (no backend)

**API Endpoint Expected:** `POST /api/auth/request-reset`

- Request body: `{ email: string }`
- Response: Success message or error

---

### 2. **EnterNewPassword.js** (`/frontend/src/pages/Auth/EnterNewPassword.js`)

**Purpose:** Password reset confirmation page - handles token validation and password reset

**Features:**

- **Token Validation:** Validates reset token from URL query parameter (`?token=xxx`)
- **Email Parameter:** Supports optional `?email=xxx` parameter (for reference)
- Loading state while validating token
- Three states:
  1. **Validating:** Shows loading message
  2. **Invalid Token:** Shows error and option to request new reset link
  3. **Valid Token:** Shows password reset form

**Password Requirements:**

- Minimum 8 characters
- Confirmation password must match
- Real-time validation

**API Endpoints Expected:**

- `GET /api/auth/validate-reset-token?token={token}`
  - Response: HTTP 200 if valid, 400+ if invalid
- `POST /api/auth/reset-password`
  - Request body: `{ token: string, email: string, newPassword: string }`
  - Response: Success message or error

---

## Route Configuration Updated

In `App.js`, added two new routes:

```javascript
<Route path="/reset" element={<RequestReset />} />
<Route path="/reset-password" element={<EnterNewPassword />} />
```

### Flow:

1. User clicks "forgot password" on Login page
2. Routed to `/reset` (RequestReset page)
3. User enters email and submits
4. Backend sends reset link via email (e.g., `yourapp.com/reset-password?token=ABC123&email=user@example.com`)
5. User clicks link in email
6. Routed to `/reset-password` with token in URL
7. Token is validated on component mount
8. User enters new password
9. Password is reset and user is redirected to login

---

## CSS Updates

Added new styles in `Auth.css`:

```css
.auth-error-message {
  background-color: #ffebee;
  border: 1px solid #ef5350;
  color: #c62828;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 12px;
  text-align: center;
}

.auth-success-message {
  background-color: #e8f5e9;
  border: 1px solid #66bb6a;
  color: #2e7d32;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 12px;
  text-align: center;
}

.auth-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

---

## Backend Implementation Requirements

### Entities to Update:

1. **User.java** - Add field for password reset token:

   ```java
   @Column(length = 255, nullable = true)
   private String resetToken;

   @Column(nullable = true)
   private LocalDateTime resetTokenExpiry;
   ```

### Controllers Needed:

Create `AuthController.java` with endpoints:

```java
@PostMapping("/request-reset")
public ResponseEntity<?> requestPasswordReset(@RequestBody EmailDTO email)

@GetMapping("/validate-reset-token")
public ResponseEntity<?> validateToken(@RequestParam String token)

@PostMapping("/reset-password")
public ResponseEntity<?> resetPassword(@RequestBody PasswordResetDTO dto)
```

### Services Needed:

Create `AuthService.java` with methods:

- `requestPasswordReset(String email)` - Generate token, save to DB, send email
- `validateResetToken(String token)` - Check if token exists and not expired
- `resetPassword(String token, String email, String newPassword)` - Update password, clear token

### Email Configuration:

- Requires email configuration in `application.properties`
- Email template should include reset link: `{FRONTEND_URL}/reset-password?token={TOKEN}&email={EMAIL}`

---

## Testing Instructions

### Manual Test Flow:

1. **Test RequestReset Page:**

   - Navigate to `http://localhost:3000/reset`
   - Verify page displays email input
   - Submit email
   - Should see success message (or error if backend not implemented)

2. **Test EnterNewPassword Page:**

   - Navigate directly to `http://localhost:3000/reset-password?token=test123&email=user@example.com`
   - Should validate token (will succeed in fallback mode)
   - Enter new password
   - Submit form
   - Should see success message and redirect to login

3. **Invalid Token Test:**
   - Navigate to `http://localhost:3000/reset-password?token=invalid`
   - Should show "Invalid Reset Link" message
   - Should show option to request new reset link

---

## Notes

- Both components have TODO comments for backend integration
- Development fallback enabled (logs to console instead of making API calls)
- Remove fallback code once backend is implemented
- Token should have expiration time (recommend 24 hours)
- Use UUID or similar for token generation (avoid sequential/guessable tokens)
- Consider implementing rate limiting on reset requests
