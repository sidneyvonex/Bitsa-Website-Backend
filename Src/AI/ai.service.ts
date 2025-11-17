import Groq from "groq-sdk";
import db from "../drizzle/db";
import { blogs, events, projects, users, interests, leaders, reports } from "../drizzle/schema";
import { eq, ilike, or, desc, sql } from "drizzle-orm";

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

const MODEL = "llama-3.3-70b-versatile";

/**
 * Get relevant context from database based on user query
 */
export const getContextFromDatabase = async (query: string): Promise<string> => {
  const searchTerm = `%${query.toLowerCase()}%`;
  
  // Search across all tables in parallel
  const [blogsData, eventsData, projectsData, leadersData, reportsData] = await Promise.all([
    // Search blogs
    db.select({
      type: sql<string>`'blog'`,
      title: blogs.title,
      content: blogs.content,
      category: blogs.category,
    })
      .from(blogs)
      .where(
        or(
          ilike(blogs.title, searchTerm),
          ilike(blogs.content, searchTerm),
          ilike(blogs.category, searchTerm)
        )
      )
      .limit(5),

    // Search events
    db.select({
      type: sql<string>`'event'`,
      title: events.title,
      description: events.description,
      locationName: events.locationName,
      startDate: events.startDate,
    })
      .from(events)
      .where(
        or(
          ilike(events.title, searchTerm),
          ilike(events.description, searchTerm),
          ilike(events.locationName, searchTerm)
        )
      )
      .limit(5),

    // Search projects
    db.select({
      type: sql<string>`'project'`,
      title: projects.title,
      description: projects.description,
      status: projects.status,
    })
      .from(projects)
      .where(
        or(
          ilike(projects.title, searchTerm),
          ilike(projects.description, searchTerm)
        )
      )
      .limit(5),

    // Search leaders
    db.select({
      type: sql<string>`'leader'`,
      fullName: leaders.fullName,
      position: leaders.position,
      academicYear: leaders.academicYear,
    })
      .from(leaders)
      .where(
        or(
          ilike(leaders.fullName, searchTerm),
          ilike(leaders.position, searchTerm)
        )
      )
      .limit(5),

    // Search reports
    db.select({
      type: sql<string>`'report'`,
      title: reports.title,
      content: reports.content,
    })
      .from(reports)
      .where(
        or(
          ilike(reports.title, searchTerm),
          ilike(reports.content, searchTerm)
        )
      )
      .limit(3),
  ]);

  // Format context
  let context = "BITSA Website Database Context:\n\n";

  if (blogsData.length > 0) {
    context += "=== BLOGS ===\n";
    blogsData.forEach((blog: any) => {
      context += `- ${blog.title} (Category: ${blog.category})\n  ${blog.content.substring(0, 200)}...\n\n`;
    });
  }

  if (eventsData.length > 0) {
    context += "=== EVENTS ===\n";
    eventsData.forEach((event: any) => {
      context += `- ${event.title} at ${event.locationName}\n  ${event.description.substring(0, 150)}...\n  Date: ${event.startDate}\n\n`;
    });
  }

  if (projectsData.length > 0) {
    context += "=== PROJECTS ===\n";
    projectsData.forEach((project: any) => {
      context += `- ${project.title} (Status: ${project.status})\n  ${project.description.substring(0, 150)}...\n\n`;
    });
  }

  if (leadersData.length > 0) {
    context += "=== LEADERS ===\n";
    leadersData.forEach((leader: any) => {
      context += `- ${leader.fullName} - ${leader.position} (${leader.academicYear})\n`;
    });
    context += "\n";
  }

  if (reportsData.length > 0) {
    context += "=== REPORTS ===\n";
    reportsData.forEach((report: any) => {
      context += `- ${report.title}\n  ${report.content.substring(0, 150)}...\n\n`;
    });
  }

  return context || "No relevant information found in the database.";
};

/**
 * AI Chat - Answer questions using database context
 */
export const aiChatService = async (
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<string> => {
  // Get relevant context from database
  const context = await getContextFromDatabase(userMessage);

  const systemPrompt = `You are an AI assistant for BITSA (BitSa Technology and Innovation Society), a tech club at the University of Eastern Africa, Baraton in Kenya.

Your role is to help students, members, and visitors by answering questions about:
- Blog posts and articles
- Upcoming and past events
- Student projects and submissions
- Club leaders and their roles
- Reports and documents
- General information about BITSA

Use the provided database context to give accurate, helpful, and friendly responses. If you don't have enough information, say so politely.

Always be encouraging and supportive, especially when discussing student projects and achievements.

Database Context:
${context}`;

  const messages: any[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 1024,
  });

  return completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
};

/**
 * Generate blog content in any language
 */
export const generateBlogContentService = async (
  topic: string,
  category: string,
  language: string = "en",
  tone: "professional" | "casual" | "academic" = "professional"
): Promise<{ title: string; content: string; slug: string }> => {
  const languageNames: Record<string, string> = {
    en: "English",
    sw: "Kiswahili (Swahili)",
    fr: "French",
    id: "Indonesian",
    de: "German",
    es: "Spanish",
    it: "Italian",
    pt: "Portuguese",
    ja: "Japanese",
  };

  const prompt = `Write a ${tone} blog post about "${topic}" for a university tech club (BITSA) in ${languageNames[language] || "English"}.

Category: ${category}

Requirements:
- Write entirely in ${languageNames[language] || "English"}
- Make it engaging and informative for students
- Include practical examples or tips
- Length: 500-800 words
- Use proper formatting with paragraphs

Format your response as JSON:
{
  "title": "Blog title in ${languageNames[language]}",
  "content": "Full blog content with paragraphs"
}`;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
    max_tokens: 2048,
    response_format: { type: "json_object" },
  });

  const response = JSON.parse(completion.choices[0]?.message?.content || "{}");
  
  // Generate slug from title
  const slug = response.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

  return {
    title: response.title,
    content: response.content,
    slug,
  };
};

/**
 * Translate content to target language
 */
export const translateContentService = async (
  content: { title: string; body: string },
  targetLanguage: string
): Promise<{ title: string; body: string }> => {
  const languageNames: Record<string, string> = {
    en: "English",
    sw: "Kiswahili (Swahili)",
    fr: "French",
    id: "Indonesian",
    de: "German",
    es: "Spanish",
    it: "Italian",
    pt: "Portuguese",
    ja: "Japanese",
  };

  const prompt = `Translate the following content to ${languageNames[targetLanguage] || targetLanguage}.

Maintain the tone, style, and formatting. Ensure the translation is natural and culturally appropriate for ${languageNames[targetLanguage]} speakers.

Original content:
Title: ${content.title}
Body: ${content.body}

Provide the translation in JSON format:
{
  "title": "translated title",
  "body": "translated body"
}`;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 2048,
    response_format: { type: "json_object" },
  });

  return JSON.parse(completion.choices[0]?.message?.content || "{}");
};

/**
 * Generate project feedback and suggestions
 */
export const generateProjectFeedbackService = async (
  projectTitle: string,
  projectDescription: string,
  techStack?: string
): Promise<{ feedback: string; suggestions: string[]; rating: number }> => {
  const prompt = `As a tech mentor, review this student project:

Title: ${projectTitle}
Description: ${projectDescription}
${techStack ? `Tech Stack: ${techStack}` : ""}

Provide constructive feedback and improvement suggestions.

Format your response as JSON:
{
  "feedback": "Detailed constructive feedback (2-3 paragraphs)",
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
  "rating": 7.5
}

Rating should be 0-10 based on innovation, technical complexity, and practical value.`;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 1024,
    response_format: { type: "json_object" },
  });

  return JSON.parse(completion.choices[0]?.message?.content || "{}");
};

/**
 * Generate event description
 */
export const generateEventDescriptionService = async (
  eventTitle: string,
  eventType: string,
  targetAudience: string,
  language: string = "en"
): Promise<string> => {
  const languageNames: Record<string, string> = {
    en: "English",
    sw: "Kiswahili",
    fr: "French",
    id: "Indonesian",
    de: "German",
    es: "Spanish",
    it: "Italian",
    pt: "Portuguese",
    ja: "Japanese",
  };

  const prompt = `Write an engaging event description for a university tech club event in ${languageNames[language]}.

Event: ${eventTitle}
Type: ${eventType}
Audience: ${targetAudience}

Write 2-3 paragraphs that:
- Explain what attendees will learn/experience
- Highlight the benefits of attending
- Create excitement and encourage registration
- Use an encouraging and welcoming tone

Write entirely in ${languageNames[language]}.`;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
    max_tokens: 512,
  });

  return completion.choices[0]?.message?.content || "";
};

/**
 * Smart search with AI-enhanced results
 */
export const aiSearchService = async (query: string): Promise<any> => {
  const context = await getContextFromDatabase(query);
  
  const prompt = `Based on this search query: "${query}"

And this database content:
${context}

Provide a structured summary of the most relevant information. Format as JSON:
{
  "summary": "Brief summary of findings",
  "relevantItems": [
    { "type": "blog/event/project", "title": "...", "relevance": "why it matches" }
  ],
  "suggestions": ["Related search suggestion 1", "Related search suggestion 2"]
}`;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    max_tokens: 1024,
    response_format: { type: "json_object" },
  });

  return JSON.parse(completion.choices[0]?.message?.content || "{}");
};
