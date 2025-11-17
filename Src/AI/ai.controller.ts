import { Request, Response } from "express";
import {
  aiChatService,
  generateBlogContentService,
  translateContentService,
  generateProjectFeedbackService,
  generateEventDescriptionService,
  aiSearchService,
} from "./ai.service";
import { logAuditEvent } from "../Middleware/auditLogger";

/**
 * AI Chat endpoint - Ask questions about BITSA content
 */
export const aiChat = async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    const response = await aiChatService(message, conversationHistory || []);

    return res.status(200).json({
      success: true,
      data: {
        response,
        model: "llama-3.3-70b-versatile",
      },
    });
  } catch (error: any) {
    console.error("AI Chat error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to process chat request",
    });
  }
};

/**
 * Generate blog content using AI
 */
export const generateBlogContent = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { topic, category, language, tone } = req.body;

    if (!topic || !category) {
      return res.status(400).json({
        success: false,
        error: "Topic and category are required",
      });
    }

    const generatedContent = await generateBlogContentService(
      topic,
      category,
      language || "en",
      tone || "professional"
    );

    await logAuditEvent(
      req,
      "CREATE",
      `Generated blog content: ${generatedContent.title}`,
      "AI",
      undefined,
      { topic, category, language }
    );

    return res.status(200).json({
      success: true,
      data: generatedContent,
    });
  } catch (error: any) {
    console.error("Generate blog error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate blog content",
    });
  }
};

/**
 * Translate content to another language
 */
export const translateContent = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { title, body, targetLanguage } = req.body;

    if (!title || !body || !targetLanguage) {
      return res.status(400).json({
        success: false,
        error: "Title, body, and targetLanguage are required",
      });
    }

    const validLanguages = ["en", "sw", "fr", "id", "de", "es", "it", "pt", "ja"];
    if (!validLanguages.includes(targetLanguage)) {
      return res.status(400).json({
        success: false,
        error: `Invalid language. Must be one of: ${validLanguages.join(", ")}`,
      });
    }

    const translation = await translateContentService(
      { title, body },
      targetLanguage
    );

    await logAuditEvent(
      req,
      "OTHER",
      `Translated content to ${targetLanguage}`,
      "AI",
      undefined,
      { targetLanguage, originalTitle: title }
    );

    return res.status(200).json({
      success: true,
      data: translation,
    });
  } catch (error: any) {
    console.error("Translation error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to translate content",
    });
  }
};

/**
 * Generate project feedback
 */
export const generateProjectFeedback = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { projectTitle, projectDescription, techStack } = req.body;

    if (!projectTitle || !projectDescription) {
      return res.status(400).json({
        success: false,
        error: "Project title and description are required",
      });
    }

    const feedback = await generateProjectFeedbackService(
      projectTitle,
      projectDescription,
      techStack
    );

    await logAuditEvent(
      req,
      "OTHER",
      `Generated feedback for project: ${projectTitle}`,
      "AI",
      undefined,
      { projectTitle }
    );

    return res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (error: any) {
    console.error("Project feedback error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate project feedback",
    });
  }
};

/**
 * Generate event description
 */
export const generateEventDescription = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { eventTitle, eventType, targetAudience, language } = req.body;

    if (!eventTitle || !eventType || !targetAudience) {
      return res.status(400).json({
        success: false,
        error: "Event title, type, and target audience are required",
      });
    }

    const description = await generateEventDescriptionService(
      eventTitle,
      eventType,
      targetAudience,
      language || "en"
    );

    await logAuditEvent(
      req,
      "CREATE",
      `Generated event description: ${eventTitle}`,
      "AI",
      undefined,
      { eventTitle, language }
    );

    return res.status(200).json({
      success: true,
      data: { description },
    });
  } catch (error: any) {
    console.error("Event description error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate event description",
    });
  }
};

/**
 * AI-powered smart search
 */
export const aiSearch = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        success: false,
        error: "Search query is required",
      });
    }

    const results = await aiSearchService(query);

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    console.error("AI search error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to perform AI search",
    });
  }
};
