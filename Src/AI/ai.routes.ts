import { Router } from "express";
import {
  aiChat,
  generateBlogContent,
  translateContent,
  generateProjectFeedback,
  generateEventDescription,
  aiSearch,
} from "./ai.controller";
import { authenticate, adminRoleAuth } from "../Middleware/bearAuth";

const aiRouter = Router();

/**
 * @swagger
 * /ai/chat:
 *   post:
 *     tags:
 *       - AI Assistant
 *     summary: Chat with AI about BITSA content
 *     description: Ask questions about blogs, events, projects, leaders, and more. AI searches the database for relevant information.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "What events are happening this month?"
 *               conversationHistory:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant]
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: AI response generated successfully
 */
aiRouter.post("/chat", aiChat);

/**
 * @swagger
 * /ai/search:
 *   get:
 *     tags:
 *       - AI Assistant
 *     summary: AI-powered smart search
 *     description: Search across all content with AI-enhanced results and summaries
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results with AI summary
 */
aiRouter.get("/search", aiSearch);

/**
 * @swagger
 * /ai/generate/blog:
 *   post:
 *     tags:
 *       - AI Assistant
 *     summary: Generate blog content (Admin only)
 *     description: AI generates blog post in any supported language
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               topic:
 *                 type: string
 *                 example: "Introduction to Machine Learning"
 *               category:
 *                 type: string
 *                 example: "Technology"
 *               language:
 *                 type: string
 *                 enum: [en, sw, fr, id, de, es, it, pt, ja]
 *                 default: en
 *               tone:
 *                 type: string
 *                 enum: [professional, casual, academic]
 *                 default: professional
 *     responses:
 *       200:
 *         description: Blog content generated successfully
 */
aiRouter.post("/generate/blog", authenticate, adminRoleAuth, generateBlogContent);

/**
 * @swagger
 * /ai/generate/event:
 *   post:
 *     tags:
 *       - AI Assistant
 *     summary: Generate event description (Admin only)
 *     description: AI generates engaging event descriptions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventTitle:
 *                 type: string
 *                 example: "Web Development Workshop"
 *               eventType:
 *                 type: string
 *                 example: "Workshop"
 *               targetAudience:
 *                 type: string
 *                 example: "Computer Science students"
 *               language:
 *                 type: string
 *                 enum: [en, sw, fr, id, de, es, it, pt, ja]
 *                 default: en
 *     responses:
 *       200:
 *         description: Event description generated successfully
 */
aiRouter.post("/generate/event", authenticate, adminRoleAuth, generateEventDescription);

/**
 * @swagger
 * /ai/translate:
 *   post:
 *     tags:
 *       - AI Assistant
 *     summary: Translate content (Admin only)
 *     description: AI translates content to any supported language
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Welcome to BITSA"
 *               body:
 *                 type: string
 *                 example: "Join our tech community..."
 *               targetLanguage:
 *                 type: string
 *                 enum: [en, sw, fr, id, de, es, it, pt, ja]
 *     responses:
 *       200:
 *         description: Content translated successfully
 */
aiRouter.post("/translate", authenticate, adminRoleAuth, translateContent);

/**
 * @swagger
 * /ai/feedback/project:
 *   post:
 *     tags:
 *       - AI Assistant
 *     summary: Get AI feedback on project (Student/Admin)
 *     description: AI provides constructive feedback and suggestions for projects
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectTitle:
 *                 type: string
 *                 example: "Task Management App"
 *               projectDescription:
 *                 type: string
 *                 example: "A web app to help students manage their assignments..."
 *               techStack:
 *                 type: string
 *                 example: "React, Node.js, MongoDB"
 *     responses:
 *       200:
 *         description: Project feedback generated successfully
 */
aiRouter.post("/feedback/project", authenticate, generateProjectFeedback);

export default aiRouter;
