# Refresh Token Implementation

## Overview
This project now implements secure refresh token functionality using HTTP-only cookies for better security against XSS attacks.

## Features Implemented

### 1. Database Schema
- Added `refreshToken` (varchar 255) and `refreshTokenExpiry` (timestamp) columns to the `users` table
- Migration file: `Src/drizzle/migrations/0004_tense_storm.sql`

### 2. Token Generation
- **Access Token (JWT)**: Short-lived (1 hour), contains user info
- **Refresh Token**: Cryptographically secure random string (96 chars hex), long-lived (7 days)

### 3. Security Features
- **HTTP-only cookies**: Refresh tokens stored in HTTP-only cookies (not accessible via JavaScript)
- **Secure flag**: Enabled in production (HTTPS only)
- **SameSite strict**: Protects against CSRF attacks
- **Token rotation**: New refresh token issued on each refresh
- **Automatic revocation**: Old refresh token revoked when expired or on logout

## API Endpoints

### 1. Login
**POST** `/api/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "userId": "12345",
  "email": "user@example.com",
  "fullName": "John Doe",
  "userRole": "student",
  "profileUrl": "https://..."
}
```

**Sets Cookie:** `refreshToken` (HTTP-only, 7 days expiry)

---

### 2. Refresh Access Token
**POST** `/api/auth/refresh`

**Request:** No body needed (reads from cookie)

**Response:**
```json
{
  "token": "eyJhbGc..."
}
```

**Updates Cookie:** New rotated `refreshToken`

---

### 3. Logout
**POST** `/api/auth/logout`

**Request:** No body needed

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

**Clears Cookie:** `refreshToken` removed

## Setup Instructions

### 1. Install Dependencies
```bash
pnpm install cookie-parser
pnpm add -D @types/cookie-parser
```

### 2. Apply Database Migration
```bash
# Generate migration (already done)
pnpm run gen

# Apply migration to database
pnpm run push
```

### 3. Environment Variables
Add to your `.env` file:
```env
JWT_SECRET=your-secret-key-here
NODE_ENV=development  # or 'production'
FRONTEND_URL=http://localhost:3000
```

### 4. CORS Configuration
The app is configured to allow credentials (cookies) from your frontend:
- Development: `http://localhost:3000`
- Production: Set via `FRONTEND_URL` environment variable

### 5. Frontend Integration

#### Login Request
```javascript
fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important: enables cookies
  body: JSON.stringify({ email, password })
})
```

#### Refresh Token Request
```javascript
fetch('http://localhost:8000/api/auth/refresh', {
  method: 'POST',
  credentials: 'include' // Sends refresh token cookie
})
```

#### Logout Request
```javascript
fetch('http://localhost:8000/api/auth/logout', {
  method: 'POST',
  credentials: 'include'
})
```

## Token Flow

1. **User logs in** → Server returns access token (JSON) + sets refresh token (HTTP-only cookie)
2. **Frontend stores access token** → In memory or localStorage
3. **Frontend makes API requests** → Sends access token in `Authorization: Bearer <token>` header
4. **Access token expires** → Frontend detects 401 error
5. **Frontend calls refresh endpoint** → Cookie sent automatically
6. **Server validates refresh token** → Issues new access token + rotates refresh token
7. **Frontend retries request** → With new access token

## Security Best Practices

### ✅ Implemented
- HTTP-only cookies (prevents XSS access)
- Secure flag in production (HTTPS only)
- SameSite strict (CSRF protection)
- Token rotation on refresh
- Automatic expiry handling
- Refresh token revocation on logout

### 🔐 Production Recommendations
1. **Use HTTPS**: Always use HTTPS in production
2. **Secure JWT_SECRET**: Use a strong, random secret (32+ characters)
3. **Rate limiting**: Add rate limiting to auth endpoints
4. **Monitor suspicious activity**: Log failed refresh attempts
5. **Short access token lifetime**: Keep access tokens short-lived (1 hour or less)
6. **Regular token cleanup**: Periodically clean expired tokens from database

## Troubleshooting

### Cookie not being set
- Check CORS configuration allows credentials
- Ensure frontend sends `credentials: 'include'`
- Verify `FRONTEND_URL` matches your frontend origin

### "Invalid refresh token" errors
- Token may have expired (7 days)
- User may have logged out
- Database may have been reset

### CORS errors
- Update `FRONTEND_URL` in `.env`
- Ensure frontend origin matches CORS configuration
- Check that `credentials: true` is set in CORS options

## Testing

### Manual Testing with curl

1. **Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  -c cookies.txt
```

2. **Refresh:**
```bash
curl -X POST http://localhost:8000/api/auth/refresh \
  -b cookies.txt \
  -c cookies.txt
```

3. **Logout:**
```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -b cookies.txt
```

## Architecture Decisions

### Why HTTP-only cookies for refresh tokens?
- **XSS Protection**: JavaScript cannot access HTTP-only cookies
- **Automatic sending**: Browser automatically includes cookies in requests
- **Secure storage**: More secure than localStorage for sensitive tokens

### Why rotate refresh tokens?
- **Limits exposure**: If token is compromised, it has limited lifetime
- **Detects reuse**: Can detect if stolen token is reused
- **Better security**: Industry best practice

### Why separate access and refresh tokens?
- **Performance**: Don't need to check database for every request
- **Revocation**: Can revoke refresh tokens without invalidating all sessions
- **Flexibility**: Different expiry times for different purposes
