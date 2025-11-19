import { Router } from "express";
import {
    getAllProjects,
    getProjectById,
    getFeaturedProjects,
    getMyProjects,
    createProject,
    updateProject,
    deleteProject,
    updateProjectStatus,
    getProjectStats,
    getProjectsByUser
} from "./projects.controller";
import { authenticate, adminRoleAuth, bothRoleAuth } from "../Middleware/bearAuth";

export const projectsRouter = Router();

//
// ────────────────────────────────────────────────────────────
// PUBLIC / ALL AUTHENTICATED USERS - Browse Projects
// ────────────────────────────────────────────────────────────
//

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get all projects (paginated, searchable, filterable)
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, description, or tech stack
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [submitted, under_review, approved, rejected, featured]
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, title]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: List of projects with pagination
 */
projectsRouter.get("/", getAllProjects);

/**
 * @swagger
 * /projects/featured:
 *   get:
 *     summary: Get featured/approved projects
 *     description: Showcases best projects (approved or featured status)
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of featured projects
 */
projectsRouter.get("/featured", getFeaturedProjects);

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project details
 *       404:
 *         description: Project not found
 */
projectsRouter.get("/:id", getProjectById);

//
// ────────────────────────────────────────────────────────────
// STUDENT + ADMIN - Create & Manage Projects
// ────────────────────────────────────────────────────────────
//

/**
 * @swagger
 * /projects/my:
 *   get:
 *     summary: Get my projects
 *     tags: [Projects - Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's projects
 */
projectsRouter.get("/my/all", authenticate, getMyProjects);

/**
 * @swagger
 * /projects/create:
 *   post:
 *     summary: Create a new project
 *     description: Students can submit projects, Admins can post featured projects
 *     tags: [Projects - Student]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 example: "AI-Powered Chatbot"
 *               description:
 *                 type: string
 *                 example: "A chatbot using natural language processing"
 *               problemStatement:
 *                 type: string
 *               proposedSolution:
 *                 type: string
 *               techStack:
 *                 type: string
 *                 example: "Python, TensorFlow, Flask"
 *               proposalDocument:
 *                 type: string
 *                 description: URL to PDF document
 *               githubUrl:
 *                 type: string
 *               images:
 *                 type: string
 *                 description: JSON array of image URLs
 *               status:
 *                 type: string
 *                 description: Admin only - set initial status
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Invalid input
 */
projectsRouter.post("/create", authenticate, createProject);

/**
 * @swagger
 * /projects/{id}:
 *   put:
 *     summary: Update a project
 *     description: Students update their own, Admins update any
 *     tags: [Projects - Student]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               problemStatement:
 *                 type: string
 *               proposedSolution:
 *                 type: string
 *               techStack:
 *                 type: string
 *               proposalDocument:
 *                 type: string
 *               githubUrl:
 *                 type: string
 *               images:
 *                 type: string
 *               status:
 *                 type: string
 *                 description: Admin only
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Project not found
 */
projectsRouter.put("/:id", authenticate, updateProject);

/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     description: Students delete their own, Admins delete any
 *     tags: [Projects - Student]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Project not found
 */
projectsRouter.delete("/:id", authenticate, deleteProject);

//
// ────────────────────────────────────────────────────────────
// ADMIN ONLY - Project Management
// ────────────────────────────────────────────────────────────
//

/**
 * @swagger
 * /projects/admin/stats:
 *   get:
 *     summary: Get project statistics
 *     tags: [Projects - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Project statistics
 */
projectsRouter.get("/admin/stats", adminRoleAuth, getProjectStats);

/**
 * @swagger
 * /projects/admin/{id}/status:
 *   patch:
 *     summary: Update project status
 *     description: Admin can approve, reject, or feature projects
 *     tags: [Projects - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [submitted, under_review, approved, rejected, featured]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Project not found
 */
projectsRouter.patch("/admin/:id/status", adminRoleAuth, updateProjectStatus);

/**
 * @swagger
 * /projects/admin/user/{schoolId}:
 *   get:
 *     summary: Get all projects by a specific user (Admin)
 *     tags: [Projects - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User's projects
 */
projectsRouter.get("/admin/user/:schoolId", adminRoleAuth, getProjectsByUser);
