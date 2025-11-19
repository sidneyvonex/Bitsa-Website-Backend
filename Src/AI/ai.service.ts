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
 * Helper function to detect if query is asking for general/all items
 */
const isGeneralQuery = (query: string): boolean => {
  const generalPatterns = [
    /what.*do you have/i,
    /show.*all/i,
    /list.*all/i,
    /what.*are.*available/i,
    /tell me about.*events/i,
    /upcoming events/i,
    /what events/i,
    /what blogs/i,
    /what projects/i,
    /show me.*events/i,
    /show me.*blogs/i,
    /show me.*projects/i,
  ];

  return generalPatterns.some(pattern => pattern.test(query));
};

/**
 * Get relevant context from database based on user query
 */
export const getContextFromDatabase = async (query: string): Promise<string> => {
  const searchTerm = `%${query.toLowerCase()}%`;
  const isGeneral = isGeneralQuery(query);

  // For general queries, fetch more data; for specific queries, use search
  const [blogsData, eventsData, projectsData, leadersData, reportsData] = await Promise.all([
    // Search blogs
    isGeneral
      ? db.select({
        type: sql<string>`'blog'`,
        title: blogs.title,
        content: blogs.content,
        category: blogs.category,
        createdAt: blogs.createdAt,
      })
        .from(blogs)
        .orderBy(desc(blogs.createdAt))
        .limit(10)
      : db.select({
        type: sql<string>`'blog'`,
        title: blogs.title,
        content: blogs.content,
        category: blogs.category,
        createdAt: blogs.createdAt,
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
    isGeneral
      ? db.select({
        type: sql<string>`'event'`,
        title: events.title,
        description: events.description,
        locationName: events.locationName,
        startDate: events.startDate,
        endDate: events.endDate,
      })
        .from(events)
        .orderBy(desc(events.startDate))
        .limit(10)
      : db.select({
        type: sql<string>`'event'`,
        title: events.title,
        description: events.description,
        locationName: events.locationName,
        startDate: events.startDate,
        endDate: events.endDate,
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
    isGeneral
      ? db.select({
        type: sql<string>`'project'`,
        title: projects.title,
        description: projects.description,
        status: projects.status,
      })
        .from(projects)
        .limit(10)
      : db.select({
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
    isGeneral
      ? db.select({
        type: sql<string>`'leader'`,
        fullName: leaders.fullName,
        position: leaders.position,
        academicYear: leaders.academicYear,
      })
        .from(leaders)
        .limit(10)
      : db.select({
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

  // Format context with clear data counts
  let context = "=== REAL-TIME DATABASE DATA (CURRENT AS OF NOW) ===\n\n";

  const totalResults = blogsData.length + eventsData.length + projectsData.length + leadersData.length + reportsData.length;

  if (blogsData.length > 0) {
    context += `=== BLOGS (${blogsData.length} found) ===\n`;
    blogsData.forEach((blog: any) => {
      context += `📝 Title: ${blog.title}\n`;
      context += `   Category: ${blog.category}\n`;
      context += `   Date: ${blog.createdAt}\n`;
      context += `   Content Preview: ${blog.content.substring(0, 200)}...\n\n`;
    });
  } else {
    context += "=== BLOGS ===\nNo blogs found in database.\n\n";
  }

  if (eventsData.length > 0) {
    context += `=== EVENTS (${eventsData.length} found) ===\n`;
    eventsData.forEach((event: any) => {
      context += `📅 Event: ${event.title}\n`;
      context += `   Location: ${event.locationName}\n`;
      context += `   Start Date: ${event.startDate}\n`;
      context += `   End Date: ${event.endDate}\n`;
      context += `   Description: ${event.description.substring(0, 200)}...\n\n`;
    });
  } else {
    context += "=== EVENTS ===\nNo events found in database.\n\n";
  }

  if (projectsData.length > 0) {
    context += `=== PROJECTS (${projectsData.length} found) ===\n`;
    projectsData.forEach((project: any) => {
      context += `🚀 Project: ${project.title}\n`;
      context += `   Status: ${project.status}\n`;
      context += `   Description: ${project.description.substring(0, 200)}...\n\n`;
    });
  } else {
    context += "=== PROJECTS ===\nNo projects found in database.\n\n";
  }

  if (leadersData.length > 0) {
    context += `=== LEADERS (${leadersData.length} found) ===\n`;
    leadersData.forEach((leader: any) => {
      context += `👤 ${leader.fullName} - ${leader.position} (${leader.academicYear})\n`;
    });
    context += "\n";
  } else {
    context += "=== LEADERS ===\nNo leaders found in database.\n\n";
  }

  if (reportsData.length > 0) {
    context += `=== REPORTS (${reportsData.length} found) ===\n`;
    reportsData.forEach((report: any) => {
      context += `📊 ${report.title}\n`;
      context += `   Content Preview: ${report.content.substring(0, 150)}...\n\n`;
    });
  } else {
    context += "=== REPORTS ===\nNo reports found in database.\n\n";
  }

  context += `\n=== TOTAL RESULTS: ${totalResults} items ===\n`;

  return context;
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

CRITICAL RULES - YOU MUST FOLLOW THESE:
1. ALWAYS use ONLY the real-time database data provided below in the "Database Context" section
2. NEVER make up or assume information that is not in the database context
3. NEVER say "I need to check our database" - the data IS ALREADY PROVIDED BELOW
4. NEVER suggest users to "check the website" or "contact leaders" for information that should be in the database
5. If the database context shows "No events found" or "No blogs found", explicitly state "Currently, there are no [events/blogs/etc] in our database"
6. Be specific and direct - cite actual titles, dates, and details from the database context
7. If you don't have information because it's not in the database context, say: "I don't have that information in our current database"

Your role is to provide ACCURATE, REAL-TIME information about:
- Blog posts and articles (with titles, categories, dates)
- Upcoming and past events (with titles, locations, dates, descriptions)
- Student projects (with titles, status, descriptions)
- Club leaders (with names, positions, academic years)
- Reports and documents

IMPORTANT: The database context below contains THE ACTUAL, CURRENT data. Use it directly. Count the items if asked "how many". List the specific titles and details.

Always be encouraging and supportive, especially when discussing student projects and achievements.

${context}`;

  const messages: any[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.5, // Lower temperature for more factual responses
    max_tokens: 1024,
  });

  const response = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

  // Validate response - reject if it contains phrases suggesting the AI isn't using real data
  const invalidPhrases = [
    "I need to check our database",
    "I'd like to confirm",
    "check our website",
    "reach out to our club leaders",
    "I recommend checking",
    "for the most accurate information",
    "I should check",
    "let me verify"
  ];

  const containsInvalidPhrase = invalidPhrases.some(phrase =>
    response.toLowerCase().includes(phrase.toLowerCase())
  );

  if (containsInvalidPhrase) {
    // Regenerate with stricter prompt
    const stricterMessages: any[] = [
      {
        role: "system",
        content: `${systemPrompt}\n\nWARNING: Your previous response was rejected because you suggested checking external sources. YOU ALREADY HAVE ALL THE DATA in the database context above. Answer directly using ONLY that data.`
      },
      ...conversationHistory,
      { role: "user", content: userMessage },
    ];

    const retryCompletion = await groq.chat.completions.create({
      model: MODEL,
      messages: stricterMessages,
      temperature: 0.3,
      max_tokens: 1024,
    });

    return retryCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
  }

  return response;
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
