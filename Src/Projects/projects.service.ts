import db from "../drizzle/db";
import { projects, users } from "../drizzle/schema";
import { eq, sql, and, ilike, desc, asc, or } from "drizzle-orm";

//
// ────────────────────────────────────────────────────────────
// PROJECTS CRUD OPERATIONS
// ────────────────────────────────────────────────────────────
//

/**
 * Get all projects (paginated, filterable, searchable)
 * Used by: Students browsing projects, Admins reviewing submissions
 */
export const getAllProjectsService = async (
    page: number = 1,
    limit: number = 20,
    search?: string,
    status?: string,
    userId?: string,
    sortBy: 'createdAt' | 'updatedAt' | 'title' = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
) => {
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    if (search) {
        conditions.push(
            or(
                ilike(projects.title, `%${search}%`),
                ilike(projects.description, `%${search}%`),
                ilike(projects.techStack, `%${search}%`)
            )
        );
    }

    if (status) {
        conditions.push(eq(projects.status, status));
    }

    if (userId) {
        conditions.push(eq(projects.userId, userId));
    }

    const whereConditions = conditions.length > 0 ? and(...conditions) : undefined;

    // Determine sort column
    const sortColumn = 
        sortBy === 'title' ? projects.title :
        sortBy === 'updatedAt' ? projects.updatedAt :
        projects.createdAt;

    const orderDirection = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const [allProjects, totalCount] = await Promise.all([
        db.select({
            id: projects.id,
            userId: projects.userId,
            title: projects.title,
            description: projects.description,
            problemStatement: projects.problemStatement,
            proposedSolution: projects.proposedSolution,
            techStack: projects.techStack,
            proposalDocument: projects.proposalDocument,
            githubUrl: projects.githubUrl,
            images: projects.images,
            status: projects.status,
            createdAt: projects.createdAt,
            updatedAt: projects.updatedAt,
            // Join user info
            authorSchoolId: users.schoolId,
            authorFirstName: users.firstName,
            authorLastName: users.lastName,
            authorEmail: users.email,
            authorProfilePicture: users.profilePicture,
            authorRole: users.role
        })
            .from(projects)
            .leftJoin(users, eq(projects.userId, users.id))
            .where(whereConditions)
            .orderBy(orderDirection)
            .limit(limit)
            .offset(offset),
        db.select({ count: sql<number>`count(*)` })
            .from(projects)
            .where(whereConditions)
            .then((result: any) => Number(result[0].count))
    ]);

    return {
        projects: allProjects,
        pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit)
        }
    };
};

/**
 * Get a single project by ID
 */
export const getProjectByIdService = async (projectId: string) => {
    const [project] = await db.select({
        id: projects.id,
        userId: projects.userId,
        title: projects.title,
        description: projects.description,
        problemStatement: projects.problemStatement,
        proposedSolution: projects.proposedSolution,
        techStack: projects.techStack,
        proposalDocument: projects.proposalDocument,
        githubUrl: projects.githubUrl,
        images: projects.images,
        status: projects.status,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        // Join user info
        authorSchoolId: users.schoolId,
        authorFirstName: users.firstName,
        authorLastName: users.lastName,
        authorEmail: users.email,
        authorProfilePicture: users.profilePicture,
        authorRole: users.role
    })
        .from(projects)
        .leftJoin(users, eq(projects.userId, users.id))
        .where(eq(projects.id, projectId));

    return project;
};

/**
 * Get projects by user (using UUID)
 */
export const getProjectsByUserIdService = async (userId: string) => {
    const userProjects = await db.select()
        .from(projects)
        .where(eq(projects.userId, userId))
        .orderBy(desc(projects.createdAt));

    return userProjects;
};

/**
 * Get projects by schoolId
 */
export const getProjectsBySchoolIdService = async (schoolId: string) => {
    const [user] = await db.select({ id: users.id })
        .from(users)
        .where(and(
            eq(users.schoolId, schoolId),
            sql`${users.deletedAt} IS NULL`
        ));

    if (!user) {
        return [];
    }

    return getProjectsByUserIdService(user.id);
};

/**
 * Create a new project
 * Can be created by: Students OR Admins (for showcasing good projects)
 */
export const createProjectService = async (projectData: {
    userId: string; // UUID of the user
    title: string;
    description: string;
    problemStatement?: string;
    proposedSolution?: string;
    techStack?: string;
    proposalDocument?: string;
    githubUrl?: string;
    images?: string;
    status?: string;
}) => {
    const [newProject] = await db.insert(projects)
        .values({
            ...projectData,
            status: projectData.status || "submitted",
            createdAt: new Date(),
            updatedAt: new Date()
        })
        .returning();

    return newProject;
};

/**
 * Update a project
 * Students can update their own projects
 * Admins can update any project
 */
export const updateProjectService = async (
    projectId: string,
    updates: Partial<{
        title: string;
        description: string;
        problemStatement: string;
        proposedSolution: string;
        techStack: string;
        proposalDocument: string;
        githubUrl: string;
        images: string;
        status: string;
    }>
) => {
    const [updatedProject] = await db.update(projects)
        .set({
            ...updates,
            updatedAt: new Date()
        })
        .where(eq(projects.id, projectId))
        .returning();

    return updatedProject;
};

/**
 * Delete a project (hard delete)
 * Students can delete their own projects
 * Admins can delete any project
 */
export const deleteProjectService = async (projectId: string) => {
    const [deletedProject] = await db.delete(projects)
        .where(eq(projects.id, projectId))
        .returning();

    return deletedProject;
};

/**
 * Update project status (Admin only)
 * Statuses: submitted, under_review, approved, rejected, featured
 */
export const updateProjectStatusService = async (projectId: string, status: string) => {
    const [updatedProject] = await db.update(projects)
        .set({ 
            status,
            updatedAt: new Date()
        })
        .where(eq(projects.id, projectId))
        .returning();

    return updatedProject;
};

/**
 * Get featured/approved projects
 * Used for: Showcasing best projects on homepage
 */
export const getFeaturedProjectsService = async (limit: number = 10) => {
    const featuredProjects = await db.select({
        id: projects.id,
        userId: projects.userId,
        title: projects.title,
        description: projects.description,
        problemStatement: projects.problemStatement,
        proposedSolution: projects.proposedSolution,
        techStack: projects.techStack,
        proposalDocument: projects.proposalDocument,
        githubUrl: projects.githubUrl,
        images: projects.images,
        status: projects.status,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        // Join user info
        authorSchoolId: users.schoolId,
        authorFirstName: users.firstName,
        authorLastName: users.lastName,
        authorEmail: users.email,
        authorProfilePicture: users.profilePicture
    })
        .from(projects)
        .leftJoin(users, eq(projects.userId, users.id))
        .where(or(
            eq(projects.status, "featured"),
            eq(projects.status, "approved")
        ))
        .orderBy(desc(projects.createdAt))
        .limit(limit);

    return featuredProjects;
};

/**
 * Get project statistics
 * Total, by status, by user
 */
export const getProjectStatsService = async () => {
    const [totalCount] = await db.select({ count: sql<number>`count(*)` })
        .from(projects);

    const statusCounts = await db.select({
        status: projects.status,
        count: sql<number>`count(*)::int`
    })
        .from(projects)
        .groupBy(projects.status);

    const topContributors = await db.select({
        schoolId: users.schoolId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        projectCount: sql<number>`count(${projects.id})::int`
    })
        .from(projects)
        .innerJoin(users, eq(projects.userId, users.id))
        .groupBy(users.id, users.schoolId, users.firstName, users.lastName, users.email)
        .orderBy(desc(sql`count(${projects.id})`))
        .limit(10);

    return {
        total: Number(totalCount.count),
        byStatus: statusCounts,
        topContributors
    };
};

/**
 * Check if user owns a project
 */
export const isProjectOwnerService = async (projectId: string, userSchoolId: string): Promise<boolean> => {
    const [project] = await db.select({
        userId: projects.userId
    })
        .from(projects)
        .where(eq(projects.id, projectId));

    if (!project) {
        return false;
    }

    const [user] = await db.select({ id: users.id })
        .from(users)
        .where(and(
            eq(users.schoolId, userSchoolId),
            sql`${users.deletedAt} IS NULL`
        ));

    if (!user) {
        return false;
    }

    return project.userId === user.id;
};
