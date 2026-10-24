# Security Hardening Implementation

This document describes the security improvements implemented in the backend.

## Features Implemented

### 1. Helmet Security Headers
- **Purpose**: Protects against common web vulnerabilities
- **Headers Added**:
  - Content-Security-Policy: Prevents XSS attacks
  - Strict-Transport-Security (HSTS): Enforces HTTPS
  - X-Frame-Options: Prevents clickjacking
  - X-Content-Type-Options: Prevents MIME sniffing
  - Referrer-Policy: Controls referrer information sharing

### 2. Rate Limiting
- **General API Rate Limit**: 100 requests/minute per IP
- **Auth Rate Limit**: 5 login/register attempts per 15 minutes
- **Strict Auth Rate Limit**: 3 attempts per hour (for critical endpoints)
- **Purpose**: Prevents brute-force attacks and DoS attacks

### 3. Input Validation & Sanitization
- **Email**: Validated as RFC 5322 email, normalized
- **Password**: 
  - Minimum 8 characters
  - Must contain: uppercase, lowercase, number, special character
- **Company Name**: Max 100 characters
- **Purpose**: Prevents injection attacks and enforces data integrity

### 4. Logging & Monitoring
- **Request Logging**: All requests logged with method, path, IP, status, duration
- **Security Events**: 401, 403, 429 responses logged with SECURITY level
- **Error Logging**: 5xx errors logged with full stack trace
- **Purpose**: Audit trail for security investigations

### 5. Error Handling
- **Global Error Handler**: Catches all async errors and returns consistent JSON
- **404 Handler**: Returns proper error for undefined routes
- **Environment Validation**: Fails fast on startup if required vars missing
- **Graceful Shutdown**: SIGTERM handling for clean server shutdown

### 6. Session Management (in conjunction with auth)
- **HttpOnly Cookies**: Tokens cannot be accessed via JavaScript (XSS mitigation)
- **Secure Flag**: Cookies only sent over HTTPS in production
- **SameSite**: Prevents CSRF attacks (lax in dev, none in production)
- **Refresh Token Rotation**: Old refresh token invalidated on use

## Testing Security

### Test Rate Limiting
```bash
# Try to log in 6 times in rapid succession
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"Test1234!"}' \
    -i
done
# 6th request should return 429 Too Many Requests
```

### Test Input Validation
```bash
# Test weak password
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"companyName":"Test","email":"test@test.com","password":"weak"}' \
  -i
# Should return 400 with validation error

# Test invalid email
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"companyName":"Test","email":"not-an-email","password":"Test1234!"}' \
  -i
# Should return 400 with email validation error
```

### Test Security Headers
```bash
curl -i http://localhost:5000/api/v1/auth/me
# Look for headers:
# - Content-Security-Policy
# - Strict-Transport-Security
# - X-Frame-Options
# - X-Content-Type-Options
```

### Test Logging
```bash
# Check server logs for:
# - [REQUEST] logs for all endpoints
# - [SECURITY] logs for 401/403/429 responses
# - [ERROR] logs for 5xx responses
```

## Password Requirements
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (@$!%*?&)

**Example valid passwords**: `MyPassword123!`, `SecurePass@2024`, `Admin$ecure99`

## Environment Variables
See `.env.example` for all required and optional variables.

**Critical variables**:
- `ACCESS_TOKEN_SECRET`: Should be 32+ character random string
- `REFRESH_TOKEN_SECRET`: Should be 32+ character random string
- `CORS_ORIGIN`: Should match frontend URL exactly in production

## Recommended Production Setup
1. Enable HTTPS on your server
2. Set `NODE_ENV=production`
3. Use strong, unique values for JWT secrets
4. Enable HSTS header (1 year): `max-age: 31536000`
5. Use database SSL connection (MongoDB connection string should include SSL)
6. Monitor logs for security events
7. Consider using a WAF (Web Application Firewall)
8. Implement CORS strictly to your frontend domain only

## Future Enhancements
- [ ] CSRF token implementation (currently using SameSite protection)
- [ ] Request signing for critical operations
- [ ] IP whitelisting for admin endpoints
- [ ] Device fingerprinting for multi-factor authentication
- [ ] OAuth2 integration (Google, GitHub)
- [ ] Email verification on signup
- [ ] Two-factor authentication (2FA)
- [ ] Password reset with email verification
