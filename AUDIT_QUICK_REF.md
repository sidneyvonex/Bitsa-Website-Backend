# Audit & Soft Delete - Quick Reference

## 🎯 Quick Summary

### Soft Delete
- All `DELETE` operations are now **soft deletes**
- Records marked with `deletedAt` and `deletedBy`
- Soft-deleted records **automatically excluded** from queries
- Data can be recovered if needed

### Audit Logging
- **Every action** is logged to `auditLogs` table
- **SuperAdmin only** can view logs
- Includes IP address, user agent, before/after states
- **Immutable** - logs cannot be modified

---

## 🔍 Audit Endpoints (SuperAdmin Only)

| Endpoint | Description |
|----------|-------------|
| `GET /api/audit/logs` | All audit logs (paginated, filterable) |
| `GET /api/audit/stats` | Statistics dashboard |
| `GET /api/audit/recent` | Recent activity |
| `GET /api/audit/user/:userId` | User's activity history |
| `GET /api/audit/resource/:type/:id` | Resource change history |

---

## 📋 Action Types

- `CREATE` - Resource created
- `UPDATE` - Resource modified
- `DELETE` - Soft delete performed
- `LOGIN` / `LOGOUT` - Authentication
- `ACTIVATE` / `DEACTIVATE` - Account status
- `ROLE_CHANGE` - Permission change
- `PASSWORD_RESET` - Password changed
- `EMAIL_VERIFY` - Email verified
- `PROFILE_UPDATE` - Profile changed

---

## 💻 Code Examples

### Log an Audit Event
```typescript
import { logAuditEvent } from "../Middleware/auditLogger";

await logAuditEvent(
    req,
    "UPDATE",
    "User updated profile",
    "User",
    userId,
    { fields: ["bio", "picture"] },
    oldData,
    newData
);
```

### Implement Soft Delete
```typescript
// In service
export const deleteItemService = async (id: string, deletedBy: string) => {
    const [deleted] = await db
        .update(items)
        .set({ 
            deletedAt: new Date(),
            deletedBy,
            isActive: false
        })
        .where(eq(items.id, id))
        .returning();
    return deleted;
};

// Exclude soft-deleted in queries
where: and(
    eq(items.status, "active"),
    sql`${items.deletedAt} IS NULL`
)
```

---

## 🔐 What Gets Logged?

### Automatically Logged (Already Implemented)
✅ User registration
✅ Login/logout
✅ Profile updates
✅ Role changes
✅ Account activation/deactivation
✅ User deletion

### For Future Microservices
For every new microservice, log:
- All CREATE operations
- All UPDATE operations
- All DELETE operations
- Permission changes
- Sensitive actions

---

## 🚀 Testing Commands

```bash
# Get SuperAdmin token first
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@example.com","password":"password"}'

# View recent activity
curl http://localhost:8000/api/audit/recent \
  -H "Authorization: Bearer $TOKEN"

# Get audit stats
curl http://localhost:8000/api/audit/stats \
  -H "Authorization: Bearer $TOKEN"

# Get all deletions
curl "http://localhost:8000/api/audit/logs?action=DELETE" \
  -H "Authorization: Bearer $TOKEN"

# Get user history
curl http://localhost:8000/api/audit/user/12345 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Common Queries

```bash
# Failed login attempts (security)
GET /api/audit/logs?action=LOGIN&success=false

# All deletions this month
GET /api/audit/logs?action=DELETE&startDate=2024-01-01

# All admin actions
GET /api/audit/logs?userRole=admin

# Search by keyword
GET /api/audit/logs?search=password

# User activity report
GET /api/audit/user/12345

# Resource change history
GET /api/audit/resource/User/12345
```

---

## ⚙️ Database Changes

### Users Table (+ All Future Tables)
```sql
deletedAt timestamp NULL
deletedBy varchar(50) NULL
```

### New Table: auditLogs
```sql
id uuid PRIMARY KEY
userId varchar(50)
userEmail varchar(255)
userRole varchar(50)
action enum (CREATE, UPDATE, DELETE, etc.)
actionDescription text
resourceType varchar(100)
resourceId varchar(255)
metadata text (JSON)
ipAddress varchar(45)
userAgent text
oldValues text (JSON)
newValues text (JSON)
success boolean
errorMessage text
createdAt timestamp
```

---

## 🎯 Implementation Checklist

### For Every New Microservice:

1. **Add soft delete fields** to schema:
   ```typescript
   deletedAt: timestamp("deletedAt"),
   deletedBy: varchar("deletedBy", { length: 50 })
   ```

2. **Exclude soft-deleted in queries**:
   ```typescript
   where: sql`${table.deletedAt} IS NULL`
   ```

3. **Implement soft delete**:
   ```typescript
   .set({ deletedAt: new Date(), deletedBy, isActive: false })
   ```

4. **Log all actions**:
   ```typescript
   await logAuditEvent(req, "ACTION", "Description", "Type", "id")
   ```

---

## 📁 Files Modified

**New:**
- `Src/Middleware/auditLogger.ts`
- `Src/Audit/audit.controller.ts`
- `Src/Audit/audit.routes.ts`
- `AUDIT_SYSTEM.md` (full docs)

**Modified:**
- `Src/drizzle/schema.ts` (added auditLogs table + soft delete fields)
- `Src/Users/users.service.ts` (soft delete implementation)
- `Src/Users/users.controller.ts` (audit logging)
- `Src/Auth/auth.controller.ts` (auth event logging)
- `Src/app.ts` (registered routes)

---

## 🔄 Setup Steps

```bash
# 1. Generate migration
pnpm run gen

# 2. Apply to database
pnpm run push

# 3. Build TypeScript
pnpm run build

# 4. Start server
pnpm run dev
```

---

## 💡 Benefits

### Soft Delete
✅ Accidental deletion recovery
✅ Data retention compliance
✅ Historical data analysis
✅ Audit trail preservation

### Audit Logging
✅ Security monitoring
✅ Compliance requirements
✅ User activity tracking
✅ Troubleshooting
✅ Accountability

---

See **AUDIT_SYSTEM.md** for complete documentation!
