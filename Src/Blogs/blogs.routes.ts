import { Router } from "express";
import {
    getAllBlogs,
    getBlogById,
    getBlogBySlug,
    getLatestBlogs,
    getBlogsByCategory,
    getBlogCategories,
    createBlog,
    updateBlog,
    deleteBlog,
    getBlogStats
} from "./blogs.controller";
import { authenticate, adminRoleAuth } from "../Middleware/bearAuth";

export const blogsRouter = Router();

//
// ────────────────────────────────────────────────────────────
// PUBLIC ROUTES - Anyone can view blogs
// ────────────────────────────────────────────────────────────
//

/**
 * @swagger
 * /blogs:
 *   get:
 *     summary: Get all blogs (paginated, searchable, filterable)
 *     tags: [Blogs]
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
 *         description: Search in title, content, or category
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
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
 *         description: List of blogs with pagination
 */
blogsRouter.get("/", getAllBlogs);

/**
 * @swagger
 * /blogs/latest:
 *   get:
 *     summary: Get latest blogs
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Latest blog posts
 */
blogsRouter.get("/latest", getLatestBlogs);

/**
 * @swagger
 * /blogs/categories:
 *   get:
 *     summary: Get all blog categories
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: List of categories
 */
blogsRouter.get("/categories", getBlogCategories);

/**
 * @swagger
 * /blogs/category/{category}:
 *   get:
 *     summary: Get blogs by category
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Blogs in the category
 */
blogsRouter.get("/category/:category", getBlogsByCategory);

/**
 * @swagger
 * /blogs/slug/{slug}:
 *   get:
 *     summary: Get blog by slug (SEO-friendly URL)
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog details
 *       404:
 *         description: Blog not found
 */
blogsRouter.get("/slug/:slug", getBlogBySlug);

/**
 * @swagger
 * /blogs/{id}:
 *   get:
 *     summary: Get blog by ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog details
 *       404:
 *         description: Blog not found
 */
blogsRouter.get("/:id", getBlogById);

//
// ────────────────────────────────────────────────────────────
// ADMIN ROUTES - Manage Blogs
// ────────────────────────────────────────────────────────────
//

/**
 * @swagger
 * /blogs/admin/stats:
 *   get:
 *     summary: Get blog statistics (Admin)
 *     tags: [Blogs - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Blog statistics
 */
blogsRouter.get("/admin/stats", adminRoleAuth, getBlogStats);

/**
 * @swagger
 * /blogs/admin:
 *   post:
 *     summary: Create a new blog post (Admin only)
 *     tags: [Blogs - Admin]
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
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Getting Started with Machine Learning"
 *               content:
 *                 type: string
 *                 example: "Machine learning is revolutionizing technology..."
 *               category:
 *                 type: string
 *                 example: "Technology"
 *               coverImage:
 *                 type: string
 *                 description: URL to cover image
 *               slug:
 *                 type: string
 *                 description: Custom slug (auto-generated from title if not provided)
 *     responses:
 *       201:
 *         description: Blog created successfully
 *       400:
 *         description: Invalid input
 */
blogsRouter.post("/admin", adminRoleAuth, createBlog);

/**
 * @swagger
 * /blogs/admin/{id}:
 *   put:
 *     summary: Update a blog post (Admin only)
 *     tags: [Blogs - Admin]
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
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *               coverImage:
 *                 type: string
 *               slug:
 *                 type: string
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *       404:
 *         description: Blog not found
 */
blogsRouter.put("/admin/:id", adminRoleAuth, updateBlog);

/**
 * @swagger
 * /blogs/admin/{id}:
 *   delete:
 *     summary: Delete a blog post (Admin only)
 *     tags: [Blogs - Admin]
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
 *         description: Blog deleted successfully
 *       404:
 *         description: Blog not found
 */
blogsRouter.delete("/admin/:id", adminRoleAuth, deleteBlog);
