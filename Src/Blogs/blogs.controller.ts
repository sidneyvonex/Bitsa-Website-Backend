import { Request, Response } from "express";
import {
    getAllBlogsService,
    getBlogByIdService,
    getBlogBySlugService,
    createBlogService,
    updateBlogService,
    deleteBlogService,
    getBlogsByCategoryService,
    getLatestBlogsService,
    getBlogCategoriesService,
    getBlogStatsService,
    generateSlugService,
    slugExistsService,
    calculateReadTimeService
} from "./blogs.service";
import { logAuditEvent } from "../Middleware/auditLogger";
import db from "../drizzle/db";
import { users } from "../drizzle/schema";
import { eq, sql, and } from "drizzle-orm";

//
// ────────────────────────────────────────────────────────────
// PUBLIC - View Blogs
// ────────────────────────────────────────────────────────────
//

export const getAllBlogs = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const search = req.query.search as string;
        const category = req.query.category as string;
        const sortBy = (req.query.sortBy as 'createdAt' | 'updatedAt' | 'title') || 'createdAt';
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const result = await getAllBlogsService(page, limit, search, category, undefined, sortBy, sortOrder);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch blogs" });
    }
};

export const getBlogById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const blog = await getBlogByIdService(id);

        if (!blog) {
            res.status(404).json({ error: "Blog not found" });
            return;
        }

        res.status(200).json(blog);
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch blog" });
    }
};

export const getBlogBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const blog = await getBlogBySlugService(slug);

        if (!blog) {
            res.status(404).json({ error: "Blog not found" });
            return;
        }

        res.status(200).json(blog);
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch blog" });
    }
};

export const getLatestBlogs = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 5;
        const blogs = await getLatestBlogsService(limit);
        res.status(200).json({ blogs, count: blogs.length });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch latest blogs" });
    }
};

export const getBlogsByCategory = async (req: Request, res: Response) => {
    try {
        const { category } = req.params;
        const limit = parseInt(req.query.limit as string) || 10;
        const blogs = await getBlogsByCategoryService(category, limit);
        res.status(200).json({ blogs, count: blogs.length });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch blogs by category" });
    }
};

export const getBlogCategories = async (req: Request, res: Response) => {
    try {
        const categories = await getBlogCategoriesService();
        res.status(200).json({ categories, count: categories.length });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch categories" });
    }
};

//
// ────────────────────────────────────────────────────────────
// ADMIN - Manage Blogs
// ────────────────────────────────────────────────────────────
//

export const createBlog = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId; // schoolId from token
        const userRole = req.user?.userRole;

        if (!userId) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }

        const {
            title,
            content,
            category,
            coverImage,
            slug: customSlug
        } = req.body;

        // Validation
        if (!title || title.trim() === "") {
            res.status(400).json({ error: "Blog title is required" });
            return;
        }

        if (!content || content.trim() === "") {
            res.status(400).json({ error: "Blog content is required" });
            return;
        }

        // Get user UUID
        const [user] = await db.select({ id: users.id })
            .from(users)
            .where(and(
                eq(users.schoolId, userId),
                sql`${users.deletedAt} IS NULL`
            ));

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        // Generate slug
        let slug = customSlug ? generateSlugService(customSlug) : generateSlugService(title);
        
        // Ensure slug is unique
        if (await slugExistsService(slug)) {
            slug = `${slug}-${Date.now()}`;
        }

        // Calculate read time
        const readTime = calculateReadTimeService(content);

        const newBlog = await createBlogService({
            title: title.trim(),
            slug,
            content: content.trim(),
            category: category?.trim(),
            readTime,
            coverImage,
            authorId: user.id
        });

        // Log blog creation
        await logAuditEvent(
            req,
            "CREATE",
            `Blog created: ${title}`,
            "Blog",
            newBlog.id,
            { title, category, slug }
        );

        res.status(201).json({ 
            message: "Blog created successfully", 
            blog: newBlog 
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to create blog" });
    }
};

export const updateBlog = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId; // schoolId from token

        if (!userId) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }

        // Check if blog exists
        const existingBlog = await getBlogByIdService(id);
        if (!existingBlog) {
            res.status(404).json({ error: "Blog not found" });
            return;
        }

        const {
            title,
            content,
            category,
            coverImage,
            slug: customSlug
        } = req.body;

        const updates: any = {};

        if (title !== undefined) updates.title = title.trim();
        if (content !== undefined) {
            updates.content = content.trim();
            updates.readTime = calculateReadTimeService(content);
        }
        if (category !== undefined) updates.category = category?.trim();
        if (coverImage !== undefined) updates.coverImage = coverImage;
        
        // Handle slug update
        if (customSlug !== undefined) {
            const newSlug = generateSlugService(customSlug);
            if (await slugExistsService(newSlug, id)) {
                res.status(400).json({ error: "Slug already exists" });
                return;
            }
            updates.slug = newSlug;
        }

        const updatedBlog = await updateBlogService(id, updates);

        // Log blog update
        await logAuditEvent(
            req,
            "UPDATE",
            `Blog updated: ${existingBlog.title}`,
            "Blog",
            id,
            { updatedFields: Object.keys(updates) },
            existingBlog,
            updatedBlog
        );

        res.status(200).json({ 
            message: "Blog updated successfully", 
            blog: updatedBlog 
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to update blog" });
    }
};

export const deleteBlog = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId; // schoolId from token

        if (!userId) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }

        // Check if blog exists
        const existingBlog = await getBlogByIdService(id);
        if (!existingBlog) {
            res.status(404).json({ error: "Blog not found" });
            return;
        }

        await deleteBlogService(id);

        // Log blog deletion
        await logAuditEvent(
            req,
            "DELETE",
            `Blog deleted: ${existingBlog.title}`,
            "Blog",
            id,
            {},
            existingBlog
        );

        res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to delete blog" });
    }
};

export const getBlogStats = async (req: Request, res: Response) => {
    try {
        const stats = await getBlogStatsService();
        res.status(200).json(stats);
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch blog statistics" });
    }
};
