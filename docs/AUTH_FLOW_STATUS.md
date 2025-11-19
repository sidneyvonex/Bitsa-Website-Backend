# Backend Authentication Flow - Status & Implementation Guide

## 📋 Current Status Summary

Based on my analysis of your backend code, here's what's **ALREADY IMPLEMENTED** and what **NEEDS TO BE ADDED**:

---

## ✅ What's Already Implemented

### 1. **User Registration** ✅
- **Endpoint:** `POST /api/auth/register`
- **Features:**
  - Creates new user account
  - Hashes password with bcrypt
  - Sends welcome email
  - Stores user in database
  - Audit logging

### 2. **Email Verification System** ✅
- **Endpoints:**
  - `POST /api/auth/send-verification` - Send/resend verification email
  - `POST /api/auth/verify-email` - Verify email with token
  - `POST /api/auth/verify-email/resend` - Resend verification (duplicate)

- **Features:**
  - Generates secure verification token
  - Stores token with expiry in database
  - Sends verification email with link
  - Verifies token and updates `emailVerified` status
  - Sends confirmation email after verification

### 3. **Interest Selection System** ✅
- **Endpoints:**
  - `GET /api/interests/my` - Get user's interests
  - `GET /api/interests/my/check` - Check if user has interests
  - `POST /api/interests/my` - Add interests to user
  - `DELETE /api/interests/my/:interestId` - Remove interest
  - `PUT /api/interests/my/replace` - Replace all interests

- **Features:**
  - Check if user has selected interests (`hasInterests`)
  - Fetch all available interests
  - Add/remove/replace user interests
  - Returns `needsToSelectInterests` flag

### 4. **Authentication & JWT** ✅
- **Endpoints:**
  - `POST /api/auth/login` - User login
  - `POST /api/auth/refresh` - Refresh access token

- **Features:**
  - JWT token generation
  - Refresh token with HTTP-only cookies
  - Token expiry management
  - Audit logging for logins

---

## ❌ What's Missing - CRITICAL

### **Email Verification Enforcement in Login** ❌

**Problem:** The `loginUser` function does NOT check if email is verified before allowing login!

**Current Code** (lines 86-141 in `auth.controller.ts`):
```typescript
export const loginUser = async (req: Request, res: Response) => {
    // ... validation ...
    
    const existingUser = await getUserByEmailService(req.body.email);
    if (!existingUser) {
        res.status(404).json({ error: "User not found" });
        return;
    }

    const isMatch = bcrypt.compareSync(req.body.password, existingUser.passwordHash)
    if (!isMatch) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
    }

    // ❌ NO EMAIL VERIFICATION CHECK HERE!
    
    const payload = { ... };
    const token = jwt.sign(payload, secret);
    
    res.status(200).json({ token, ... });
}
```

**What's Needed:**
Add email verification check BEFORE generating JWT token:

```typescript
// After password check, add this:
if (!existingUser.emailVerified) {
    res.status(403).json({ 
        error: "Email not verified",
        message: "Please verify your email before logging in",
        needsVerification: true,
        email: existingUser.email
    });
    return;
}
```

---

## 🔧 Required Backend Changes

### **1. Enforce Email Verification in Login**

**File:** `Src/Auth/auth.controller.ts`
**Function:** `loginUser`
**Line:** After line 97 (password validation)

**Add this code:**

```typescript
// Check if email is verified
if (!existingUser.emailVerified) {
    res.status(403).json({ 
        error: "Email not verified",
        message: "Please verify your email before logging in. Check your inbox for the verification link.",
        needsVerification: true,
        email: existingUser.email,
        schoolId: existingUser.schoolId
    });
    return;
}
```

### **2. Include `emailVerified` and `hasInterests` in Login Response (Optional)**

**File:** `Src/Auth/auth.controller.ts`
**Function:** `loginUser`
**Line:** Response at line 135

**Current:**
```typescript
res.status(200).json({ 
    token, 
    userId: existingUser.schoolId, 
    email: existingUser.email, 
    fullName: `${existingUser.firstName} ${existingUser.lastName}`, 
    userRole: existingUser.role, 
    profileUrl: existingUser.profilePicture 
});
```

**Enhanced (Optional but helpful for frontend):**
```typescript
res.status(200).json({ 
    token, 
    userId: existingUser.schoolId, 
    email: existingUser.email, 
    fullName: `${existingUser.firstName} ${existingUser.lastName}`, 
    userRole: existingUser.role, 
    profileUrl: existingUser.profilePicture,
    emailVerified: existingUser.emailVerified,  // Add this
    // Note: hasInterests check requires separate query, so frontend should call /api/interests/my/check after login
});
```

---

## 📊 Complete Flow After Implementation

### **New User Registration & Login Flow:**

```
1. User registers
   POST /api/auth/register
   ↓
   Response: "User created, check email for verification"
   Email sent with verification link

2. User tries to login (email not verified)
   POST /api/auth/login
   ↓
   ❌ Response 403: "Email not verified"
   {
     "error": "Email not verified",
     "message": "Please verify your email...",
     "needsVerification": true,
     "email": "user@example.com"
   }

3. User clicks "Resend Verification Email"
   POST /api/auth/send-verification
   Body: { "email": "user@example.com" }
   ↓
   Response: "Verification email sent"

4. User clicks verification link in email
   POST /api/auth/verify-email?token=xxx
   ↓
   Response: "Email verified successfully"
   emailVerified = true in database

5. User logs in again
   POST /api/auth/login
   ↓
   ✅ Response 200: { token, userId, ... }

6. Frontend checks if user has interests
   GET /api/interests/my/check
   Headers: { Authorization: "Bearer <token>" }
   ↓
   Response: { hasInterests: false, needsToSelectInterests: true }

7. Frontend shows interest selection modal
   GET /api/interests/admin/all (to fetch interests)
   ↓
   User selects interests
   ↓
   POST /api/interests/my
   Body: { interestIds: ["id1", "id2", "id3"] }
   ↓
   Response: "Interests added successfully"

8. User can now access dashboard fully
```

---

## 🎯 API Endpoints Summary

### Authentication
| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/auth/register` | POST | Register new user | ❌ |
| `/api/auth/login` | POST | Login user | ❌ |
| `/api/auth/refresh` | POST | Refresh token | ❌ (uses cookie) |
| `/api/auth/send-verification` | POST | Send verification email | ❌ |
| `/api/auth/verify-email` | POST | Verify email with token | ❌ |

### Interests (User)
| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/interests/my` | GET | Get user's interests | ✅ Bearer |
| `/api/interests/my/check` | GET | Check if has interests | ✅ Bearer |
| `/api/interests/my` | POST | Add interests | ✅ Bearer |
| `/api/interests/my/:id` | DELETE | Remove interest | ✅ Bearer |
| `/api/interests/my/replace` | PUT | Replace all interests | ✅ Bearer |

### Interests (Public/Admin)
| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/interests/admin/all` | GET | Get all interests | ✅ Admin |

---

## 🧪 Testing the Flow

### **Step 1: Register New User**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "Test123!",
    "schoolId": "SCT123456",
    "major": "Computer Science",
    "yearOfStudy": 2
  }'
```

### **Step 2: Try Login (Should Fail)**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Expected: 403 Forbidden
# { "error": "Email not verified", "needsVerification": true }
```

### **Step 3: Resend Verification**
```bash
curl -X POST http://localhost:3000/api/auth/send-verification \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com"
  }'
```

### **Step 4: Verify Email (Get token from email)**
```bash
curl -X POST http://localhost:3000/api/auth/verify-email?token=YOUR_TOKEN_HERE
```

### **Step 5: Login Again (Should Succeed)**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Expected: 200 OK
# { "token": "jwt_token_here", "userId": "SCT123456", ... }
```

### **Step 6: Check Interests**
```bash
curl -X GET http://localhost:3000/api/interests/my/check \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# Expected: { "hasInterests": false, "needsToSelectInterests": true }
```

### **Step 7: Get Available Interests**
```bash
curl -X GET http://localhost:3000/api/interests/admin/all \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### **Step 8: Add Interests**
```bash
curl -X POST http://localhost:3000/api/interests/my \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "interestIds": ["interest-id-1", "interest-id-2"]
  }'
```

---

## 📝 Implementation Checklist

### Backend Changes Needed:
- [ ] Add email verification check in `loginUser` function
- [ ] Return appropriate error response (403) with `needsVerification` flag
- [ ] Test login flow with unverified email
- [ ] Test login flow with verified email
- [ ] Verify interest check endpoint works
- [ ] Verify interest selection endpoint works

### Frontend Integration (Assumed working based on your context):
- [x] SignInPage catches 403 error for unverified email
- [x] Shows "Resend Verification Email" button
- [x] StudentDashboard calls `/api/interests/my/check`
- [x] InterestSelectionModal opens if `needsToSelectInterests: true`
- [x] Modal fetches interests from backend
- [x] Modal saves interests via API

---

## 🚨 Critical Issue

**The backend does NOT currently block unverified users from logging in!**

You must add the email verification check to the login endpoint. This is a **security and UX requirement** to ensure:
1. Users verify their email addresses
2. Email addresses are valid
3. Users complete the onboarding flow

---

## 💡 Recommendations

### 1. **Email Verification on Registration (Alternative Approach)**
Consider adding automatic verification email sending during registration:

```typescript
// In createUser function, after user creation
const verificationToken = generateSecureToken();
const verificationTokenExpiry = new Date(Date.now() + 24 * 3600 * 1000);
await storeEmailVerificationTokenService(newUser.schoolId, verificationToken, verificationTokenExpiry);

const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
await sendAccountVerificationEmail({
    recipientEmail: email,
    recipientName: `${firstName} ${lastName}`,
    verificationUrl
});
```

### 2. **Onboarding Status Field**
Add an `onboardingComplete` field to track if user has:
- ✅ Verified email
- ✅ Selected interests
- ✅ Completed profile

### 3. **Middleware for Protected Routes**
Create middleware to check onboarding status:

```typescript
export const requireOnboarding = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
    }
    
    const fullUser = await getUserByIdService(user.userId);
    if (!fullUser?.emailVerified) {
        return res.status(403).json({ 
            error: "Email not verified",
            requiresAction: "EMAIL_VERIFICATION"
        });
    }
    
    // Optional: Check interests too
    const interests = await getUserInterestsBySchoolIdService(user.userId);
    if (interests.length === 0) {
        return res.status(403).json({ 
            error: "Profile incomplete",
            requiresAction: "INTEREST_SELECTION"
        });
    }
    
    next();
};
```

---

## 📞 Next Steps

1. **Implement the email verification check in login** (CRITICAL)
2. Test the complete flow end-to-end
3. Update frontend error handling if needed
4. Consider adding onboarding status tracking
5. Document the complete flow for your team

---

**Status:** ⚠️ Backend Missing Critical Email Verification Check
**Priority:** 🔴 HIGH - Security & UX Issue
**Estimated Time:** 15 minutes to implement and test
