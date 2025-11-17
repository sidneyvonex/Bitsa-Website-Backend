# Interests & Projects API - Quick Reference

## 🎯 Overview

### Interests Microservice
- **Purpose**: Students select interests on first login to personalize their experience
- **First Thing Students See**: Interest selection screen if not selected yet
- **Features**: CRUD for interests (Admin), Select/manage interests (Students), Find users by interest

### Projects Microservice
- **Purpose**: Students submit projects, Admins can post/feature good projects
- **Features**: Full CRUD, Status management (submitted/approved/featured), Browse/search projects

---

## 📋 Interests API Endpoints

### Student Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/interests` | Get all available interests (for selection) | Student/Admin |
| `GET` | `/api/interests/my` | Get my selected interests | Student/Admin |
| `GET` | `/api/interests/my/check` | Check if I have selected interests | Student/Admin |
| `POST` | `/api/interests/my` | Add interests to my profile | Student/Admin |
| `PUT` | `/api/interests/my` | Replace all my interests | Student/Admin |
| `DELETE` | `/api/interests/my/:interestId` | Remove an interest from my profile | Student/Admin |
| `GET` | `/api/interests/:interestId/users` | Get users with this interest | Student/Admin |

### Admin Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/interests/admin/all` | Get all interests (full list) | Admin |
| `GET` | `/api/interests/admin/stats` | Get interest statistics | Admin |
| `GET` | `/api/interests/admin/:id` | Get interest by ID | Admin |
| `POST` | `/api/interests/admin` | Create new interest | Admin |
| `PUT` | `/api/interests/admin/:id` | Update interest | Admin |
| `DELETE` | `/api/interests/admin/:id` | Delete interest | Admin |

---

## 📋 Projects API Endpoints

### Public/Student Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/projects` | Get all projects (paginated) | Student/Admin |
| `GET` | `/api/projects/featured` | Get featured/approved projects | Student/Admin |
| `GET` | `/api/projects/:id` | Get project by ID | Student/Admin |
| `GET` | `/api/projects/my/all` | Get my projects | Student/Admin |
| `POST` | `/api/projects/create` | Create new project | Student/Admin |
| `PUT` | `/api/projects/:id` | Update project (own or admin) | Student/Admin |
| `DELETE` | `/api/projects/:id` | Delete project (own or admin) | Student/Admin |

### Admin Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/projects/admin/stats` | Get project statistics | Admin |
| `PATCH` | `/api/projects/admin/:id/status` | Update project status | Admin |
| `GET` | `/api/projects/admin/user/:schoolId` | Get user's projects | Admin |

---

## 💻 Usage Examples

### Check if Student Needs Interest Selection

```bash
# First call after login
curl -X GET http://localhost:8000/api/interests/my/check \
  -H "Authorization: Bearer $TOKEN"

# Response:
{
  "hasInterests": false,
  "count": 0,
  "needsToSelectInterests": true
}
```

### Student Selects Interests (First Time)

```bash
# Get all available interests
curl -X GET http://localhost:8000/api/interests?limit=50 \
  -H "Authorization: Bearer $TOKEN"

# Select interests
curl -X POST http://localhost:8000/api/interests/my \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "interestIds": [
      "uuid-machine-learning",
      "uuid-web-development",
      "uuid-mobile-apps"
    ]
  }'
```

### Student Creates Project

```bash
curl -X POST http://localhost:8000/api/projects/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Smart Campus App",
    "description": "Mobile app for campus navigation and services",
    "problemStatement": "Students struggle to find their way around campus",
    "proposedSolution": "GPS-based navigation with AR features",
    "techStack": "React Native, Node.js, PostgreSQL",
    "githubUrl": "https://github.com/user/campus-app"
  }'
```

### Admin Posts Featured Project

```bash
curl -X POST http://localhost:8000/api/projects/create \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Award-Winning AI Project",
    "description": "This project won first place at Hackathon 2024",
    "techStack": "Python, TensorFlow, Flask",
    "status": "featured",
    "githubUrl": "https://github.com/winner/ai-project"
  }'
```

### Admin Approves/Features Project

```bash
# Change status to featured
curl -X PATCH http://localhost:8000/api/projects/admin/:projectId/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "featured"}'
```

### Browse Featured Projects

```bash
curl -X GET http://localhost:8000/api/projects/featured?limit=10 \
  -H "Authorization: Bearer $TOKEN"
```

### Search Projects

```bash
# Search by keyword
curl -X GET "http://localhost:8000/api/projects?search=machine%20learning&page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"

# Filter by status
curl -X GET "http://localhost:8000/api/projects?status=featured" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Project Statuses

| Status | Description | Who Can Set |
|--------|-------------|-------------|
| `submitted` | Default for student projects | Student (auto) |
| `under_review` | Admin reviewing | Admin |
| `approved` | Approved for display | Admin |
| `rejected` | Not approved | Admin |
| `featured` | Showcased on homepage | Admin |

---

## 🔄 Student Onboarding Flow

```
1. Student logs in/registers
   ↓
2. Check /api/interests/my/check
   ↓
3. If needsToSelectInterests = true:
   → Show interest selection screen
   → GET /api/interests (get all available)
   → POST /api/interests/my (save selections)
   ↓
4. Redirect to dashboard
```

---

## 🎨 Frontend Integration

### Interest Selection Component

```typescript
// Check if user needs to select interests
const checkInterests = async () => {
  const response = await fetch('/api/interests/my/check', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json();
  
  if (data.needsToSelectInterests) {
    // Show interest selection modal
    showInterestSelectionScreen();
  }
};

// Save selected interests
const saveInterests = async (interestIds: string[]) => {
  await fetch('/api/interests/my', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ interestIds })
  });
};
```

### Project Submission Form

```typescript
const submitProject = async (projectData) => {
  const response = await fetch('/api/projects/create', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(projectData)
  });
  
  const result = await response.json();
  console.log('Project submitted:', result.project);
};
```

---

## 📈 Admin Dashboard Queries

```bash
# Get interest statistics
curl -X GET http://localhost:8000/api/interests/admin/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Response:
[
  { "interestName": "Machine Learning", "userCount": 45 },
  { "interestName": "Web Development", "userCount": 38 },
  ...
]

# Get project statistics
curl -X GET http://localhost:8000/api/projects/admin/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Response:
{
  "total": 127,
  "byStatus": [
    { "status": "submitted", "count": 45 },
    { "status": "approved", "count": 30 },
    { "status": "featured", "count": 10 }
  ],
  "topContributors": [...]
}
```

---

## 🔐 Permissions Summary

### Interests
- **Students**: View all, manage own interests, find users by interest
- **Admins**: Full CRUD on interests, view statistics

### Projects
- **Students**: 
  - Create projects (status: "submitted")
  - Update/delete own projects
  - View all projects
- **Admins**: 
  - Create projects with any status
  - Update/delete any project
  - Change project status
  - View statistics

---

## 🚀 Key Features

### Interests
✅ First-time user onboarding
✅ Interest-based user discovery
✅ Dynamic interest management
✅ Interest statistics for admins

### Projects
✅ Student project submissions
✅ Admin can post featured projects
✅ Multi-status workflow
✅ Rich project data (problem/solution/tech stack)
✅ GitHub integration
✅ Image gallery support
✅ Search and filtering
✅ Project statistics

---

## 📁 Files Created

```
Src/
  Interests/
    interests.service.ts      (14 functions)
    interests.controller.ts   (13 endpoints)
    interests.routes.ts       (13 routes)
  Projects/
    projects.service.ts       (12 functions)
    projects.controller.ts    (10 endpoints)
    projects.routes.ts        (12 routes)
```

Routes registered in `Src/app.ts`:
- `/api/interests/*`
- `/api/projects/*`

---

## 🎯 Critical Implementation Notes

1. **Interest Selection**: Check `/my/check` endpoint on every student login
2. **Admin Project Posting**: Admins can create projects with `status: "featured"` directly
3. **Ownership**: Students can only edit/delete their own projects (admins can edit any)
4. **Audit Logging**: All CREATE/UPDATE/DELETE operations are logged
5. **No Soft Delete**: Projects use hard delete (can implement soft delete if needed)

---

All endpoints are fully documented with Swagger! 🎉
