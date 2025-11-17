import db from "../drizzle/db";
import { blogs, users } from "../drizzle/schema";
import { eq, sql, and, ilike, desc, asc, or } from "drizzle-orm";

//
// ────────────────────────────────────────────────────────────
// BLOGS CRUD OPERATIONS
// ────────────────────────────────────────────────────────────
//

/**
 * Get all blogs (paginated, searchable, filterable)
 */
export const getAllBlogsService = async (
    page: number = 1,
    limit: number = 20,
    search?: string,
    category?: string,
    authorId?: string,
    sortBy: 'createdAt' | 'updatedAt' | 'title' = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
) => {
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    if (search) {
        conditions.push(
            or(
                ilike(blogs.title, `%${search}%`),
                ilike(blogs.content, `%${search}%`),
                ilike(blogs.category, `%${search}%`)
            )
        );
    }

    if (category) {
        conditions.push(eq(blogs.category, category));
    }

    if (authorId) {
        conditions.push(eq(blogs.authorId, authorId));
    }

    const whereConditions = conditions.length > 0 ? and(...conditions) : undefined;

    // Determine sort column
    const sortColumn = 
        sortBy === 'title' ? blogs.title :
        sortBy === 'updatedAt' ? blogs.updatedAt :
        blogs.createdAt;

    const orderDirection = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const [allBlogs, totalCount] = await Promise.all([
        db.select({
            id: blogs.id,
            title: blogs.title,
            slug: blogs.slug,
            content: blogs.content,
            category: blogs.category,
            readTime: blogs.readTime,
            coverImage: blogs.coverImage,
            authorId: blogs.authorId,
            createdAt: blogs.createdAt,
            updatedAt: blogs.updatedAt,
            // Join author info
            authorSchoolId: users.schoolId,
            authorFirstName: users.firstName,
            authorLastName: users.lastName,
            authorEmail: users.email,
            authorProfilePicture: users.profilePicture,
            authorRole: users.role
        })
            .from(blogs)
            .leftJoin(users, eq(blogs.authorId, users.id))
            .where(whereConditions)
            .orderBy(orderDirection)
            .limit(limit)
            .offset(offset),
        db.select({ count: sql<number>`count(*)` })
            .from(blogs)
            .where(whereConditions)
            .then((result: any) => Number(result[0].count))
    ]);

    return {
        blogs: allBlogs,
        pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit)
        }
    };
};

/**
 * Get a single blog by ID
 */
export const getBlogByIdService = async (blogId: string) => {
    const [blog] = await db.select({
        id: blogs.id,
        title: blogs.title,
        slug: blogs.slug,
        content: blogs.content,
        category: blogs.category,
        readTime: blogs.readTime,
        coverImage: blogs.coverImage,
        authorId: blogs.authorId,
        createdAt: blogs.createdAt,
        updatedAt: blogs.updatedAt,
        // Join author info
        authorSchoolId: users.schoolId,
        authorFirstName: users.firstName,
        authorLastName: users.lastName,
        authorEmail: users.email,
        authorProfilePicture: users.profilePicture,
        authorRole: users.role
    })
        .from(blogs)
        .leftJoin(users, eq(blogs.authorId, users.id))
        .where(eq(blogs.id, blogId));

    return blog;
};

/**
 * Get blog by slug (for SEO-friendly URLs)
 */
export const getBlogBySlugService = async (slug: string) => {
    const [blog] = await db.select({
        id: blogs.id,
        title: blogs.title,
        slug: blogs.slug,
        content: blogs.content,
        category: blogs.category,
        readTime: blogs.readTime,
        coverImage: blogs.coverImage,
        authorId: blogs.authorId,
        createdAt: blogs.createdAt,
        updatedAt: blogs.updatedAt,
        // Join author info
        authorSchoolId: users.schoolId,
        authorFirstName: users.firstName,
        authorLastName: users.lastName,
        authorEmail: users.email,
        authorProfilePicture: users.profilePicture
    })
        .from(blogs)
        .leftJoin(users, eq(blogs.authorId, users.id))
        .where(eq(blogs.slug, slug));

    return blog;
};

/**
 * Create a new blog post
 * Only Admins can create blogs
 */
export const createBlogService = async (blogData: {
    title: string;
    slug: string;
    content: string;
    category?: string;
    readTime?: number;
    coverImage?: string;
    authorId: string; // UUID of the author (admin)
}) => {
    const [newBlog] = await db.insert(blogs)
        .values({
            ...blogData,
            createdAt: new Date(),
            updatedAt: new Date()
        })
        .returning();

    return newBlog;
};

/**
 * Update a blog post
 */
export const updateBlogService = async (
    blogId: string,
    updates: Partial<{
        title: string;
        slug: string;
        content: string;
        category: string;
        readTime: number;
        coverImage: string;
    }>
) => {
    const [updatedBlog] = await db.update(blogs)
        .set({
            ...updates,
            updatedAt: new Date()
        })
        .where(eq(blogs.id, blogId))
        .returning();

    return updatedBlog;
};

/**
 * Delete a blog post
 */
export const deleteBlogService = async (blogId: string) => {
    const [deletedBlog] = await db.delete(blogs)
        .where(eq(blogs.id, blogId))
        .returning();

    return deletedBlog;
};

/**
 * Get blogs by author (using UUID)
 */
export const getBlogsByAuthorIdService = async (authorId: string) => {
    const authorBlogs = await db.select()
        .from(blogs)
        .where(eq(blogs.authorId, authorId))
        .orderBy(desc(blogs.createdAt));

    return authorBlogs;
};

/**
 * Get blogs by category
 */
export const getBlogsByCategoryService = async (category: string, limit: number = 10) => {
    const categoryBlogs = await db.select({
        id: blogs.id,
        title: blogs.title,
        slug: blogs.slug,
        content: blogs.content,
        category: blogs.category,
        readTime: blogs.readTime,
        coverImage: blogs.coverImage,
        createdAt: blogs.createdAt,
        updatedAt: blogs.updatedAt,
        // Author info
        authorSchoolId: users.schoolId,
        authorFirstName: users.firstName,
        authorLastName: users.lastName,
        authorProfilePicture: users.profilePicture
    })
        .from(blogs)
        .leftJoin(users, eq(blogs.authorId, users.id))
        .where(eq(blogs.category, category))
        .orderBy(desc(blogs.createdAt))
        .limit(limit);

    return categoryBlogs;
};

/**
 * Get latest blogs
 */
export const getLatestBlogsService = async (limit: number = 5) => {
    const latestBlogs = await db.select({
        id: blogs.id,
        title: blogs.title,
        slug: blogs.slug,
        content: blogs.content,
        category: blogs.category,
        readTime: blogs.readTime,
        coverImage: blogs.coverImage,
        createdAt: blogs.createdAt,
        // Author info
        authorSchoolId: users.schoolId,
        authorFirstName: users.firstName,
        authorLastName: users.lastName,
        authorProfilePicture: users.profilePicture
    })
        .from(blogs)
        .leftJoin(users, eq(blogs.authorId, users.id))
        .orderBy(desc(blogs.createdAt))
        .limit(limit);

    return latestBlogs;
};

/**
 * Get all blog categories
 */
export const getBlogCategoriesService = async () => {
    const categories = await db.select({ category: blogs.category })
        .from(blogs)
        .groupBy(blogs.category)
        .orderBy(asc(blogs.category));

    return categories.map(c => c.category).filter(Boolean);
};

/**
 * Get blog statistics
 */
export const getBlogStatsService = async () => {
    const [totalCount] = await db.select({ count: sql<number>`count(*)` })
        .from(blogs);

    const categoryCounts = await db.select({
        category: blogs.category,
        count: sql<number>`count(*)::int`
    })
        .from(blogs)
        .groupBy(blogs.category)
        .orderBy(desc(sql`count(*)`));

    const topAuthors = await db.select({
        authorId: blogs.authorId,
        authorSchoolId: users.schoolId,
        authorFirstName: users.firstName,
        authorLastName: users.lastName,
        blogCount: sql<number>`count(${blogs.id})::int`
    })
        .from(blogs)
        .innerJoin(users, eq(blogs.authorId, users.id))
        .groupBy(blogs.authorId, users.id, users.schoolId, users.firstName, users.lastName)
        .orderBy(desc(sql`count(${blogs.id})`))
        .limit(5);

    return {
        total: Number(totalCount.count),
        byCategory: categoryCounts,
        topAuthors
    };
};

/**
 * Generate unique slug from title
 */
export const generateSlugService = (title: string): string => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim();
};

/**
 * Check if slug already exists
 */
export const slugExistsService = async (slug: string, excludeId?: string): Promise<boolean> => {
    const conditions = excludeId 
        ? and(eq(blogs.slug, slug), sql`${blogs.id} != ${excludeId}`)
        : eq(blogs.slug, slug);

    const [result] = await db.select({ count: sql<number>`count(*)` })
        .from(blogs)
        .where(conditions);

    return Number(result.count) > 0;
};

/**
 * Calculate read time (based on content length)
 * Assumes average reading speed of 200 words per minute
 */
export const calculateReadTimeService = (content: string): number => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return readTime < 1 ? 1 : readTime;
};
