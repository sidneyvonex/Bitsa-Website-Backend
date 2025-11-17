# Quick Start - Refresh Token Implementation

## Installation Commands

Run these commands in your terminal:

```bash
# 1. Install cookie-parser dependencies
pnpm install cookie-parser @types/cookie-parser

# 2. Apply the database migration
pnpm run push

# 3. Build the TypeScript code
pnpm run build

# 4. Start the development server
pnpm run dev
```

## Environment Variables

Make sure your `.env` file includes:

```env
JWT_SECRET=your-very-secure-secret-key-here
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL=your-database-url
```

## Testing the Implementation

### 1. Login (get refresh token cookie)
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt -v
```

### 2. Refresh access token
```bash
curl -X POST http://localhost:8000/api/auth/refresh \
  -b cookies.txt -c cookies.txt -v
```

### 3. Logout (clear cookie)
```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -b cookies.txt -v
```

## Frontend Integration Example

```javascript
// Login
const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important!
  body: JSON.stringify({ email, password })
});
const { token } = await loginResponse.json();
// Store token in memory or state

// Use token for authenticated requests
const dataResponse = await fetch('http://localhost:8000/api/some-endpoint', {
  headers: { 'Authorization': `Bearer ${token}` },
  credentials: 'include'
});

// Refresh when token expires (on 401 error)
const refreshResponse = await fetch('http://localhost:8000/api/auth/refresh', {
  method: 'POST',
  credentials: 'include' // Sends cookie automatically
});
const { token: newToken } = await refreshResponse.json();

// Logout
await fetch('http://localhost:8000/api/auth/logout', {
  method: 'POST',
  credentials: 'include'
});
```

## What Changed

### Files Modified
- ✅ `Src/drizzle/schema.ts` - Added refresh token columns
- ✅ `Src/Auth/auth.service.ts` - Added refresh token services
- ✅ `Src/Auth/auth.controller.ts` - Updated login, added refresh & logout
- ✅ `Src/Auth/auth.routes.ts` - Added refresh & logout routes
- ✅ `Src/app.ts` - Added cookie-parser middleware & CORS credentials

### Files Created
- ✅ `Src/drizzle/migrations/0004_tense_storm.sql` - DB migration
- ✅ `REFRESH_TOKEN_SETUP.md` - Complete documentation
- ✅ `setup-refresh-tokens.sh` - Automated setup script

## Key Features

✅ HTTP-only cookies (XSS protection)
✅ Secure flag in production (HTTPS only)
✅ SameSite strict (CSRF protection)
✅ Token rotation on refresh
✅ Automatic revocation on logout
✅ 7-day refresh token expiry
✅ 1-hour access token expiry

## Need Help?

See `REFRESH_TOKEN_SETUP.md` for:
- Detailed architecture explanation
- Security best practices
- Troubleshooting guide
- Production deployment checklist
