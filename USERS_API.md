# Users API Reference

## Overview

The Users API provides endpoints for user management, profile operations, and authentication-related functions.

**Base URL**: `/api/users`

---

## Authentication

All user endpoints require JWT Bearer token authentication unless specified otherwise.

```bash
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

### 1. Get Current User Profile

Get the profile of the currently authenticated user.

**Endpoint**: `GET /api/users/me`

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "schoolId": "SCT211-0001/2021",
    "email": "student@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "major": "Software Engineering",
    "yearOfStudy": 3,
    "role": "student",
    "preferredLanguage": "en",
    "profilePicture": "https://...",
    "isActive": true,
    "emailVerified": true,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

**Example**:
```bash
curl -X GET http://localhost:3000/api/users/me \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

---

### 2. Update User Profile

Update the current user's profile information.

**Endpoint**: `PUT /api/users/me`

**Authentication**: Required

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "major": "Software Engineering",
  "yearOfStudy": 3,
  "profilePicture": "https://example.com/photo.jpg",
  "bio": "Passionate about AI and Web Development"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "major": "Software Engineering",
    "yearOfStudy": 3,
    "profilePicture": "https://example.com/photo.jpg",
    "updatedAt": "2024-11-17T14:30:00Z"
  }
}
```

**Example**:
```bash
curl -X PUT http://localhost:3000/api/users/me \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "yearOfStudy": 4
  }'
```

---

### 3. Update Language Preference

Change the user's preferred language for content display.

**Endpoint**: `PUT /api/users/me/language`

**Authentication**: Required

**Request Body**:
```json
{
  "language": "sw"
}
```

**Supported Languages**:
- `en` - English
- `sw` - Kiswahili (Swahili)
- `fr` - Français (French)
- `id` - Bahasa Indonesia
- `de` - Deutsch (German)
- `es` - Español (Spanish)
- `it` - Italiano (Italian)
- `pt` - Português (Portuguese)
- `ja` - 日本語 (Japanese)

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Language preference updated successfully",
    "language": "sw"
  }
}
```

**Example**:
```bash
curl -X PUT http://localhost:3000/api/users/me/language \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"language": "fr"}'
```

---

### 4. Get All Users (Admin)

Retrieve a list of all registered users.

**Endpoint**: `GET /api/users/all`

**Authentication**: Required (Admin or SuperAdmin only)

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `role` (optional): Filter by role (`student`, `admin`, `superadmin`)
- `search` (optional): Search by name or email

**Response**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "schoolId": "SCT211-0001/2021",
        "email": "student@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "major": "Software Engineering",
        "yearOfStudy": 3,
        "role": "student",
        "isActive": true,
        "emailVerified": true,
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

**Example**:
```bash
# Get all users
curl -X GET http://localhost:3000/api/users/all \
  -H 'Authorization: Bearer ADMIN_TOKEN'

# Filter by role
curl -X GET "http://localhost:3000/api/users/all?role=student&page=1&limit=10" \
  -H 'Authorization: Bearer ADMIN_TOKEN'

# Search users
curl -X GET "http://localhost:3000/api/users/all?search=john" \
  -H 'Authorization: Bearer ADMIN_TOKEN'
```

---

### 5. Get User by ID (Admin)

Get detailed information about a specific user.

**Endpoint**: `GET /api/users/:id`

**Authentication**: Required (Admin or SuperAdmin only)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "schoolId": "SCT211-0001/2021",
    "email": "student@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "major": "Software Engineering",
    "yearOfStudy": 3,
    "role": "student",
    "preferredLanguage": "en",
    "profilePicture": "https://...",
    "isActive": true,
    "emailVerified": true,
    "createdAt": "2024-01-15T10:00:00Z",
    "interests": [
      {
        "id": "uuid",
        "name": "Machine Learning"
      },
      {
        "id": "uuid",
        "name": "Web Development"
      }
    ],
    "projects": [
      {
        "id": "uuid",
        "title": "Smart Campus App",
        "status": "in-progress"
      }
    ]
  }
}
```

**Example**:
```bash
curl -X GET http://localhost:3000/api/users/USER_ID \
  -H 'Authorization: Bearer ADMIN_TOKEN'
```

---

### 6. Update User Status (Admin)

Activate or deactivate a user account.

**Endpoint**: `PUT /api/users/:id/status`

**Authentication**: Required (Admin or SuperAdmin only)

**Request Body**:
```json
{
  "isActive": false
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "User status updated successfully",
    "isActive": false
  }
}
```

**Example**:
```bash
curl -X PUT http://localhost:3000/api/users/USER_ID/status \
  -H 'Authorization: Bearer ADMIN_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"isActive": false}'
```

---

### 7. Delete User (SuperAdmin)

Permanently delete a user account.

**Endpoint**: `DELETE /api/users/:id`

**Authentication**: Required (SuperAdmin only)

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "User deleted successfully"
  }
}
```

**Example**:
```bash
curl -X DELETE http://localhost:3000/api/users/USER_ID \
  -H 'Authorization: Bearer SUPERADMIN_TOKEN'
```

---

## User Roles

### Role Hierarchy

1. **student** - Regular users
   - Can view content
   - Can submit projects
   - Can update own profile
   - Can set interests

2. **admin** - Content managers
   - All student permissions
   - Can create/edit blogs, events, reports
   - Can view all users
   - Can manage communities and partners

3. **superadmin** - System administrators
   - All admin permissions
   - Can manage user roles
   - Can delete users
   - Can view audit logs
   - Full system access

---

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common Error Codes

- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (user doesn't exist)
- `500` - Internal Server Error

---

## Multi-Language Support

### How Language Preference Works

1. User sets preferred language via `PUT /api/users/me/language`
2. Language is stored in `preferredLanguage` field
3. Content endpoints automatically return translations based on:
   - User's `preferredLanguage` setting
   - Query parameter: `?lang=sw`
   - Accept-Language header
   - Default: English (`en`)

### Example Workflow

```bash
# 1. Set language preference to Swahili
curl -X PUT http://localhost:3000/api/users/me/language \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"language": "sw"}'

# 2. Fetch blogs (automatically returns Swahili versions)
curl -X GET http://localhost:3000/api/blogs \
  -H 'Authorization: Bearer TOKEN'

# 3. Override with query parameter (get French version)
curl -X GET "http://localhost:3000/api/blogs?lang=fr" \
  -H 'Authorization: Bearer TOKEN'
```

---

## Rate Limiting

**Current Status**: Not implemented (planned for future release)

**Planned Limits**:
- Authenticated users: 1000 requests/hour
- Unauthenticated: 100 requests/hour
- Admin users: 5000 requests/hour

---

## Best Practices

### Security

1. **Never expose tokens**: Store JWT tokens securely
2. **Use HTTPS**: Always use HTTPS in production
3. **Token expiration**: Tokens expire after 24 hours
4. **Password requirements**: Minimum 6 characters

### Performance

1. **Pagination**: Use pagination for large lists
2. **Selective fields**: Request only needed data
3. **Caching**: Cache user profiles on client side

### Error Handling

```javascript
// Good error handling example
try {
  const response = await fetch('/api/users/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  if (!data.success) {
    console.error('Error:', data.error);
    // Handle error appropriately
  }
  
  return data.data;
} catch (error) {
  console.error('Network error:', error);
  // Handle network error
}
```

---

## Testing

### Using curl

```bash
# Set token variable
TOKEN="your-jwt-token-here"

# Get profile
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer $TOKEN"

# Update profile
curl -X PUT http://localhost:3000/api/users/me \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"yearOfStudy": 4}'
```

### Using JavaScript/Fetch

```javascript
const token = localStorage.getItem('token');

// Get user profile
const getProfile = async () => {
  const response = await fetch('http://localhost:3000/api/users/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data.data;
};

// Update language
const updateLanguage = async (language) => {
  const response = await fetch('http://localhost:3000/api/users/me/language', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ language })
  });
  
  return await response.json();
};
```

---

## Related Documentation

- [Authentication API](./docs/AUTH_API.md)
- [Interests & Projects API](./INTERESTS_PROJECTS_API.md)
- [Main README](./README.md)
- [Developer Guide](./docs/DEVELOPER_GUIDE.md)

---

## Support

For issues or questions:
- Check Swagger docs: http://localhost:3000/api-docs
- GitHub Issues: [Report a bug](https://github.com)
- Email: admin@bitsa.com
