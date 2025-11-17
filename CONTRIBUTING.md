# Contributing to BITSA Backend

Thank you for your interest in contributing to the BITSA Backend project! 🎉

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards others

**Unacceptable behavior includes:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL 14+
- Git

### Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/Bitsa-Website-Backend.git
cd Bitsa-Website-Backend

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/Bitsa-Website-Backend.git
```

### Setup Development Environment

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env
# Edit .env with your local configuration

# Setup database
pnpm run migrate
pnpm run seed

# Start development server
pnpm run dev
```

---

## Development Process

### 1. Choose an Issue

- Browse [open issues](https://github.com/ORIGINAL_OWNER/Bitsa-Website-Backend/issues)
- Look for issues tagged with `good first issue` for beginners
- Comment on the issue to express interest

### 2. Create a Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

**Branch naming conventions:**
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/what-changed` - Documentation updates
- `refactor/what-changed` - Code refactoring

### 3. Make Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 4. Test Locally

```bash
# Start dev server
pnpm run dev

# Test your endpoints
curl http://localhost:3000/api/your-endpoint

# Check Swagger docs
open http://localhost:3000/api-docs
```

### 5. Commit Changes

```bash
# Stage changes
git add .

# Commit with clear message
git commit -m "Add: feature description"

# Push to your fork
git push origin feature/your-feature-name
```

---

## Pull Request Process

### 1. Before Submitting

**Checklist:**
- ✅ Code follows project style guide
- ✅ All tests pass (if any)
- ✅ Documentation updated (if needed)
- ✅ Commit messages are clear
- ✅ No merge conflicts with main
- ✅ `.env` file not committed

### 2. Submit Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select base: `main` ← compare: `your-branch`
4. Fill out the PR template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
How you tested these changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #issue_number
```

### 3. Code Review

- Respond to reviewer feedback
- Make requested changes
- Push updates to your branch (PR auto-updates)

### 4. Merge

Once approved:
- Maintainer will merge your PR
- Delete your feature branch
- Celebrate! 🎉

---

## Coding Standards

### TypeScript

```typescript
// ✅ Good: Type annotations, clear names
export const getUserById = async (
  userId: string
): Promise<User | null> => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  return user || null;
};

// ❌ Bad: No types, unclear logic
export const getUser = async (id) => {
  return await db.select().from(users).where(eq(users.id, id)).limit(1);
};
```

### Error Handling

```typescript
// ✅ Good: Comprehensive error handling
try {
  const result = await operation();
  return res.status(200).json({
    success: true,
    data: result,
  });
} catch (error: any) {
  console.error("Operation failed:", error);
  return res.status(500).json({
    success: false,
    error: error.message || "Operation failed",
  });
}

// ❌ Bad: Generic error handling
try {
  const result = await operation();
  return res.json(result);
} catch (e) {
  return res.status(500).send("Error");
}
```

### API Responses

```typescript
// ✅ Good: Consistent format
{
  "success": true,
  "data": { ... }
}

{
  "success": false,
  "error": "Error message"
}

// ❌ Bad: Inconsistent
{ "result": { ... } }
{ "error": true, "msg": "..." }
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| **Services** | `verbNounService` | `createUserService` |
| **Controllers** | `verbNoun` | `createUser` |
| **Routes** | HTTP verb + path | `router.post('/users')` |
| **Variables** | camelCase | `userId`, `blogTitle` |
| **Constants** | UPPER_SNAKE_CASE | `MAX_ITEMS` |
| **Types/Interfaces** | PascalCase | `User`, `BlogPost` |

---

## Commit Guidelines

### Format

```
Type: Brief description (50 chars max)

- Detailed point 1
- Detailed point 2
- Detailed point 3
```

### Types

- **Add**: New feature or functionality
- **Fix**: Bug fix
- **Update**: Modify existing feature
- **Remove**: Delete code or feature
- **Refactor**: Code restructuring
- **Docs**: Documentation changes
- **Style**: Code formatting (no logic change)
- **Test**: Add or update tests

### Examples

```bash
# Good commits
git commit -m "Add: AI chat endpoint with database context"
git commit -m "Fix: JWT token expiration validation"
git commit -m "Update: Swagger documentation for blogs API"
git commit -m "Docs: Add deployment guide"

# Bad commits
git commit -m "updates"
git commit -m "fix bug"
git commit -m "wip"
```

### Commit Frequency

- Commit often (logical checkpoints)
- One feature/fix per commit when possible
- Avoid huge commits with multiple changes

---

## Testing

### Manual Testing

```bash
# Test with curl
curl -X POST http://localhost:3000/api/endpoint \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer TOKEN' \
  -d '{"key": "value"}'

# Test with Swagger UI
open http://localhost:3000/api-docs
```

### Test Checklist

Before submitting PR, test:
- ✅ Endpoint returns correct status codes
- ✅ Success responses match expected format
- ✅ Error handling works properly
- ✅ Authentication/authorization works
- ✅ Database changes persist correctly
- ✅ No console errors

### Database Testing

```bash
# View data in Drizzle Studio
pnpm run studio

# Check data in PostgreSQL
psql $DATABASE_URL
\dt          # List tables
SELECT * FROM users LIMIT 5;
```

---

## Documentation

### When to Update Docs

Update documentation when you:
- Add new API endpoints
- Change existing endpoints
- Add new features
- Modify environment variables
- Change setup process

### Files to Update

| File | When to Update |
|------|---------------|
| `README.md` | Major features, setup changes |
| `docs/API_DOCS.md` | New/changed endpoints |
| `docs/DEVELOPER_GUIDE.md` | New patterns, conventions |
| `Swagger comments` | Always for new endpoints |

### Swagger Documentation

Always add Swagger comments for new routes:

```typescript
/**
 * @swagger
 * /api/endpoint:
 *   post:
 *     summary: Brief description
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 description: Field description
 *     responses:
 *       201:
 *         description: Success response
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/endpoint', authenticate, controller);
```

---

## Common Tasks

### Adding a New Endpoint

1. **Define route** in `module.routes.ts`
2. **Create controller** in `module.controller.ts`
3. **Add service logic** in `module.service.ts`
4. **Update schema** if database changes needed
5. **Add Swagger docs**
6. **Test endpoint**

### Adding Database Table

1. **Add to schema** in `Src/drizzle/schema.ts`
2. **Generate migration**: `pnpm run gen`
3. **Review migration** in `migrations/` folder
4. **Run migration**: `pnpm run migrate`
5. **Update seed** if needed

### Adding Middleware

1. **Create** in `Src/Middleware/your-middleware.ts`
2. **Export** middleware function
3. **Apply to routes** where needed
4. **Test** with protected routes

---

## Getting Help

### Resources

- **Documentation**: Check `/docs` folder
- **Swagger**: http://localhost:3000/api-docs
- **Issues**: Browse existing issues on GitHub

### Ask Questions

- **GitHub Discussions**: For general questions
- **GitHub Issues**: For bug reports or feature requests
- **Discord/Slack**: For quick questions (if available)

### Report Bugs

Use this template:

```markdown
**Describe the bug**
Clear description of the issue

**To Reproduce**
1. Step 1
2. Step 2
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g., Ubuntu 22.04]
- Node version: [e.g., 18.17.0]
- Database: [e.g., PostgreSQL 14]
```

---

## Recognition

Contributors will be:
- Listed in project contributors
- Mentioned in release notes
- Credited in documentation

Thank you for making BITSA Backend better! 🙌

---

## License

By contributing, you agree that your contributions will be licensed under the project's ISC License.
