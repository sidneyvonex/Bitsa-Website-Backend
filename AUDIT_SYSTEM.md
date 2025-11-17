# Audit System & Soft Delete Implementation

## Overview
Complete audit logging system for SuperAdmin oversight and soft delete functionality for all entities.

## 🔍 Audit System

### Purpose
Every action taken by users/admins is logged and viewable by SuperAdmin for:
- Security monitoring
- Compliance tracking
- Activity auditing
- Troubleshooting
- User behavior analysis

### Audit Log Structure
```typescript
{
  id: string;
  userId: string;              // schoolId of who performed action
  userEmail: string;
  userRole: string;            // student/admin/superadmin
  action: string;              // CREATE, UPDATE, DELETE, LOGIN, etc.
  actionDescription: string;   // Human-readable description
  resourceType: string;        // "User", "Project", "Blog", etc.
  resourceId: string;          // ID of affected resource
  metadata: object;            // Additional context
  ipAddress: string;           // IP address of requester
  userAgent: string;           // Browser/client info
  oldValues: object;           // Before state (for updates/deletes)
  newValues: object;           // After state (for updates/creates)
  success: boolean;            // Operation succeeded?
  errorMessage: string;        // Error details if failed
  createdAt: Date;
}
```

### Action Types
- **CREATE** - New resource created
- **UPDATE** - Resource modified
- **DELETE** - Resource deleted (soft delete)
- **LOGIN** - User logged in
- **LOGOUT** - User logged out
- **ACTIVATE** - User account activated
- **DEACTIVATE** - User account deactivated
- **ROLE_CHANGE** - User role modified
- **PASSWORD_RESET** - Password reset performed
- **EMAIL_VERIFY** - Email verification completed
- **PROFILE_UPDATE** - Profile information updated
- **OTHER** - Other actions

## 🗑️ Soft Delete

### What is Soft Delete?
Instead of permanently removing records from the database, soft delete marks them as deleted while keeping the data intact.

### Benefits
- ✅ Data recovery possible
- ✅ Audit trail preserved
- ✅ Compliance with data retention policies
- ✅ Accidental deletion protection
- ✅ Historical data analysis

### Implementation
Every table with soft delete has:
```typescript
{
  deletedAt: Date | null;     // When deleted (null = not deleted)
  deletedBy: string | null;   // Who deleted it (schoolId)
}
```

### Behavior
- **Default queries** exclude soft-deleted records automatically
- **SuperAdmin** can view/restore soft-deleted records
- **Delete operations** set `deletedAt` and `deletedBy`, and `isActive = false`

## 📋 Audit API Endpoints (SuperAdmin Only)

### 1. Get All Audit Logs
**GET** `/api/audit/logs`

Returns paginated audit logs with comprehensive filters.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Logs per page (default: 50)
- `userId` (optional): Filter by user schoolId
- `action` (optional): Filter by action type
- `resourceType` (optional): Filter by resource type
- `startDate` (optional): Filter by start date (ISO 8601)
- `endDate` (optional): Filter by end date (ISO 8601)
- `success` (optional): Filter by success status (true/false)
- `search` (optional): Search in description, email, resourceId

**Example:**
```bash
GET /api/audit/logs?page=1&limit=50&action=DELETE&startDate=2024-01-01
```

**Response:**
```json
{
  "logs": [
    {
      "id": "uuid",
      "userId": "12345",
      "userEmail": "admin@example.com",
      "userRole": "admin",
      "action": "DELETE",
      "actionDescription": "User 67890 was soft deleted by 12345",
      "resourceType": "User",
      "resourceId": "67890",
      "metadata": "{\"deletedBy\":\"12345\"}",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "oldValues": "{\"isActive\":true,...}",
      "newValues": "{\"isActive\":false,\"deletedAt\":\"...\"}",
      "success": true,
      "errorMessage": null,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1250,
    "totalPages": 25
  }
}
```

---

### 2. Get Audit Statistics
**GET** `/api/audit/stats`

Returns comprehensive audit statistics.

**Query Parameters:**
- `startDate` (optional): Start date
- `endDate` (optional): End date

**Response:**
```json
{
  "stats": {
    "total": 15000,
    "successful": 14750,
    "failed": 250,
    "byAction": [
      { "action": "LOGIN", "count": 5000 },
      { "action": "UPDATE", "count": 3500 },
      { "action": "CREATE", "count": 2000 },
      { "action": "DELETE", "count": 500 }
    ],
    "byResource": [
      { "resourceType": "User", "count": 8000 },
      { "resourceType": "Project", "count": 4000 },
      { "resourceType": "Blog", "count": 3000 }
    ],
    "topUsers": [
      { "userId": "12345", "userEmail": "admin@example.com", "count": 2500 },
      { "userId": "67890", "userEmail": "user@example.com", "count": 1800 }
    ]
  }
}
```

---

### 3. Get Recent Activity
**GET** `/api/audit/recent`

Returns the most recent audit log entries.

**Query Parameters:**
- `limit` (optional): Number of logs (default: 20, max: 100)

**Response:**
```json
{
  "logs": [ /* array of recent log entries */ ],
  "count": 20
}
```

---

### 4. Get User Audit Logs
**GET** `/api/audit/user/:userId`

Returns all audit logs for a specific user.

**Example:** `GET /api/audit/user/12345?page=1&limit=50`

---

### 5. Get Resource Audit Logs
**GET** `/api/audit/resource/:resourceType/:resourceId`

Returns all audit logs for a specific resource.

**Example:** `GET /api/audit/resource/User/12345`

Shows complete history of actions on user 12345.

---

## 🔧 Usage in Code

### Logging Audit Events

#### From Controller
```typescript
import { logAuditEvent } from "../Middleware/auditLogger";

// In your controller
await logAuditEvent(
    req,
    "UPDATE",
    `User ${userId} updated their profile`,
    "User",
    userId,
    { fields: ["firstName", "bio"] },
    oldValues,  // Before update
    newValues   // After update
);
```

#### Manual Logging
```typescript
import { createAuditLog } from "../Middleware/auditLogger";

await createAuditLog({
    userId: "12345",
    userEmail: "user@example.com",
    userRole: "admin",
    action: "DELETE",
    actionDescription: "Deleted project #567",
    resourceType: "Project",
    resourceId: "567",
    metadata: { reason: "Duplicate" },
    success: true
});
```

### Implementing Soft Delete

#### In Service
```typescript
// Soft delete
export const deleteResourceService = async (resourceId: string, deletedBy: string) => {
    const [deleted] = await db
        .update(resources)
        .set({ 
            deletedAt: new Date(),
            deletedBy: deletedBy,
            isActive: false
        })
        .where(eq(resources.id, resourceId))
        .returning();
    
    return deleted;
};

// Exclude soft-deleted in queries
export const getResourcesService = async () => {
    return await db.query.resources.findMany({
        where: sql`${resources.deletedAt} IS NULL`
    });
};
```

#### In Controller
```typescript
export const deleteResource = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedBy = req.user?.userId || 'unknown';
        
        const oldResource = await getResourceService(id);
        const deletedResource = await deleteResourceService(id, deletedBy);
        
        // Log the deletion
        await logAuditEvent(
            req,
            "DELETE",
            `Resource ${id} was soft deleted`,
            "Resource",
            id,
            { deletedBy },
            oldResource,
            deletedResource
        );
        
        res.status(200).json({ message: "Resource deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
```

---

## 🔐 Security Considerations

### Access Control
- ✅ Only **SuperAdmin** can view audit logs
- ✅ All audit endpoints protected with `superAdminAuth` middleware
- ✅ Sensitive data (passwords, tokens) never logged

### Data Protection
- ✅ IP addresses and user agents logged for security
- ✅ Before/after snapshots for change tracking
- ✅ Error messages captured for failed operations

### Compliance
- ✅ Immutable audit trail (logs cannot be modified)
- ✅ Complete action history
- ✅ User attribution for all actions

---

## 📊 SuperAdmin Dashboard Use Cases

### 1. Security Monitoring
```bash
# View all failed login attempts
GET /api/audit/logs?action=LOGIN&success=false

# View all deletions in last 7 days
GET /api/audit/logs?action=DELETE&startDate=2024-01-08

# View all role changes
GET /api/audit/logs?action=ROLE_CHANGE
```

### 2. User Activity Tracking
```bash
# View all actions by specific user
GET /api/audit/user/12345

# View most active users
GET /api/audit/stats
```

### 3. Resource History
```bash
# View complete history of a user
GET /api/audit/resource/User/12345

# View all changes to a project
GET /api/audit/resource/Project/789
```

### 4. Compliance Reporting
```bash
# Get monthly statistics
GET /api/audit/stats?startDate=2024-01-01&endDate=2024-01-31

# Export all audit logs
GET /api/audit/logs?limit=10000
```

---

## 🚀 Testing

```bash
# Login as SuperAdmin first
TOKEN="your-superadmin-token"

# Get recent activity
curl -X GET http://localhost:8000/api/audit/recent \
  -H "Authorization: Bearer $TOKEN"

# Get audit statistics
curl -X GET http://localhost:8000/api/audit/stats \
  -H "Authorization: Bearer $TOKEN"

# Get all logs with filters
curl -X GET "http://localhost:8000/api/audit/logs?action=DELETE&limit=20" \
  -H "Authorization: Bearer $TOKEN"

# Get specific user's activity
curl -X GET http://localhost:8000/api/audit/user/12345 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🎯 What Gets Logged

### Authentication Events
- ✅ User registration
- ✅ Login (success/failure)
- ✅ Logout
- ✅ Password reset
- ✅ Email verification

### User Management
- ✅ Profile updates
- ✅ Role changes
- ✅ Account activation/deactivation
- ✅ User deletion (soft delete)

### Future Microservices
All future microservices will automatically log:
- ✅ CREATE operations
- ✅ UPDATE operations
- ✅ DELETE operations (soft delete)
- ✅ Any sensitive actions

---

## 📁 Files Created/Modified

### New Files
- `Src/drizzle/schema.ts` - Added `auditLogs` table and soft delete fields
- `Src/Middleware/auditLogger.ts` - Audit logging service
- `Src/Audit/audit.controller.ts` - Audit endpoints controller
- `Src/Audit/audit.routes.ts` - Audit routes

### Modified Files
- `Src/Users/users.service.ts` - Soft delete implementation
- `Src/Users/users.controller.ts` - Audit logging integration
- `Src/Auth/auth.controller.ts` - Auth event logging
- `Src/app.ts` - Registered audit routes

---

## 🔄 Migration Required

Run these commands to apply database changes:

```bash
# Generate migration
pnpm run gen

# Apply migration
pnpm run push

# Build project
pnpm run build

# Start server
pnpm run dev
```

---

## 💡 Best Practices

1. **Always log sensitive operations** (delete, role change, etc.)
2. **Include meaningful descriptions** in audit logs
3. **Log both success and failure** with error messages
4. **Use soft delete** for all user-facing deletions
5. **Exclude soft-deleted records** in default queries
6. **Provide restore functionality** for SuperAdmin (future enhancement)

---

## 🎨 Summary

✅ **Audit System**: Complete logging of all user actions
✅ **Soft Delete**: Safe deletion with recovery capability
✅ **SuperAdmin Oversight**: Full visibility into system activity
✅ **Security**: IP tracking, user agents, success/failure logging
✅ **Compliance**: Immutable audit trail for regulations
✅ **Scalable**: Easy to extend to all future microservices
