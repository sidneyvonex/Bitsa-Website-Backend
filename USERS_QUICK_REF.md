# Users Microservice - Quick Reference

## 🎯 Key Points
- **User Identifier**: Always use `schoolId` (e.g., "12345"), NOT the UUID `id`
- **All endpoints** are under `/api/users`
- **Authentication** required for all endpoints (via JWT Bearer token)

## 📋 Endpoint Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/me` | 🔐 User | Get own profile |
| PUT | `/users/me` | 🔐 User | Update own profile |
| PUT | `/users/me/profile-picture` | 🔐 User | Update profile picture |
| PUT | `/users/me/bio` | 🔐 User | Update bio |
| GET | `/users/search` | 🔐 User | Search users |
| GET | `/users/:schoolId` | 👤 Self/Admin | Get user by schoolId |
| GET | `/users` | 🛡️ Admin | Get all users (paginated) |
| GET | `/users/stats` | 🛡️ Admin | Get user statistics |
| GET | `/users/role/:role` | 🛡️ Admin | Get users by role |
| GET | `/users/major/:major` | 🔐 User | Get users by major |
| PUT | `/users/:schoolId` | 🛡️ Admin | Update user (admin) |
| PUT | `/users/:schoolId/role` | 🛡️ Admin | Update user role |
| PUT | `/users/:schoolId/deactivate` | 👤 Self/Admin | Deactivate account |
| PUT | `/users/:schoolId/activate` | 🛡️ Admin | Activate account |
| DELETE | `/users/:schoolId` | 👑 SuperAdmin | Delete user permanently |

## 🔑 Authentication Levels
- 🔐 **User**: Any authenticated user
- 👤 **Self/Admin**: User accessing own data OR admin
- 🛡️ **Admin**: Admin or SuperAdmin role
- 👑 **SuperAdmin**: SuperAdmin role only

## 💡 Common Queries

```bash
# Get your profile
GET /api/users/me

# Update your profile
PUT /api/users/me
Body: { "firstName": "John", "bio": "New bio" }

# Search for users
GET /api/users/search?q=john&limit=10

# Get specific user (use schoolId!)
GET /api/users/12345

# Get all students (Admin)
GET /api/users?role=student&page=1&limit=20

# Promote user to admin (Admin)
PUT /api/users/12345/role
Body: { "role": "admin" }

# Get user stats (Admin)
GET /api/users/stats
```

## 🚀 Quick Test

```bash
# 1. Login first to get token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Save the token from response, then:

# 2. Get your profile
curl -X GET http://localhost:8000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Update your bio
curl -X PUT http://localhost:8000/api/users/me/bio \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bio":"New bio text"}'

# 4. Search users
curl -X GET "http://localhost:8000/api/users/search?q=john" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📁 Files Structure
```
Src/
├── Users/
│   ├── users.service.ts      # Database operations
│   ├── users.controller.ts   # Request handlers
│   └── users.routes.ts       # Route definitions
├── Validation/
│   └── users.validator.ts    # Input validation schemas
└── Middleware/
    └── bearAuth.ts           # Auth middleware
```

## ⚠️ Important Notes

1. **Always use schoolId** - Never use the UUID `id` field for user operations
2. **Sensitive data excluded** - Passwords, tokens never returned in responses
3. **Pagination** - Default: 10 items, Max: 100 per page
4. **Search** - Searches firstName, lastName, email, schoolId
5. **Role hierarchy**: SuperAdmin > Admin > Student

## 🔒 Security
- JWT token required in `Authorization: Bearer <token>` header
- Role-based access control enforced
- Users can only modify their own data (unless admin)
- SuperAdmin-only operations require explicit superadmin role

See **USERS_API.md** for complete documentation!
