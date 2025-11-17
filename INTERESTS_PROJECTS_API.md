# Interests & Projects API Reference

## Overview

The Interests & Projects API manages user technology interests and student project submissions.

**Base URLs**:
- Interests: `/api/interests`
- Projects: `/api/projects`

---

## Interests API

### 1. Get All Interests

Retrieve list of all available technology interests.

**Endpoint**: `GET /api/interests`

**Authentication**: Not required

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Machine Learning",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "uuid",
      "name": "Web Development",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Example**:
```bash
curl -X GET http://localhost:3000/api/interests
```

---

### 2. Add User Interests

Add interests to the current user's profile.

**Endpoint**: `POST /api/interests/my`

**Authentication**: Required

**Request Body**:
```json
{
  "interestIds": [
    "interest-uuid-1",
    "interest-uuid-2",
    "interest-uuid-3"
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Interests added successfully",
    "count": 3
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/api/interests/my \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "interestIds": ["uuid-1", "uuid-2"]
  }'
```

---

### 3. Get My Interests

Get list of interests for the current user.

**Endpoint**: `GET /api/interests/my`

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Machine Learning",
      "addedAt": "2024-02-15T10:00:00Z"
    },
    {
      "id": "uuid",
      "name": "Cybersecurity",
      "addedAt": "2024-02-15T10:00:00Z"
    }
  ]
}
```

**Example**:
```bash
curl -X GET http://localhost:3000/api/interests/my \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

---

### 4. Remove User Interest

Remove an interest from the current user's profile.

**Endpoint**: `DELETE /api/interests/my/:interestId`

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Interest removed successfully"
  }
}
```

**Example**:
```bash
curl -X DELETE http://localhost:3000/api/interests/my/INTEREST_ID \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

---

### 5. Create Interest (Admin)

Add a new technology interest to the system.

**Endpoint**: `POST /api/interests`

**Authentication**: Required (Admin or SuperAdmin)

**Request Body**:
```json
{
  "name": "Quantum Computing"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Quantum Computing",
    "createdAt": "2024-11-17T14:30:00Z"
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/api/interests \
  -H 'Authorization: Bearer ADMIN_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"name": "Quantum Computing"}'
```

---

### 6. Update Interest (Admin)

Update an existing interest name.

**Endpoint**: `PUT /api/interests/:id`

**Authentication**: Required (Admin or SuperAdmin)

**Request Body**:
```json
{
  "name": "Artificial Intelligence & ML"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Artificial Intelligence & ML",
    "updatedAt": "2024-11-17T14:30:00Z"
  }
}
```

---

### 7. Delete Interest (Admin)

Delete an interest from the system.

**Endpoint**: `DELETE /api/interests/:id`

**Authentication**: Required (Admin or SuperAdmin)

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Interest deleted successfully"
  }
}
```

---

## Projects API

### 1. Get All Projects

Retrieve list of all student projects.

**Endpoint**: `GET /api/projects`

**Authentication**: Not required

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (`submitted`, `in-progress`, `completed`)
- `search` (optional): Search by title or description

**Response**:
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "uuid",
        "title": "Smart Campus Navigation System",
        "description": "An AI-powered mobile application...",
        "techStack": "React Native, TensorFlow, Firebase",
        "status": "in-progress",
        "githubUrl": "https://github.com/user/project",
        "user": {
          "id": "uuid",
          "firstName": "John",
          "lastName": "Doe"
        },
        "createdAt": "2024-03-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

**Example**:
```bash
# Get all projects
curl -X GET http://localhost:3000/api/projects

# Filter by status
curl -X GET "http://localhost:3000/api/projects?status=completed&page=1"

# Search projects
curl -X GET "http://localhost:3000/api/projects?search=mobile"
```

---

### 2. Get My Projects

Get projects created by the current user.

**Endpoint**: `GET /api/projects/my`

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "E-Learning Platform",
      "description": "A comprehensive online learning system...",
      "problemStatement": "Students lack access to quality education...",
      "proposedSolution": "Build a web platform with video courses...",
      "techStack": "Next.js, PostgreSQL, AWS",
      "status": "in-progress",
      "githubUrl": "https://github.com/user/elearning",
      "images": "image1.jpg,image2.jpg",
      "createdAt": "2024-05-20T10:00:00Z",
      "updatedAt": "2024-11-10T15:30:00Z"
    }
  ]
}
```

**Example**:
```bash
curl -X GET http://localhost:3000/api/projects/my \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

---

### 3. Get Project by ID

Get detailed information about a specific project.

**Endpoint**: `GET /api/projects/:id`

**Authentication**: Not required

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Blockchain Certificate System",
    "description": "Decentralized certificate verification system",
    "problemStatement": "Academic certificate fraud is common...",
    "proposedSolution": "Use blockchain for tamper-proof certificates...",
    "techStack": "Ethereum, Solidity, React, IPFS",
    "status": "completed",
    "githubUrl": "https://github.com/user/blockchain-cert",
    "proposalDocument": "https://docs.example.com/proposal.pdf",
    "images": "demo1.png,demo2.png,demo3.png",
    "user": {
      "id": "uuid",
      "firstName": "Jane",
      "lastName": "Smith",
      "major": "Computer Science",
      "yearOfStudy": 4
    },
    "createdAt": "2024-01-10T10:00:00Z",
    "updatedAt": "2024-10-30T14:20:00Z"
  }
}
```

**Example**:
```bash
curl -X GET http://localhost:3000/api/projects/PROJECT_ID
```

---

### 4. Submit Project

Create a new project submission.

**Endpoint**: `POST /api/projects`

**Authentication**: Required

**Request Body**:
```json
{
  "title": "Mental Health Support Platform",
  "description": "A web platform connecting students with mental health resources",
  "problemStatement": "Students face mental health challenges but don't know where to seek help",
  "proposedSolution": "Create an anonymous platform with AI chatbot and counselor directory",
  "techStack": "Next.js, Python, OpenAI API, PostgreSQL",
  "githubUrl": "https://github.com/user/mental-health-platform",
  "proposalDocument": "https://docs.google.com/document/d/...",
  "images": "screenshot1.png,screenshot2.png"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Mental Health Support Platform",
    "status": "submitted",
    "createdAt": "2024-11-17T14:45:00Z"
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/api/projects \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Smart Parking System",
    "description": "IoT-based parking management",
    "techStack": "Arduino, React, Firebase"
  }'
```

---

### 5. Update Project

Update an existing project (only by project owner or admin).

**Endpoint**: `PUT /api/projects/:id`

**Authentication**: Required (Owner or Admin)

**Request Body**:
```json
{
  "title": "Updated Project Title",
  "description": "Updated description",
  "status": "in-progress",
  "techStack": "React Native, Node.js, MongoDB",
  "githubUrl": "https://github.com/user/updated-repo"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Updated Project Title",
    "status": "in-progress",
    "updatedAt": "2024-11-17T15:00:00Z"
  }
}
```

**Example**:
```bash
curl -X PUT http://localhost:3000/api/projects/PROJECT_ID \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "completed",
    "githubUrl": "https://github.com/user/final-project"
  }'
```

---

### 6. Delete Project

Delete a project (only by project owner or admin).

**Endpoint**: `DELETE /api/projects/:id`

**Authentication**: Required (Owner or Admin)

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Project deleted successfully"
  }
}
```

**Example**:
```bash
curl -X DELETE http://localhost:3000/api/projects/PROJECT_ID \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

---

### 7. Update Project Status (Admin)

Change project status (admin only).

**Endpoint**: `PUT /api/projects/:id/status`

**Authentication**: Required (Admin or SuperAdmin)

**Request Body**:
```json
{
  "status": "completed"
}
```

**Status Options**:
- `submitted` - Initial submission
- `in-progress` - Work in progress
- `completed` - Project finished
- `rejected` - Not approved (admin only)

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Project status updated",
    "status": "completed"
  }
}
```

---

## Project Status Workflow

```
submitted → in-progress → completed
    ↓
rejected (admin decision)
```

1. **submitted**: Student submits project
2. **in-progress**: Student is actively working
3. **completed**: Project is finished
4. **rejected**: Admin rejects submission (rare)

---

## Available Technology Interests

Default interests included in seed data:

- Machine Learning
- Artificial Intelligence
- Web Development
- Mobile App Development
- Data Science
- Cybersecurity
- Cloud Computing
- DevOps
- Blockchain
- Internet of Things (IoT)
- Game Development
- UI/UX Design
- Database Management
- Computer Networks
- Software Testing
- Algorithms
- Computer Graphics
- Natural Language Processing
- Computer Vision
- Robotics

Admins can add more interests as needed.

---

## AI-Powered Project Feedback

Use the AI API to get intelligent feedback on projects:

**Endpoint**: `POST /api/ai/feedback/project`

**Request**:
```json
{
  "title": "Smart Campus Navigation",
  "description": "AR-based campus navigation app",
  "techStack": "React Native, TensorFlow, Firebase",
  "problemStatement": "Students get lost on campus",
  "proposedSolution": "Use AR for real-time navigation"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "overallFeedback": "Excellent project with strong technical foundation...",
    "strengths": [
      "Clear problem statement",
      "Modern tech stack",
      "Practical application"
    ],
    "improvements": [
      "Consider offline functionality",
      "Add accessibility features"
    ],
    "technicalSuggestions": [
      "Implement caching for better performance",
      "Use Redux for state management"
    ],
    "rating": 8.5,
    "nextSteps": [
      "Create prototype",
      "Conduct user testing"
    ]
  }
}
```

See [AI API Documentation](./docs/AI_API.md) for more details.

---

## Best Practices

### For Students

1. **Clear Descriptions**: Write detailed project descriptions
2. **Problem-Solution**: Always state problem and your solution
3. **Tech Stack**: List all technologies used
4. **GitHub Repo**: Make repository public or add README
5. **Regular Updates**: Update status as you progress
6. **Documentation**: Include proposal document if available

### For Admins

1. **Review Projects**: Regularly check submissions
2. **Provide Feedback**: Use comments to guide students
3. **Status Management**: Keep project statuses up-to-date
4. **Interest Curation**: Add relevant new interests
5. **Quality Control**: Ensure project quality standards

---

## Error Responses

```json
{
  "success": false,
  "error": "Error message"
}
```

**Common Errors**:
- `400` - Invalid input (missing required fields)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (not project owner)
- `404` - Project/Interest not found
- `409` - Conflict (interest already added)
- `500` - Server error

---

## Examples

### Complete Project Submission Workflow

```bash
# 1. Get available interests
curl -X GET http://localhost:3000/api/interests

# 2. Add interests to profile
curl -X POST http://localhost:3000/api/interests/my \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"interestIds": ["interest-uuid-1", "interest-uuid-2"]}'

# 3. Submit project
curl -X POST http://localhost:3000/api/projects \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "My Awesome Project",
    "description": "A revolutionary app...",
    "techStack": "React, Node.js, MongoDB",
    "githubUrl": "https://github.com/me/project"
  }'

# 4. Get AI feedback (optional)
curl -X POST http://localhost:3000/api/ai/feedback/project \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "My Awesome Project",
    "description": "A revolutionary app...",
    "techStack": "React, Node.js, MongoDB"
  }'

# 5. Update project status
curl -X PUT http://localhost:3000/api/projects/PROJECT_ID \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"status": "in-progress"}'
```

### JavaScript Example

```javascript
// Add interests
const addInterests = async (interestIds) => {
  const response = await fetch('/api/interests/my', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ interestIds })
  });
  return await response.json();
};

// Submit project
const submitProject = async (projectData) => {
  const response = await fetch('/api/projects', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(projectData)
  });
  return await response.json();
};

// Get my projects
const getMyProjects = async () => {
  const response = await fetch('/api/projects/my', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data.data;
};
```

---

## Related Documentation

- [Users API](./USERS_API.md)
- [AI API](./docs/AI_API.md)
- [Main README](./README.md)
- [Developer Guide](./docs/DEVELOPER_GUIDE.md)

---

## Support

For questions or issues:
- Swagger Documentation: http://localhost:3000/api-docs
- GitHub Issues: [Report a bug](https://github.com)
- Email: admin@bitsa.com
