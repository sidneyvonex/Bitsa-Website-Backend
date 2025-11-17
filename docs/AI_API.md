# AI API Documentation

## Overview

The AI API provides intelligent features powered by Groq (Llama 3.3 70B). All AI endpoints have access to your entire database and can provide context-aware responses.

**Base URL**: `/api/ai`

---

## Endpoints

### 1. Chat Assistant

Intelligent chatbot with database context.

**Endpoint**: `POST /api/ai/chat`

**Authentication**: None (Public)

**Request Body**:
```json
{
  "message": "What blogs do you have about machine learning?",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Hello"
    },
    {
      "role": "assistant",
      "content": "Hi! How can I help you?"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "response": "We have several blogs about machine learning including 'Introduction to ML', 'Deep Learning Basics', and 'Neural Networks Explained'.",
    "model": "llama-3.3-70b-versatile"
  }
}
```

**How it works**:
- Searches your database (blogs, events, projects, leaders, reports)
- Provides context-aware responses
- Maintains conversation history

**Example**:
```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "What events are happening this month?"
  }'
```

---

### 2. Smart Search

AI-enhanced search across all content.

**Endpoint**: `GET /api/ai/search`

**Authentication**: None (Public)

**Query Parameters**:
- `query` (required): Search term

**Response**:
```json
{
  "success": true,
  "data": {
    "summary": "I found several results related to 'machine learning' including blogs, events, and projects.",
    "results": {
      "blogs": [...],
      "events": [...],
      "projects": [...],
      "leaders": [...],
      "reports": [...]
    },
    "suggestions": [
      "Try searching for 'deep learning' for more advanced topics",
      "Check out our AI community for discussions"
    ]
  }
}
```

**Example**:
```bash
curl -X GET "http://localhost:3000/api/ai/search?query=cybersecurity"
```

---

### 3. Generate Blog Content

Auto-generate blog posts using AI.

**Endpoint**: `POST /api/ai/generate/blog`

**Authentication**: Admin only

**Request Body**:
```json
{
  "topic": "Introduction to Blockchain Technology",
  "language": "en",
  "tone": "educational",
  "keywords": ["blockchain", "cryptocurrency", "decentralization"]
}
```

**Supported Languages**: `en`, `sw`, `fr`, `id`, `de`, `es`, `it`, `pt`, `ja`

**Tone Options**: `professional`, `casual`, `educational`, `technical`

**Response**:
```json
{
  "success": true,
  "data": {
    "title": "Understanding Blockchain Technology: A Beginner's Guide",
    "content": "Blockchain technology is revolutionizing...",
    "category": "Technology",
    "slug": "understanding-blockchain-technology-beginners-guide"
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/api/ai/generate/blog \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "topic": "Getting Started with Python",
    "language": "en",
    "tone": "educational"
  }'
```

---

### 4. Translate Content

AI-powered translation with cultural adaptation.

**Endpoint**: `POST /api/ai/translate`

**Authentication**: Admin only

**Request Body**:
```json
{
  "title": "Introduction to Artificial Intelligence",
  "body": "Artificial Intelligence is transforming the way we interact with technology...",
  "targetLanguage": "sw"
}
```

**Supported Languages**: `en`, `sw`, `fr`, `id`, `de`, `es`, `it`, `pt`, `ja`

**Response**:
```json
{
  "success": true,
  "data": {
    "title": "Utangulizi wa Akili Bandia",
    "body": "Akili Bandia inabadilisha jinsi tunavyoingiliana na teknolojia..."
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/api/ai/translate \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Welcome to BITSA",
    "body": "We are a community of tech enthusiasts",
    "targetLanguage": "fr"
  }'
```

---

### 5. Generate Event Description

Create engaging event descriptions automatically.

**Endpoint**: `POST /api/ai/generate/event`

**Authentication**: Admin only

**Request Body**:
```json
{
  "title": "Tech Summit 2024",
  "category": "Conference",
  "targetAudience": "Students and tech professionals",
  "topics": ["AI", "Cloud Computing", "Cybersecurity"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "description": "Join us for Tech Summit 2024, a premier conference bringing together students and tech professionals...",
    "highlights": [
      "Keynote speeches from industry leaders",
      "Hands-on workshops",
      "Networking opportunities"
    ]
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/api/ai/generate/event \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Web Development Workshop",
    "category": "Workshop",
    "targetAudience": "Beginners"
  }'
```

---

### 6. Project Feedback

Get AI-powered feedback on student projects.

**Endpoint**: `POST /api/ai/feedback/project`

**Authentication**: Required (any authenticated user)

**Request Body**:
```json
{
  "title": "Smart Campus Navigation App",
  "description": "A mobile application that helps students navigate the campus using AR",
  "techStack": "React Native, TensorFlow, Firebase",
  "problemStatement": "Students get lost on campus",
  "proposedSolution": "AR-based navigation with real-time tracking"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "overallFeedback": "Excellent project idea with strong technical implementation...",
    "strengths": [
      "Clear problem statement",
      "Modern tech stack",
      "Practical use case"
    ],
    "improvements": [
      "Consider offline functionality",
      "Add accessibility features",
      "Plan for scalability"
    ],
    "technicalSuggestions": [
      "Implement caching for better performance",
      "Use Redux for state management",
      "Add unit tests"
    ],
    "rating": 8.5,
    "nextSteps": [
      "Create a prototype",
      "Conduct user testing",
      "Develop MVP"
    ]
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/api/ai/feedback/project \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "E-Learning Platform",
    "description": "Web platform for online courses",
    "techStack": "Next.js, PostgreSQL, AWS"
  }'
```

---

## AI Database Context

The AI has access to the following data:

### Blogs
- Title, content, category, author
- Up to 5 most relevant results per query

### Events
- Title, description, location, dates
- Up to 5 most relevant results per query

### Projects
- Title, description, tech stack, status
- Up to 5 most relevant results per query

### Leaders
- Name, position, year
- Up to 5 most relevant results per query

### Reports
- Title, content, category
- Up to 5 most relevant results per query

**Search Method**: Uses PostgreSQL `ILIKE` for case-insensitive pattern matching across all searchable fields.

---

## Rate Limits

**Groq Free Tier**:
- 14,400 requests per day
- ~600 requests per hour sustained
- ~10 requests per minute sustained

**Model**: `llama-3.3-70b-versatile`

**Speed**: ~800 tokens/second

---

## Error Handling

All AI endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**Common Errors**:
- `400` - Bad Request (missing required fields)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `500` - Internal Server Error (AI service error)

---

## Best Practices

### 1. Chat Assistant
- Provide conversation history for context
- Keep messages concise and clear
- Ask specific questions for better results

### 2. Content Generation
- Provide detailed topics and keywords
- Specify the target audience
- Review and edit AI-generated content

### 3. Translation
- Use for initial translation, then review
- Consider cultural context
- Test with native speakers

### 4. Project Feedback
- Provide complete project details
- Include problem statement and solution
- Use feedback for iteration

---

## Configuration

Set your Groq API key in `.env`:

```env
GROQ_API_KEY=gsk_your_api_key_here
```

**Get a free API key**: [console.groq.com/keys](https://console.groq.com/keys)

---

## Examples

### Complete Chat Conversation

```bash
# First message
curl -X POST http://localhost:3000/api/ai/chat \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "Tell me about BITSA"
  }'

# Follow-up with history
curl -X POST http://localhost:3000/api/ai/chat \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "What events do you organize?",
    "conversationHistory": [
      {
        "role": "user",
        "content": "Tell me about BITSA"
      },
      {
        "role": "assistant",
        "content": "BITSA is the Baraton IT Student Association..."
      }
    ]
  }'
```

### Bulk Translation Workflow

```javascript
// Translate blog to multiple languages
const languages = ['sw', 'fr', 'es'];
const blog = { title: "AI Basics", body: "Content..." };

for (const lang of languages) {
  const response = await fetch('/api/ai/translate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: blog.title,
      body: blog.body,
      targetLanguage: lang
    })
  });
  
  const translation = await response.json();
  // Save translation to database
}
```

---

## Support

For issues or questions about AI features:
- Check Groq API status: [status.groq.com](https://status.groq.com)
- Review Groq documentation: [console.groq.com/docs](https://console.groq.com/docs)
- Open an issue on GitHub
