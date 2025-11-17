# Audit System Documentation

## Overview

The Audit System provides comprehensive logging and tracking of all administrative actions and critical operations within the BITSA Backend. It helps maintain security, accountability, and transparency by recording who did what and when.

**Base URL**: `/api/audit`

---

## Purpose

The audit system serves multiple purposes:

1. **Security**: Track unauthorized access attempts
2. **Accountability**: Record who performed sensitive operations
3. **Compliance**: Maintain logs for regulatory requirements
4. **Debugging**: Trace issues back to specific actions
5. **Analytics**: Understand system usage patterns

---

## What Gets Logged

### Automatically Logged Events

#### Authentication Events
- User login attempts (success/failure)
- Password reset requests
- Email verification
- Token refresh
- Account lockouts

#### User Management
- User registration
- Profile updates
- Role changes
- Account activation/deactivation
- User deletion

#### Content Management
- Blog creation, updates, deletion
- Event creation, updates, deletion
- Report creation, updates, deletion
- Project submissions, updates
- Community management

#### System Events
- Configuration changes
- Failed authorization attempts
- API errors
- Database migration runs

---

## Audit Log Structure

Each audit log entry contains:

```typescript
{
  id: string;              // Unique log ID
  userId: string | null;   // User who performed action
  action: string;          // Action type (e.g., "CREATE_BLOG")
  details: string;         // Human-readable description
  ipAddress: string;       // Request IP address
  userAgent: string;       // Browser/client info
  timestamp: Date;         // When action occurred
  metadata: JSON | null;   // Additional context (optional)
}
```

---

## API Endpoints

### 1. Get Audit Logs

Retrieve audit logs with filtering and pagination.

**Endpoint**: `GET /api/audit/logs`

**Authentication**: Required (Admin or SuperAdmin only)

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 100)
- `userId` (optional): Filter by specific user
- `action` (optional): Filter by action type
- `startDate` (optional): Filter from date (ISO 8601)
- `endDate` (optional): Filter to date (ISO 8601)
- `search` (optional): Search in details field

**Response**:
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log-uuid",
        "userId": "user-uuid",
        "userName": "John Admin",
        "userEmail": "admin@bitsa.com",
        "action": "CREATE_BLOG",
        "details": "Created blog: 'Introduction to AI'",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "timestamp": "2024-11-17T14:30:00Z",
        "metadata": {
          "blogId": "blog-uuid",
          "category": "Technology"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 523,
      "pages": 11
    }
  }
}
```

**Example Requests**:

```bash
# Get all audit logs
curl -X GET http://localhost:3000/api/audit/logs \
  -H 'Authorization: Bearer ADMIN_TOKEN'

# Filter by user
curl -X GET "http://localhost:3000/api/audit/logs?userId=USER_UUID" \
  -H 'Authorization: Bearer ADMIN_TOKEN'

# Filter by action type
curl -X GET "http://localhost:3000/api/audit/logs?action=DELETE_USER" \
  -H 'Authorization: Bearer ADMIN_TOKEN'

# Filter by date range
curl -X GET "http://localhost:3000/api/audit/logs?startDate=2024-11-01&endDate=2024-11-17" \
  -H 'Authorization: Bearer ADMIN_TOKEN'

# Search in details
curl -X GET "http://localhost:3000/api/audit/logs?search=blog" \
  -H 'Authorization: Bearer ADMIN_TOKEN'

# Combined filters with pagination
curl -X GET "http://localhost:3000/api/audit/logs?action=LOGIN&page=1&limit=25" \
  -H 'Authorization: Bearer ADMIN_TOKEN'
```

---

### 2. Get User Activity

Get all audit logs for a specific user.

**Endpoint**: `GET /api/audit/user/:userId`

**Authentication**: Required (Admin or SuperAdmin only)

**Query Parameters**:
- `page` (optional): Page number
- `limit` (optional): Items per page
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "student"
    },
    "logs": [
      {
        "id": "log-uuid",
        "action": "LOGIN",
        "details": "User logged in",
        "ipAddress": "192.168.1.50",
        "timestamp": "2024-11-17T10:00:00Z"
      },
      {
        "id": "log-uuid",
        "action": "SUBMIT_PROJECT",
        "details": "Submitted project: 'Smart Campus App'",
        "ipAddress": "192.168.1.50",
        "timestamp": "2024-11-17T11:30:00Z"
      }
    ],
    "summary": {
      "totalActions": 47,
      "lastActivity": "2024-11-17T14:00:00Z",
      "mostCommonAction": "LOGIN"
    }
  }
}
```

---

### 3. Get Audit Statistics

Get overview statistics about audit logs.

**Endpoint**: `GET /api/audit/stats`

**Authentication**: Required (SuperAdmin only)

**Query Parameters**:
- `startDate` (optional): Statistics from date
- `endDate` (optional): Statistics to date
- `period` (optional): Group by period (`day`, `week`, `month`)

**Response**:
```json
{
  "success": true,
  "data": {
    "totalLogs": 5234,
    "uniqueUsers": 156,
    "period": {
      "start": "2024-11-01",
      "end": "2024-11-17"
    },
    "actionBreakdown": {
      "LOGIN": 2341,
      "CREATE_BLOG": 45,
      "UPDATE_PROFILE": 389,
      "SUBMIT_PROJECT": 67,
      "DELETE_USER": 3
    },
    "topUsers": [
      {
        "userId": "user-uuid",
        "userName": "John Admin",
        "actionCount": 234
      }
    ],
    "failedActions": 12,
    "timeline": [
      {
        "date": "2024-11-01",
        "count": 234
      },
      {
        "date": "2024-11-02",
        "count": 289
      }
    ]
  }
}
```

---

## Action Types

### Authentication Actions
- `LOGIN` - User login
- `LOGOUT` - User logout
- `LOGIN_FAILED` - Failed login attempt
- `PASSWORD_RESET_REQUEST` - Password reset requested
- `PASSWORD_RESET_COMPLETE` - Password successfully reset
- `EMAIL_VERIFIED` - Email verification completed

### User Management Actions
- `CREATE_USER` - New user registered
- `UPDATE_PROFILE` - Profile updated
- `UPDATE_ROLE` - User role changed
- `DEACTIVATE_USER` - User account deactivated
- `ACTIVATE_USER` - User account activated
- `DELETE_USER` - User deleted

### Content Management Actions
- `CREATE_BLOG` - Blog created
- `UPDATE_BLOG` - Blog updated
- `DELETE_BLOG` - Blog deleted
- `CREATE_EVENT` - Event created
- `UPDATE_EVENT` - Event updated
- `DELETE_EVENT` - Event deleted
- `CREATE_REPORT` - Report created
- `UPDATE_REPORT` - Report updated
- `DELETE_REPORT` - Report deleted

### Project Actions
- `SUBMIT_PROJECT` - Project submitted
- `UPDATE_PROJECT` - Project updated
- `DELETE_PROJECT` - Project deleted
- `APPROVE_PROJECT` - Project approved (admin)
- `REJECT_PROJECT` - Project rejected (admin)

### Community Actions
- `CREATE_COMMUNITY` - Community created
- `UPDATE_COMMUNITY` - Community updated
- `DELETE_COMMUNITY` - Community deleted
- `CREATE_PARTNER` - Partner added
- `UPDATE_PARTNER` - Partner updated
- `DELETE_PARTNER` - Partner deleted

### Interest Actions
- `CREATE_INTEREST` - Interest created
- `UPDATE_INTEREST` - Interest updated
- `DELETE_INTEREST` - Interest deleted
- `ADD_USER_INTEREST` - User added interest
- `REMOVE_USER_INTEREST` - User removed interest

### AI Actions
- `AI_CHAT` - AI chat used
- `AI_GENERATE` - AI content generated
- `AI_TRANSLATE` - AI translation used
- `AI_FEEDBACK` - AI project feedback requested

### System Actions
- `CONFIG_CHANGE` - System configuration changed
- `MIGRATION_RUN` - Database migration executed
- `API_ERROR` - API error occurred
- `UNAUTHORIZED_ACCESS` - Unauthorized access attempt

---

## Implementation

### Automatic Logging (Middleware)

The audit system uses middleware to automatically log actions:

```typescript
import { logAuditEvent } from '../Middleware/auditLogger';

// In any controller
export const createBlog = async (req: Request, res: Response) => {
  try {
    // Create blog
    const blog = await createBlogService(data);
    
    // Log the action
    await logAuditEvent(
      req,
      'CREATE_BLOG',
      `Created blog: "${blog.title}"`,
      { blogId: blog.id, category: blog.category }
    );
    
    return res.status(201).json({ success: true, data: blog });
  } catch (error) {
    // Error handling
  }
};
```

### Manual Logging

For custom logging needs:

```typescript
import db from '../drizzle/db';
import { auditLogs } from '../drizzle/schema';

await db.insert(auditLogs).values({
  userId: user.id,
  action: 'CUSTOM_ACTION',
  details: 'Description of what happened',
  ipAddress: req.ip,
  userAgent: req.get('user-agent'),
  metadata: JSON.stringify({ custom: 'data' })
});
```

---

## Security Considerations

### Data Retention

- **Development**: Logs kept for 30 days
- **Production**: Logs kept for 1 year (recommended)
- **Compliance**: May require longer retention

### Access Control

Only admins and superadmins can:
- View audit logs
- Export audit logs
- View user activity
- Access audit statistics

### Sensitive Data

Audit logs should NOT contain:
- Passwords (even hashed)
- JWT tokens
- API keys
- Personal identification numbers
- Credit card information
- Session cookies

### Privacy Compliance

Ensure audit logs comply with:
- GDPR (right to be forgotten)
- CCPA (data access rights)
- Local data protection laws

---

## Best Practices

### For Developers

1. **Log Critical Actions**: Always log create, update, delete operations
2. **Meaningful Details**: Write clear, human-readable descriptions
3. **Include Context**: Add relevant metadata (IDs, before/after values)
4. **Error Logging**: Log both successes and failures
5. **Avoid Spam**: Don't log every single read operation

### For Administrators

1. **Regular Review**: Check logs weekly for suspicious activity
2. **Monitor Failed Logins**: Investigate multiple failed attempts
3. **Track Admin Actions**: Pay attention to delete/role change operations
4. **Export Reports**: Generate monthly audit reports
5. **Set Alerts**: Configure alerts for critical actions

---

## Monitoring & Alerts

### Recommended Alert Triggers

Set up alerts for:

- **Security**:
  - 5+ failed login attempts from same IP
  - User role changes
  - Account deletions
  - Unauthorized access attempts

- **Operations**:
  - Bulk deletions
  - Configuration changes
  - Database migrations
  - API errors spike

- **Compliance**:
  - Data exports
  - User data deletions
  - Admin access outside business hours

### Example Alert Configuration

```yaml
alerts:
  - name: "Multiple Failed Logins"
    condition: "action = 'LOGIN_FAILED' AND count > 5 IN last 10 minutes"
    action: "send_email_to_admin"
    
  - name: "User Deletion"
    condition: "action = 'DELETE_USER'"
    action: "send_email_and_slack_notification"
    
  - name: "Role Change"
    condition: "action = 'UPDATE_ROLE'"
    action: "log_to_security_channel"
```

---

## Exporting Audit Logs

### CSV Export

```bash
# Export logs as CSV
curl -X GET "http://localhost:3000/api/audit/export?format=csv&startDate=2024-11-01&endDate=2024-11-17" \
  -H 'Authorization: Bearer ADMIN_TOKEN' \
  -o audit-logs.csv
```

### JSON Export

```bash
# Export logs as JSON
curl -X GET "http://localhost:3000/api/audit/export?format=json" \
  -H 'Authorization: Bearer ADMIN_TOKEN' \
  -o audit-logs.json
```

---

## Database Schema

```sql
CREATE TABLE auditLogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT NOT NULL,
  ipAddress VARCHAR(50),
  userAgent TEXT,
  metadata JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_audit_user ON auditLogs(userId);
CREATE INDEX idx_audit_action ON auditLogs(action);
CREATE INDEX idx_audit_timestamp ON auditLogs(timestamp);
CREATE INDEX idx_audit_ip ON auditLogs(ipAddress);
```

---

## Troubleshooting

### Logs Not Appearing

1. Check middleware is properly registered
2. Verify database connection
3. Check user permissions
4. Look for errors in console

### Performance Issues

1. Add database indexes
2. Implement log rotation
3. Archive old logs
4. Use pagination

### Missing User Information

1. Verify JWT token is valid
2. Check user still exists in database
3. Confirm userId is passed correctly

---

## Examples

### Get Recent Failed Logins

```bash
curl -X GET "http://localhost:3000/api/audit/logs?action=LOGIN_FAILED&limit=10" \
  -H 'Authorization: Bearer ADMIN_TOKEN'
```

### Track User Activity for Investigation

```bash
curl -X GET "http://localhost:3000/api/audit/user/SUSPICIOUS_USER_ID?startDate=2024-11-01" \
  -H 'Authorization: Bearer ADMIN_TOKEN'
```

### Generate Monthly Report

```bash
curl -X GET "http://localhost:3000/api/audit/stats?startDate=2024-11-01&endDate=2024-11-30&period=day" \
  -H 'Authorization: Bearer ADMIN_TOKEN'
```

### JavaScript Dashboard Integration

```javascript
// Fetch recent audit logs
const getRecentLogs = async () => {
  const response = await fetch('/api/audit/logs?limit=20', {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  const data = await response.json();
  return data.data.logs;
};

// Get user activity
const getUserActivity = async (userId) => {
  const response = await fetch(`/api/audit/user/${userId}`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  return await response.json();
};

// Monitor specific action
const monitorAction = async (action) => {
  const response = await fetch(`/api/audit/logs?action=${action}&limit=50`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  return await response.json();
};
```

---

## Related Documentation

- [Users API](./USERS_API.md)
- [Authentication API](./docs/AUTH_API.md)
- [Developer Guide](./docs/DEVELOPER_GUIDE.md)
- [Security Best Practices](./docs/SECURITY.md)

---

## Future Enhancements

Planned features:

- [ ] Real-time audit log streaming
- [ ] Advanced analytics dashboard
- [ ] Automated threat detection
- [ ] Log aggregation and correlation
- [ ] Integration with SIEM systems
- [ ] Audit log signing (tamper-proof)
- [ ] Custom alert rules
- [ ] Audit report templates

---

## Support

For audit system questions:
- Check Swagger documentation: http://localhost:3000/api-docs
- GitHub Issues: [Report issues](https://github.com)
- Security concerns: security@bitsa.com
- General support: admin@bitsa.com
