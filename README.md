# BITSA Website Backend

<div align="center">

![BITSA Logo](https://via.placeholder.com/150x150?text=BITSA)

**Backend API for the BITSA (Baraton IT Student Association) Website**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.1.0-green)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-0.44.7-orange)](https://orm.drizzle.team/)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Authentication](#authentication)
- [Multi-Language Support](#multi-language-support)
- [AI Integration](#ai-integration)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

The BITSA Website Backend is a comprehensive REST API built with **TypeScript**, **Express.js**, and **PostgreSQL**. It powers the BITSA student association platform, providing features for user management, content publishing, event organization, project showcasing, and AI-powered assistance.

### Key Highlights

-**JWT Authentication** with role-based access control (Student, Admin, SuperAdmin)
-**Multi-Language Support** (9 languages: English, Swahili, French, Indonesian, German, Spanish, Italian, Portuguese, Japanese)
-**AI Integration** powered by Groq (Llama 3.3 70B) with intelligent database search
-**Comprehensive API** for blogs, events, projects, communities, partners, and reports
-**Audit System** for tracking all administrative actions
-**Email Service** with Gmail integration
-**Swagger Documentation** for all API endpoints

---

## Features

### User Management
- User registration and authentication
- Role-based access control (student, admin, superadmin)
- Profile management with language preferences
- Email verification system
- Password reset functionality

### Content Management
- **Blogs**: Create, read, update, delete with multi-language support
- **Events**: Event management with registration tracking
- **Projects**: Student project showcase and submission
- **Reports**: Annual and event reports
- **Leaders**: Current and past leadership information
- **Communities**: WhatsApp community groups management
- **Partners**: Partnership and sponsor information

### AI Features (Powered by Groq)
-**AI Chat Assistant** - Intelligent chatbot with database context
-**Smart Search** - AI-enhanced search across all content
-**Content Generation** - Auto-generate blogs and event descriptions
-**AI Translation** - Translate content to 9 languages
-**Project Feedback** - AI-powered project reviews and suggestions

### Interests & Projects
- Interest-based user categorization
- Project submission and management
- Student interest tracking

### Audit & Security
- Comprehensive audit logging
- Bearer token authentication
- Input validation and sanitization
- Rate limiting and security headers

---

##  Tech Stack

### Core Technologies
- **TypeScript 5.9.3** - Type-safe JavaScript
- **Node.js** - JavaScript runtime
- **Express.js 5.1.0** - Web framework
- **PostgreSQL** - Relational database
- **Drizzle ORM 0.44.7** - TypeScript ORM

### AI & ML
- **Groq SDK 0.8.0** - AI model integration
- **Llama 3.3 70B Versatile** - Large language model

### Authentication & Security
- **jsonwebtoken** - JWT authentication
- **bcrypt** - Password hashing
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing

### Documentation & Development
- **Swagger/OpenAPI** - API documentation
- **tsx** - TypeScript execution
- **drizzle-kit** - Database migrations

---

##  Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **pnpm** (v8 or higher) - `npm install -g pnpm`
- **PostgreSQL** (v14 or higher)
- **Git**

### Required Accounts
- **Neon Database** (or any PostgreSQL provider) - [neon.tech](https://neon.tech)
- **Groq API** (for AI features) - [console.groq.com](https://console.groq.com)
- **Gmail Account** (for email service)

---

##  Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Bitsa-Website-Backend.git
cd Bitsa-Website-Backend
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL='postgresql://user:password@host/database?sslmode=require'

# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL='http://localhost:5173'

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (Gmail)
EMAIL_SENDER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM_NAME=BITSA
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true

# Email Verification
EMAIL_VERIFICATION_REQUIRED=false
VERIFICATION_TOKEN_EXPIRY=24h

# Groq AI
GROQ_API_KEY=your-groq-api-key
```

### 4. Set Up Database

Generate and run migrations:

```bash
# Generate migration files
pnpm run gen

# Run migrations
pnpm run push

# Seed database with demo data
pnpm run seed
```

### 5. Start Development Server

```bash
pnpm run dev
```

The server will start at `http://localhost:3000`

### 6. Access API Documentation

Open your browser and navigate to:
- **Swagger UI**: `http://localhost:3000/api-docs`

---

##  Project Structure

```
Bitsa-Website-Backend/
├── Src/
│   ├── AI/                      # AI integration (Groq)
│   │   ├── ai.controller.ts     # AI controllers
│   │   ├── ai.routes.ts         # AI routes
│   │   └── ai.service.ts        # AI service logic
│   ├── Auth/                    # Authentication
│   │   ├── auth.controller.ts
│   │   ├── auth.routes.ts
│   │   └── auth.service.ts
│   ├── Audit/                   # Audit logging
│   ├── Blogs/                   # Blog management
│   ├── Communities/             # Communities
│   ├── drizzle/                 # Database
│   │   ├── db.ts               # Database connection
│   │   ├── schema.ts           # Database schema
│   │   ├── seed.ts             # Seed data
│   │   └── migrations/         # Migration files
│   ├── Emails/                  # Email service
│   ├── Events/                  # Event management
│   ├── Interests/               # Interest management
│   ├── Leaders/                 # Leadership info
│   ├── Middleware/              # Custom middleware
│   │   ├── auditLogger.ts      # Audit middleware
│   │   ├── bearAuth.ts         # JWT authentication
│   │   └── googleMailer.ts     # Email middleware
│   ├── Partners/                # Partner management
│   ├── Projects/                # Project showcase
│   ├── Reports/                 # Reports
│   ├── Users/                   # User management
│   ├── Utils/                   # Utility functions
│   │   └── i18n.helper.ts      # Multi-language helpers
│   ├── Validation/              # Input validation
│   ├── app.ts                   # Express app setup
│   ├── server.ts                # Server entry point
│   └── swagger.ts               # Swagger configuration
├── docs/                        # Documentation
├── .env                         # Environment variables
├── .gitignore
├── drizzle.config.ts           # Drizzle configuration
├── package.json
├── tsconfig.json
└── README.md
```

---

##  API Documentation

### Base URL
```
http://localhost:3000/api
```

### Available Modules

| Module | Endpoint | Description |
|--------|----------|-------------|
| **Auth** | `/api/auth` | Registration, login, password reset |
| **Users** | `/api/users` | User profile, language preferences |
| **Blogs** | `/api/blogs` | Blog CRUD operations |
| **Events** | `/api/events` | Event management |
| **Projects** | `/api/projects` | Student projects |
| **Interests** | `/api/interests` | User interests |
| **Communities** | `/api/communities` | Community groups |
| **Leaders** | `/api/leaders` | Leadership information |
| **Partners** | `/api/partners` | Partnership management |
| **Reports** | `/api/reports` | Reports management |
| **Audit** | `/api/audit` | Audit logs (admin) |
| **AI** | `/api/ai` | AI-powered features |

### Interactive Documentation

Access the full interactive API documentation at:
- **Swagger UI**: `http://localhost:3000/api-docs`

### Quick Reference Guides

For detailed API documentation, see:
- [Authentication API](./docs/AUTH_API.md)
- [Users API](./USERS_API.md)
- [Blogs API](./docs/BLOGS_API.md)
- [Events API](./docs/EVENTS_API.md)
- [AI API](./docs/AI_API.md)
- [Interests & Projects API](./INTERESTS_PROJECTS_API.md)

---

##  Authentication

### JWT Bearer Token

All protected routes require a JWT bearer token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **student** - Regular students, can view content and submit projects
- **admin** - Can create/edit content (blogs, events, etc.)
- **superadmin** - Full system access, user management

### Getting Started

1. **Register**: `POST /api/auth/register`
2. **Login**: `POST /api/auth/login` - Returns JWT token
3. **Use Token**: Include in Authorization header for protected routes

### Example Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin@bitsa.com",
    "password": "admin123"
  }'
```

---

##  Multi-Language Support

### Supported Languages

The system supports 9 languages:

| Code | Language | Native Name |
|------|----------|-------------|
| `en` | English | English |
| `sw` | Swahili | Kiswahili |
| `fr` | French | Français |
| `id` | Indonesian | Bahasa Indonesia |
| `de` | German | Deutsch |
| `es` | Spanish | Español |
| `it` | Italian | Italiano |
| `pt` | Portuguese | Português |
| `ja` | Japanese | 日本語 |

### How It Works

1. **User Preference**: Each user can set their preferred language
2. **Auto-Detection**: System detects language from:
   - Query parameter: `?lang=sw`
   - User profile preference
   - Accept-Language header
   - Default: English

3. **Translation Tables**: Separate tables for blog, event, and report translations

### Setting User Language

```bash
PUT /api/users/me/language
Content-Type: application/json
Authorization: Bearer <token>

{
  "language": "sw"
}
```

### Translation Workflow

Admins can use the AI translation endpoint:

```bash
POST /api/ai/translate
Authorization: Bearer <admin-token>

{
  "title": "Introduction to AI",
  "body": "AI is transforming technology...",
  "targetLanguage": "sw"
}
```

---

##  AI Integration

### Powered by Groq

The backend integrates **Groq AI** (Llama 3.3 70B) for intelligent features with **real-time database access**.

### ✨ Real-Time Data Fetching

The AI assistant now fetches **actual, real-time data** from your database and provides specific, accurate responses instead of generic placeholders.

**Features:**
- ✅ Queries database in real-time for every request
- ✅ Returns actual titles, dates, locations, and descriptions
- ✅ Automatically detects general vs. specific queries
- ✅ Validates responses to prevent generic placeholders
- ✅ Auto-retries if response quality is poor

**See:** [docs/AI_REAL_TIME_DATA.md](docs/AI_REAL_TIME_DATA.md) for implementation details.

**Test it:**
```bash
# Run automated tests
./test-ai-realtime.sh

# Or test manually
curl -X POST http://localhost:3000/api/ai/chat \
  -H 'Content-Type: application/json' \
  -d '{"message": "What events do you have?"}'
```

### AI Features

#### 1. Chat Assistant
```bash
POST /api/ai/chat
{
  "message": "What blogs do you have about AI?",
  "conversationHistory": []
}
```

**Response:** Real-time data from your database with actual blog titles, categories, and content previews.

#### 2. Smart Search
```bash
GET /api/ai/search?query=machine learning
```

#### 3. Generate Blog Content
```bash
POST /api/ai/generate/blog
Authorization: Bearer <admin-token>
{
  "topic": "Introduction to Blockchain",
  "language": "en",
  "tone": "educational"
}
```

#### 4. Translate Content
```bash
POST /api/ai/translate
Authorization: Bearer <admin-token>
{
  "title": "Hello World",
  "body": "This is a test",
  "targetLanguage": "sw"
}
```

#### 5. Project Feedback
```bash
POST /api/ai/feedback/project
Authorization: Bearer <token>
{
  "title": "Smart Campus App",
  "description": "Mobile app for campus navigation",
  "techStack": "React Native, Firebase"
}
```

#### 6. Event Description Generator
```bash
POST /api/ai/generate/event
Authorization: Bearer <admin-token>
{
  "title": "Tech Summit 2024",
  "category": "Conference",
  "targetAudience": "Students and professionals"
}
```

### AI Configuration

Set your Groq API key in `.env`:

```env
GROQ_API_KEY=gsk_your_api_key_here
```

Get a free API key at: [console.groq.com/keys](https://console.groq.com/keys)

**Free Tier**: 14,400 requests/day

---

##  Scripts

```json
{
  "dev": "Start development server with hot reload",
  "build": "Compile TypeScript to JavaScript",
  "start": "Start production server",
  "gen": "Generate database migrations",
  "studio": "Open Drizzle Studio (database GUI)",
  "push": "Push schema changes to database",
  "seed": "Seed database with demo data",
  "clean": "Remove compiled files"
}
```

### Common Commands

```bash
# Development
pnpm run dev

# Database
pnpm run gen        # Generate migrations
pnpm run migrate    # Apply migrations
pnpm run seed       # Seed demo data
pnpm run studio     # Open database GUI

# Production
pnpm run build
pnpm run start
```

---

##  Database

### Schema Overview

- **users** - User accounts and profiles
- **interests** - Technology interests
- **userInterests** - User-to-interest mapping
- **blogs** - Blog posts
- **blogTranslations** - Blog translations
- **events** - Events and workshops
- **eventTranslations** - Event translations
- **projects** - Student projects
- **leaders** - Leadership information
- **communities** - Community groups
- **partners** - Partnership information
- **reports** - Reports and documents
- **reportTranslations** - Report translations
- **auditLogs** - System audit trail

### Migrations

```bash
# Generate migration after schema changes
pnpm run gen

# Apply migrations
pnpm run migrate

# View database (GUI)
pnpm run studio
```

### Seeding

The seed script creates comprehensive demo data:

- 5 Users (1 superadmin, 1 admin, 3 students)
- 20 Interests
- 3 Blogs with translations
- 3 Events with translations
- 3 Projects
- 4 Leaders
- 4 Communities
- 3 Partners
- 2 Reports with translations

**Run seed:**
```bash
pnpm run seed
```

**Login Credentials:**
```
SuperAdmin: admin@bitsa.com / admin123
Admin: john.admin@bitsa.com / admin123
Student: john.doe@student.ueab.ac.ke / student123
```

---

##  Environment Variables

### Required Variables

```env
# Database (Required)
DATABASE_URL=postgresql://...

# JWT (Required)
JWT_SECRET=your-secret-key

# Email (Required for email features)
EMAIL_SENDER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# AI (Required for AI features)
GROQ_API_KEY=gsk_...

# Server (Optional)
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Getting Gmail App Password

1. Enable 2-Factor Authentication on your Gmail
2. Go to: https://myaccount.google.com/apppasswords
3. Generate new app password
4. Use it in `EMAIL_PASSWORD`

---

##  Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript
- Follow existing code structure
- Add comments for complex logic
- Update documentation
- Test your changes

---

##  Additional Documentation

- [Quick Start Guide](./QUICK_START.md)
- [Users API Reference](./USERS_API.md)
- [Users Quick Reference](./USERS_QUICK_REF.md)
- [Interests & Projects API](./INTERESTS_PROJECTS_API.md)
- [Interests & Projects Quick Reference](./INTERESTS_PROJECTS_QUICK.md)
- [Audit System Documentation](./AUDIT_SYSTEM.md)
- [Audit Quick Reference](./AUDIT_QUICK_REF.md)
- [Refresh Token Setup](./REFRESH_TOKEN_SETUP.md)

---

##  License

This project is licensed under the ISC License.

---

## Team

Developed with ❤️ by Sidney, Stancy and Silvia for The BITSA Club

**University of Eastern Africa, Baraton**

---

##  Support

For questions or support:
- **Email**: admin@bitsa.com
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/Bitsa-Website-Backend/issues)

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with TypeScript, Express, and lots of ☕

</div>
