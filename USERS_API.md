# Users Microservice

## Overview
Complete Users microservice with comprehensive endpoints for user management. All user identification uses `schoolId` (NOT the random UUID `id`).

## Authentication Levels
- 🔓 **Public**: No authentication required
- 🔐 **Authenticated**: Any logged-in user
- 👤 **Self or Admin**: User can access their own data, or admin can access any
- 🛡️ **Admin**: Admin or SuperAdmin role required
- 👑 **SuperAdmin**: SuperAdmin role only

## Endpoints

### 1. Get Current User Profile
**GET** `/api/users/me` 🔐

Returns the authenticated user's profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "schoolId": "12345",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "major": "Software Engineering",
    "yearOfStudy": 3,
    "role": "student",
    "isActive": true,
    "emailVerified": true,
    "profilePicture": "https://...",
    "bio": "CS student passionate about AI",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 2. Update Current User Profile
**PUT** `/api/users/me` 🔐

Updates the authenticated user's profile information.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Updated bio",
  "profilePicture": "https://example.com/pic.jpg",
  "yearOfStudy": 4,
  "major": "Software Engineering",
  "customMajor": "AI & Machine Learning"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": { /* updated user object */ }
}
```

---

### 3. Update Profile Picture
**PUT** `/api/users/me/profile-picture` 🔐

Updates only the profile picture.

**Request Body:**
```json
{
  "profilePicture": "https://example.com/new-pic.jpg"
}
```

---

### 4. Update Bio
**PUT** `/api/users/me/bio` 🔐

Updates only the bio (max 500 characters).

**Request Body:**
```json
{
  "bio": "New bio text here"
}
```

---

### 5. Search Users
**GET** `/api/users/search?q=john&limit=10` 🔐

Search users by name, email, or school ID.

**Query Parameters:**
- `q` (required): Search term
- `limit` (optional): Max results (default: 10)

**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "schoolId": "12345",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "profilePicture": "https://...",
      "major": "Software Engineering",
      "yearOfStudy": 3,
      "role": "student"
    }
  ],
  "count": 5
}
```

---

### 6. Get User by School ID
**GET** `/api/users/:schoolId` 👤

Get user profile by school ID (self or admin only).

**Example:** `GET /api/users/12345`

**Response:**
```json
{
  "user": { /* user object */ }
}
```

**Access Control:**
- Users can view their own profile
- Admins can view any profile

---

### 7. Get All Users (Admin)
**GET** `/api/users` 🛡️

Get paginated list of all users with filters.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Users per page (default: 10, max: 100)
- `role` (optional): Filter by role (student/admin/superadmin)
- `major` (optional): Filter by major
- `search` (optional): Search term

**Example:** `GET /api/users?page=1&limit=20&role=student&major=Software Engineering&search=john`

**Response:**
```json
{
  "users": [ /* array of users */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

### 8. Get User Statistics (Admin)
**GET** `/api/users/stats` 🛡️

Get comprehensive user statistics.

**Response:**
```json
{
  "stats": {
    "total": 500,
    "active": 480,
    "verified": 450,
    "byRole": [
      { "role": "student", "count": 450 },
      { "role": "admin", "count": 48 },
      { "role": "superadmin", "count": 2 }
    ],
    "byMajor": [
      { "major": "Software Engineering", "count": 200 },
      { "major": "Computer Science", "count": 150 },
      /* ... */
    ]
  }
}
```

---

### 9. Get Users by Role (Admin)
**GET** `/api/users/role/:role` 🛡️

Get all users with specific role.

**Example:** `GET /api/users/role/student`

**Valid Roles:** `student`, `admin`, `superadmin`

**Response:**
```json
{
  "users": [ /* array of users */ ],
  "count": 450
}
```

---

### 10. Get Users by Major
**GET** `/api/users/major/:major` 🔐

Get all users with specific major.

**Example:** `GET /api/users/major/Software%20Engineering`

**Response:**
```json
{
  "users": [ /* array of users */ ],
  "count": 200
}
```

---

### 11. Update User by School ID (Admin)
**PUT** `/api/users/:schoolId` 🛡️

Admin can update any user's profile.

**Example:** `PUT /api/users/12345`

**Request Body:**
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "yearOfStudy": 4,
  "isActive": true
}
```

---

### 12. Update User Role (Admin)
**PUT** `/api/users/:schoolId/role` 🛡️

Update a user's role.

**Request Body:**
```json
{
  "role": "admin"
}
```

**Permission Rules:**
- Only SuperAdmin can assign SuperAdmin role
- Admin can assign student or admin roles

---

### 13. Deactivate User
**PUT** `/api/users/:schoolId/deactivate` 👤

Deactivate a user account (self or admin).

**Access Control:**
- Users can deactivate their own account
- Admins can deactivate any account

**Response:**
```json
{
  "message": "User deactivated successfully",
  "user": { /* updated user */ }
}
```

---

### 14. Activate User (Admin)
**PUT** `/api/users/:schoolId/activate` 🛡️

Reactivate a deactivated user account.

**Response:**
```json
{
  "message": "User activated successfully",
  "user": { /* updated user */ }
}
```

---

### 15. Delete User (SuperAdmin)
**DELETE** `/api/users/:schoolId` 👑

Permanently delete a user account.

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

---

## Data Model

### User Object (Public View)
```typescript
{
  id: string;              // UUID (internal use)
  schoolId: string;        // Primary identifier (12345)
  isInternal: boolean;     // Internal/external student
  schoolName: string;      // School name
  email: string;
  firstName: string;
  lastName: string;
  major: string;           // Enum value
  customMajor?: string;    // If major is "Other"
  yearOfStudy: number;     // 1-7
  role: string;            // student/admin/superadmin
  isActive: boolean;
  profilePicture?: string;
  bio?: string;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Excluded from responses:**
- `passwordHash`
- `verificationToken` / `verificationTokenExpiry`
- `resetToken` / `resetTokenExpiry`
- `refreshToken` / `refreshTokenExpiry`

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Invalid or expired token - Access denied."
}
```

### 403 Forbidden
```json
{
  "error": "Access denied: You do not have the required permissions."
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 400 Bad Request
```json
{
  "error": "Invalid input",
  "details": [ /* validation errors */ ]
}
```

---

## Testing with curl

### Get Own Profile
```bash
curl -X GET http://localhost:8000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Profile
```bash
curl -X PUT http://localhost:8000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "bio": "Updated bio"
  }'
```

### Search Users
```bash
curl -X GET "http://localhost:8000/api/users/search?q=john&limit=5" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get All Users (Admin)
```bash
curl -X GET "http://localhost:8000/api/users?page=1&limit=10&role=student" \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

### Update User Role (Admin)
```bash
curl -X PUT http://localhost:8000/api/users/12345/role \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

---

## Integration with Frontend

### React/Next.js Example

```typescript
// Get current user
const getProfile = async () => {
  const response = await fetch('http://localhost:8000/api/users/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.json();
};

// Update profile
const updateProfile = async (updates) => {
  const response = await fetch('http://localhost:8000/api/users/me', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  return response.json();
};

// Search users
const searchUsers = async (query) => {
  const response = await fetch(
    `http://localhost:8000/api/users/search?q=${encodeURIComponent(query)}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  return response.json();
};
```

---

## Security Features

✅ **JWT Authentication** - All endpoints protected with JWT tokens
✅ **Role-based Access Control** - Different permissions for student/admin/superadmin
✅ **Self-access Control** - Users can only modify their own data (unless admin)
✅ **Sensitive Data Exclusion** - Passwords and tokens never exposed in responses
✅ **Input Validation** - All inputs validated with Zod schemas
✅ **SQL Injection Protection** - Using Drizzle ORM with parameterized queries

---

## Common Use Cases

### User Profile Page
1. `GET /api/users/me` - Load user profile
2. `PUT /api/users/me` - Update profile
3. `PUT /api/users/me/profile-picture` - Upload new picture

### Admin Dashboard
1. `GET /api/users/stats` - Show statistics
2. `GET /api/users` - List all users with filters
3. `PUT /api/users/:schoolId/role` - Promote users
4. `PUT /api/users/:schoolId/activate` - Activate accounts

### User Directory/Search
1. `GET /api/users/search?q=term` - Search users
2. `GET /api/users/major/:major` - Browse by major
3. `GET /api/users/:schoolId` - View specific profile

### Account Management
1. `PUT /api/users/:schoolId/deactivate` - Deactivate account
2. `PUT /api/users/:schoolId/activate` - Reactivate account (admin)
3. `DELETE /api/users/:schoolId` - Delete account (superadmin)
