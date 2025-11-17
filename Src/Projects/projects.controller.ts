import { Request, Response } from "express";
import {
    getAllProjectsService,
    getProjectByIdService,
    getProjectsBySchoolIdService,
    createProjectService,
    updateProjectService,
    deleteProjectService,
    updateProjectStatusService,
    getFeaturedProjectsService,
    getProjectStatsService,
    isProjectOwnerService
} from "./projects.service";
import { logAuditEvent } from "../Middleware/auditLogger";
import db from "../drizzle/db";
import { users } from "../drizzle/schema";
import { eq, sql, and } from "drizzle-orm";

//
// ────────────────────────────────────────────────────────────
// PUBLIC / ALL USERS - View Projects
// ────────────────────────────────────────────────────────────
//

export const getAllProjects = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const search = req.query.search as string;
        const status = req.query.status as string;
        const sortBy = (req.query.sortBy as 'createdAt' | 'updatedAt' | 'title') || 'createdAt';
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const result = await getAllProjectsService(page, limit, search, status, undefined, sortBy, sortOrder);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch projects" });
    }
};

export const getProjectById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const project = await getProjectByIdService(id);

        if (!project) {
            res.status(404).json({ error: "Project not found" });
            return;
        }

        res.status(200).json(project);
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch project" });
    }
};

export const getFeaturedProjects = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        const featured = await getFeaturedProjectsService(limit);
        res.status(200).json({ projects: featured, count: featured.length });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch featured projects" });
    }
};

//
// ────────────────────────────────────────────────────────────
// STUDENT - Manage Own Projects
// ────────────────────────────────────────────────────────────
//

export const getMyProjects = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId; // schoolId from token

        if (!userId) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }

        const projects = await getProjectsBySchoolIdService(userId);
        res.status(200).json({ projects, count: projects.length });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch user projects" });
    }
};

export const createProject = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId; // schoolId from token
        const userRole = req.user?.userRole;

        if (!userId) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }

        const {
            title,
            description,
            problemStatement,
            proposedSolution,
            techStack,
            proposalDocument,
            githubUrl,
            images,
            status
        } = req.body;

        // Validation
        if (!title || title.trim() === "") {
            res.status(400).json({ error: "Project title is required" });
            return;
        }

        if (!description || description.trim() === "") {
            res.status(400).json({ error: "Project description is required" });
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

        // Admin can set status directly, students always start as "submitted"
        const projectStatus = (userRole?.toLowerCase() === 'admin' || userRole?.toLowerCase() === 'superadmin') 
            ? (status || "submitted")
            : "submitted";

        const newProject = await createProjectService({
            userId: user.id,
            title: title.trim(),
            description: description.trim(),
            problemStatement: problemStatement?.trim(),
            proposedSolution: proposedSolution?.trim(),
            techStack: techStack?.trim(),
            proposalDocument,
            githubUrl,
            images,
            status: projectStatus
        });

        // Log project creation
        await logAuditEvent(
            req,
            "CREATE",
            `Project created: ${title}`,
            "Project",
            newProject.id,
            { title, status: projectStatus, createdBy: userRole }
        );

        res.status(201).json({ 
            message: "Project created successfully", 
            project: newProject 
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to create project" });
    }
};

export const updateProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId; // schoolId from token
        const userRole = req.user?.userRole;

        if (!userId) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }

        // Check if project exists
        const existingProject = await getProjectByIdService(id);
        if (!existingProject) {
            res.status(404).json({ error: "Project not found" });
            return;
        }

        // Check ownership (students can only edit their own, admins can edit any)
        const isOwner = await isProjectOwnerService(id, userId);
        const isAdmin = userRole?.toLowerCase() === 'admin' || userRole?.toLowerCase() === 'superadmin';

        if (!isOwner && !isAdmin) {
            res.status(403).json({ error: "You don't have permission to update this project" });
            return;
        }

        const {
            title,
            description,
            problemStatement,
            proposedSolution,
            techStack,
            proposalDocument,
            githubUrl,
            images,
            status
        } = req.body;

        const updates: any = {};

        if (title !== undefined) updates.title = title.trim();
        if (description !== undefined) updates.description = description.trim();
        if (problemStatement !== undefined) updates.problemStatement = problemStatement?.trim();
        if (proposedSolution !== undefined) updates.proposedSolution = proposedSolution?.trim();
        if (techStack !== undefined) updates.techStack = techStack?.trim();
        if (proposalDocument !== undefined) updates.proposalDocument = proposalDocument;
        if (githubUrl !== undefined) updates.githubUrl = githubUrl;
        if (images !== undefined) updates.images = images;
        
        // Only admins can change status via update
        if (status !== undefined && isAdmin) {
            updates.status = status;
        }

        const updatedProject = await updateProjectService(id, updates);

        // Log project update
        await logAuditEvent(
            req,
            "UPDATE",
            `Project updated: ${existingProject.title}`,
            "Project",
            id,
            { updatedFields: Object.keys(updates) },
            existingProject,
            updatedProject
        );

        res.status(200).json({ 
            message: "Project updated successfully", 
            project: updatedProject 
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to update project" });
    }
};

export const deleteProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId; // schoolId from token
        const userRole = req.user?.userRole;

        if (!userId) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }

        // Check if project exists
        const existingProject = await getProjectByIdService(id);
        if (!existingProject) {
            res.status(404).json({ error: "Project not found" });
            return;
        }

        // Check ownership (students can only delete their own, admins can delete any)
        const isOwner = await isProjectOwnerService(id, userId);
        const isAdmin = userRole?.toLowerCase() === 'admin' || userRole?.toLowerCase() === 'superadmin';

        if (!isOwner && !isAdmin) {
            res.status(403).json({ error: "You don't have permission to delete this project" });
            return;
        }

        await deleteProjectService(id);

        // Log project deletion
        await logAuditEvent(
            req,
            "DELETE",
            `Project deleted: ${existingProject.title}`,
            "Project",
            id,
            { deletedBy: userRole },
            existingProject
        );

        res.status(200).json({ message: "Project deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to delete project" });
    }
};

//
// ────────────────────────────────────────────────────────────
// ADMIN - Project Management
// ────────────────────────────────────────────────────────────
//

export const updateProjectStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            res.status(400).json({ error: "Status is required" });
            return;
        }

        // Valid statuses
        const validStatuses = ["submitted", "under_review", "approved", "rejected", "featured"];
        if (!validStatuses.includes(status)) {
            res.status(400).json({ 
                error: "Invalid status", 
                validStatuses 
            });
            return;
        }

        const existingProject = await getProjectByIdService(id);
        if (!existingProject) {
            res.status(404).json({ error: "Project not found" });
            return;
        }

        const updatedProject = await updateProjectStatusService(id, status);

        // Log status change
        await logAuditEvent(
            req,
            "UPDATE",
            `Project status changed: ${existingProject.status} → ${status}`,
            "Project",
            id,
            { oldStatus: existingProject.status, newStatus: status },
            { status: existingProject.status },
            { status }
        );

        res.status(200).json({ 
            message: "Project status updated successfully", 
            project: updatedProject 
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to update project status" });
    }
};

export const getProjectStats = async (req: Request, res: Response) => {
    try {
        const stats = await getProjectStatsService();
        res.status(200).json(stats);
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch project statistics" });
    }
};

export const getProjectsByUser = async (req: Request, res: Response) => {
    try {
        const { schoolId } = req.params;
        const projects = await getProjectsBySchoolIdService(schoolId);
        res.status(200).json({ projects, count: projects.length });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch user projects" });
    }
};
