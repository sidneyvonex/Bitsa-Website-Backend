# Interests & Projects - Quick Start Guide

## 🚀 Quick Setup

```bash
# Build and start
pnpm run build
pnpm run dev
```

---

## 📱 Student First Login Flow

### Step 1: Check Interest Selection Status
```bash
GET /api/interests/my/check
Authorization: Bearer {student_token}

Response:
{
  "hasInterests": false,
  "count": 0,
  "needsToSelectInterests": true  ← Show interest selection if true
}
```

### Step 2: Show Available Interests
```bash
GET /api/interests?limit=100
Authorization: Bearer {student_token}
```

### Step 3: Student Selects Interests
```bash
POST /api/interests/my
Authorization: Bearer {student_token}
Content-Type: application/json

{
  "interestIds": ["uuid1", "uuid2", "uuid3"]
}
```

---

## 🎯 Core Endpoints

### **Interests**

| Student Actions | Endpoint |
|----------------|----------|
| Check if selected | `GET /api/interests/my/check` |
| View all interests | `GET /api/interests` |
| My interests | `GET /api/interests/my` |
| Add interests | `POST /api/interests/my` |
| Update all | `PUT /api/interests/my` |
| Remove one | `DELETE /api/interests/my/:id` |

| Admin Actions | Endpoint |
|--------------|----------|
| Create interest | `POST /api/interests/admin` |
| Update interest | `PUT /api/interests/admin/:id` |
| Delete interest | `DELETE /api/interests/admin/:id` |
| View stats | `GET /api/interests/admin/stats` |

### **Projects**

| Student Actions | Endpoint |
|----------------|----------|
| Browse projects | `GET /api/projects` |
| Featured projects | `GET /api/projects/featured` |
| My projects | `GET /api/projects/my/all` |
| Submit project | `POST /api/projects/create` |
| Update my project | `PUT /api/projects/:id` |
| Delete my project | `DELETE /api/projects/:id` |

| Admin Actions | Endpoint |
|--------------|----------|
| Post featured project | `POST /api/projects/create` (with status) |
| Change status | `PATCH /api/projects/admin/:id/status` |
| View stats | `GET /api/projects/admin/stats` |
| User's projects | `GET /api/projects/admin/user/:schoolId` |

---

## 💡 Key Examples

### Student Submits Project
```json
POST /api/projects/create

{
  "title": "Smart Campus Navigator",
  "description": "AR-based campus navigation app",
  "problemStatement": "Students get lost on campus",
  "proposedSolution": "Mobile app with AR directions",
  "techStack": "React Native, Node.js, PostgreSQL",
  "githubUrl": "https://github.com/user/campus-nav"
}
```

### Admin Posts Featured Project
```json
POST /api/projects/create

{
  "title": "Award-Winning AI Project",
  "description": "Won 1st place at Hackathon 2024",
  "techStack": "Python, TensorFlow",
  "status": "featured"  ← Admin can set status
}
```

### Admin Approves Project
```json
PATCH /api/projects/admin/{projectId}/status

{
  "status": "featured"
}
```

**Valid Statuses:**
- `submitted` (default for students)
- `under_review`
- `approved`
- `rejected`
- `featured`

---

## 🔑 Permission Rules

### Interests
✅ Students: Manage own interests only
✅ Admins: Full CRUD on all interests

### Projects
✅ Students: 
  - Create (auto status: submitted)
  - Edit/delete own projects only
✅ Admins:
  - Create with any status
  - Edit/delete any project
  - Change project status

---

## 📊 Admin Dashboard Queries

```bash
# Interest statistics
GET /api/interests/admin/stats
→ Shows which interests are most popular

# Project statistics
GET /api/projects/admin/stats
→ Total, by status, top contributors

# All featured projects
GET /api/projects?status=featured

# Search projects
GET /api/projects?search=machine+learning
```

---

## 🎨 Frontend Integration

### Interest Selection Modal
```typescript
// On login, check if needs interests
const response = await fetch('/api/interests/my/check');
const data = await response.json();

if (data.needsToSelectInterests) {
  showInterestModal();
}
```

### Browse Featured Projects (Homepage)
```typescript
const response = await fetch('/api/projects/featured?limit=6');
const { projects } = await response.json();
// Display as cards on homepage
```

---

## 📁 Files Structure

```
Src/
  Interests/
    ├── interests.service.ts     (14 functions)
    ├── interests.controller.ts  (13 endpoints)
    └── interests.routes.ts      (13 routes)
  
  Projects/
    ├── projects.service.ts      (12 functions)
    ├── projects.controller.ts   (10 endpoints)
    └── projects.routes.ts       (12 routes)
```

**Routes:**
- `/api/interests/*` - All interest endpoints
- `/api/projects/*` - All project endpoints

---

## ✅ Testing Checklist

**Interests:**
- [ ] Student checks interest status on login
- [ ] Student selects 3+ interests
- [ ] Student views own interests
- [ ] Student updates interests
- [ ] Admin creates new interest
- [ ] Admin views interest stats

**Projects:**
- [ ] Student submits project
- [ ] Student views own projects
- [ ] Admin posts featured project
- [ ] Admin approves student project
- [ ] Browse featured projects
- [ ] Search projects by keyword

---

See **INTERESTS_PROJECTS_API.md** for complete API documentation! 📚
