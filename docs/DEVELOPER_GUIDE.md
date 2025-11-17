# Developer Guide

## Welcome, New Developer! 👋

This guide will help you understand the BITSA Backend codebase and start contributing quickly.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Code Architecture](#code-architecture)
- [Development Workflow](#development-workflow)
- [Adding New Features](#adding-new-features)
- [Code Style Guide](#code-style-guide)
- [Testing](#testing)
- [Common Patterns](#common-patterns)
- [Debugging Tips](#debugging-tips)

---

## Project Overview

### What is BITSA?

BITSA (Baraton IT Student Association) is a student organization platform that manages:
- **Members**: Student and admin accounts
- **Content**: Blogs, events, projects, reports
- **Communities**: Tech interest groups
- **AI**: Intelligent chat and content generation

### Tech Stack

```
Backend: TypeScript + Express.js
Database: PostgreSQL (via Drizzle ORM)
AI: Groq (Llama 3.3 70B)
Auth: JWT (jsonwebtoken)
Email: Nodemailer (Gmail)
Docs: Swagger/OpenAPI
```

---

## Code Architecture

### Folder Structure

```
Src/
├── <Module>/              # Each feature is a module
│   ├── module.service.ts  # Business logic
│   ├── module.controller.ts # Request handlers
│   └── module.routes.ts   # Route definitions
├── drizzle/               # Database layer
│   ├── db.ts             # Connection
│   ├── schema.ts         # Tables
│   └── migrations/       # Schema changes
├── Middleware/           # Custom middleware
├── Utils/                # Helper functions
├── Validation/           # Input validators
├── app.ts                # Express setup
└── server.ts             # Entry point
```

### Module Pattern

Every feature follows this structure:

```typescript
// 1. SERVICE (business logic)
export const createItemService = async (data) => {
  // Database operations
  // Business rules
  return result;
};

// 2. CONTROLLER (request handling)
export const createItem = async (req, res) => {
  // Validation
  // Call service
  // Return response
};

// 3. ROUTES (endpoint definition)
router.post('/items', authenticate, createItem);
```

### Data Flow

```
Request → Route → Middleware → Controller → Service → Database
                                                ↓
Response ← Controller ← Service ← Database Result
```

---

## Development Workflow

### 1. Setup Development Environment

```bash
# Clone and install
git clone <repo>
cd Bitsa-Website-Backend
pnpm install

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Setup database
pnpm run migrate
pnpm run seed
```

### 2. Start Development Server

```bash
# Start with hot reload
pnpm run dev

# Server runs at http://localhost:3000
# Swagger docs at http://localhost:3000/api-docs
```

### 3. Make Changes

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes, test locally
# Commit frequently with clear messages
git add .
git commit -m "Add: new feature description"

# Push and create PR
git push origin feature/your-feature-name
```

---

## Adding New Features

### Example: Adding a "Comments" Feature

#### 1. Define Database Schema

Edit `Src/drizzle/schema.ts`:

```typescript
export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  blogId: uuid("blogId")
    .references(() => blogs.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});
```

Generate migration:

```bash
pnpm run gen
pnpm run migrate
```

#### 2. Create Service Layer

Create `Src/Comments/comments.service.ts`:

```typescript
import db from "../drizzle/db";
import { comments } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const createCommentService = async (data: {
  blogId: string;
  userId: string;
  content: string;
}) => {
  const [comment] = await db
    .insert(comments)
    .values(data)
    .returning();
  
  return comment;
};

export const getCommentsByBlogService = async (blogId: string) => {
  return await db
    .select()
    .from(comments)
    .where(eq(comments.blogId, blogId))
    .orderBy(comments.createdAt);
};

export const deleteCommentService = async (
  commentId: string,
  userId: string
) => {
  const [deleted] = await db
    .delete(comments)
    .where(
      and(
        eq(comments.id, commentId),
        eq(comments.userId, userId)
      )
    )
    .returning();
  
  return deleted;
};
```

#### 3. Create Controller

Create `Src/Comments/comments.controller.ts`:

```typescript
import { Request, Response } from "express";
import {
  createCommentService,
  getCommentsByBlogService,
  deleteCommentService,
} from "./comments.service";
import { logAuditEvent } from "../Middleware/auditLogger";

export const createComment = async (req: Request, res: Response) => {
  try {
    const { blogId, content } = req.body;
    const userId = req.user?.userId;

    if (!blogId || !content) {
      return res.status(400).json({
        success: false,
        error: "Blog ID and content are required",
      });
    }

    const comment = await createCommentService({
      blogId,
      userId,
      content,
    });

    await logAuditEvent(req, "CREATE_COMMENT", `Comment on blog ${blogId}`);

    return res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error: any) {
    console.error("Create comment error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to create comment",
    });
  }
};

export const getCommentsByBlog = async (req: Request, res: Response) => {
  try {
    const { blogId } = req.params;

    const comments = await getCommentsByBlogService(blogId);

    return res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error: any) {
    console.error("Get comments error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch comments",
    });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = req.user?.userId;

    const deleted = await deleteCommentService(commentId, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Comment not found or unauthorized",
      });
    }

    await logAuditEvent(req, "DELETE_COMMENT", `Deleted comment ${commentId}`);

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete comment error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to delete comment",
    });
  }
};
```

#### 4. Create Routes

Create `Src/Comments/comments.routes.ts`:

```typescript
import { Router } from "express";
import { authenticate } from "../Middleware/bearAuth";
import {
  createComment,
  getCommentsByBlog,
  deleteComment,
} from "./comments.controller";

const router = Router();

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               blogId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created
 */
router.post("/", authenticate, createComment);

/**
 * @swagger
 * /api/comments/blog/{blogId}:
 *   get:
 *     summary: Get comments for a blog
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get("/blog/:blogId", getCommentsByBlog);

/**
 * @swagger
 * /api/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted
 */
router.delete("/:commentId", authenticate, deleteComment);

export default router;
```

#### 5. Register Routes

Edit `Src/app.ts`:

```typescript
import commentRouter from './Comments/comments.routes';

// Add with other routes
app.use('/api/comments', commentRouter);
```

#### 6. Test Your Feature

```bash
# Create comment
curl -X POST http://localhost:3000/api/comments \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"blogId": "blog-id", "content": "Great post!"}'

# Get comments
curl http://localhost:3000/api/comments/blog/blog-id

# Delete comment
curl -X DELETE http://localhost:3000/api/comments/comment-id \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

---

## Code Style Guide

### TypeScript

```typescript
// ✅ Good
export const getUserById = async (userId: string): Promise<User | null> => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  return user || null;
};

// ❌ Bad
export const getUserById = async (userId) => {
  return await db.select().from(users).where(eq(users.id, userId)).limit(1);
};
```

### Error Handling

```typescript
// ✅ Good
try {
  const result = await someOperation();
  return res.status(200).json({ success: true, data: result });
} catch (error: any) {
  console.error("Operation failed:", error);
  return res.status(500).json({
    success: false,
    error: error.message || "Operation failed",
  });
}

// ❌ Bad
try {
  const result = await someOperation();
  return res.json(result);
} catch (error) {
  return res.status(500).send("Error");
}
```

### Naming Conventions

```typescript
// Services: verbNounService
createUserService()
getUserProfileService()
updateBlogService()

// Controllers: verbNoun
createUser()
getUserProfile()
updateBlog()

// Routes: HTTP method + path
router.post('/users', createUser)
router.get('/users/:id', getUserProfile)

// Database tables: plural nouns
users, blogs, events, comments
```

---

## Common Patterns

### 1. Protected Routes

```typescript
// Authenticated users only
router.post('/items', authenticate, createItem);

// Admin only
router.delete('/items/:id', authenticate, requireAdmin, deleteItem);
```

### 2. Pagination

```typescript
export const getPaginatedItems = async (page: number, limit: number) => {
  const offset = (page - 1) * limit;
  
  const items = await db
    .select()
    .from(table)
    .limit(limit)
    .offset(offset);
  
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(table);
  
  return {
    items,
    pagination: {
      page,
      limit,
      total: count,
      pages: Math.ceil(count / limit),
    },
  };
};
```

### 3. Search & Filter

```typescript
import { ilike, and, or } from "drizzle-orm";

export const searchItems = async (query: string, filters: any) => {
  const conditions = [
    ilike(table.title, `%${query}%`),
    ilike(table.description, `%${query}%`),
  ];
  
  if (filters.category) {
    conditions.push(eq(table.category, filters.category));
  }
  
  return await db
    .select()
    .from(table)
    .where(or(...conditions));
};
```

### 4. Transactions

```typescript
export const complexOperation = async (data: any) => {
  return await db.transaction(async (tx) => {
    // Multiple operations that should succeed or fail together
    const [user] = await tx.insert(users).values(data.user).returning();
    
    await tx.insert(profile).values({
      userId: user.id,
      ...data.profile,
    });
    
    return user;
  });
};
```

---

## Testing

### Manual Testing

```bash
# Test endpoints with curl
curl -X POST http://localhost:3000/api/endpoint \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer TOKEN' \
  -d '{"key": "value"}'

# Test with Swagger UI
# Go to http://localhost:3000/api-docs
```

### Integration Testing (TODO)

```typescript
// Example test structure (not implemented yet)
describe('Users API', () => {
  it('should create a user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'test@test.com', password: 'pass123' });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

---

## Debugging Tips

### 1. Check Logs

```typescript
// Add debug logs
console.log('Debug:', { variable, data });

// Error logs
console.error('Error in operation:', error);
```

### 2. Use Drizzle Studio

```bash
# Visual database viewer
pnpm run studio

# Opens at http://localhost:4983
```

### 3. Test Database Queries

```typescript
// Test query in isolation
const testQuery = async () => {
  const result = await db.select().from(users).limit(1);
  console.log(result);
};
```

### 4. Check Authentication

```bash
# Decode JWT token
# Go to https://jwt.io
# Paste token to see payload
```

### 5. Common Issues

**Issue**: "Cannot find module"
```bash
# Solution: Reinstall dependencies
rm -rf node_modules
pnpm install
```

**Issue**: "Connection refused" (database)
```bash
# Solution: Check DATABASE_URL
echo $DATABASE_URL
# Verify PostgreSQL is running
```

**Issue**: "Unauthorized" on routes
```bash
# Solution: Check JWT token
# Ensure Authorization header: Bearer <token>
```

---

## Useful Commands

```bash
# Development
pnpm run dev              # Start dev server
pnpm run build            # Build for production
pnpm run clean            # Remove build files

# Database
pnpm run gen              # Generate migrations
pnpm run migrate          # Run migrations
pnpm run studio           # Database GUI
pnpm run seed             # Seed data

# Git
git status                # Check changes
git add .                 # Stage changes
git commit -m "message"   # Commit
git push origin branch    # Push to remote
```

---

## Resources

### Documentation
- [Express.js Docs](https://expressjs.com/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

### Internal Docs
- [README](../README.md)
- [API Documentation](./AI_API.md)
- [Deployment Guide](./DEPLOYMENT.md)

### Tools
- [Swagger Editor](https://editor.swagger.io/)
- [Postman](https://www.postman.com/)
- [JWT Debugger](https://jwt.io/)

---

## Getting Help

1. **Check Documentation**: Read relevant docs first
2. **Search Code**: Use VS Code search (Ctrl+Shift+F)
3. **Ask Team**: Reach out on Slack/Discord
4. **Create Issue**: Open GitHub issue with details

---

## Contributing Guidelines

### Pull Request Process

1. Update documentation if needed
2. Test your changes thoroughly
3. Write clear commit messages
4. Ensure code follows style guide
5. Request review from team member

### Commit Message Format

```
Type: Brief description

- Detail 1
- Detail 2

Types: Add, Update, Fix, Remove, Refactor, Docs
```

Examples:
```
Add: User profile endpoint
Fix: JWT token expiration issue
Update: Swagger documentation for blogs API
```

---

## Next Steps

1. ✅ Read this guide
2. ✅ Setup development environment
3. ✅ Run the application locally
4. ✅ Explore API with Swagger
5. ✅ Make a small change to test workflow
6. ✅ Ask questions if stuck!

---

**Happy coding! 🚀**

If you have questions, check the docs or ask the team. Welcome to BITSA Backend development!
