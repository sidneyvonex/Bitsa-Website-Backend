import { Request, Response } from "express";
import {
    getAllInterestsService,
    getInterestByIdService,
    createInterestService,
    updateInterestService,
    deleteInterestService,
    getUserInterestsService,
    getUserInterestsBySchoolIdService,
    addUserInterestsService,
    removeUserInterestService,
    replaceUserInterestsService,
    getUsersByInterestService,
    getInterestStatsService,
    hasUserSelectedInterestsService
} from "./interests.service";
import { logAuditEvent } from "../Middleware/auditLogger";

//
// ────────────────────────────────────────────────────────────
// INTERESTS MANAGEMENT (Admin)
// ────────────────────────────────────────────────────────────
//

export const getAllInterests = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const search = req.query.search as string;
        const sortBy = (req.query.sortBy as 'name' | 'createdAt') || 'name';
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

        const result = await getAllInterestsService(page, limit, search, sortBy, sortOrder);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch interests" });
    }
};

export const getInterestById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const interest = await getInterestByIdService(id);

        if (!interest) {
            res.status(404).json({ error: "Interest not found" });
            return;
        }

        res.status(200).json(interest);
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch interest" });
    }
};

export const createInterest = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;

        if (!name || name.trim() === "") {
            res.status(400).json({ error: "Interest name is required" });
            return;
        }

        const newInterest = await createInterestService(name.trim());

        // Log interest creation
        await logAuditEvent(
            req,
            "CREATE",
            `Interest created: ${name}`,
            "Interest",
            newInterest.id,
            { name }
        );

        res.status(201).json({ message: "Interest created successfully", interest: newInterest });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to create interest" });
    }
};

export const updateInterest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name || name.trim() === "") {
            res.status(400).json({ error: "Interest name is required" });
            return;
        }

        const oldInterest = await getInterestByIdService(id);
        if (!oldInterest) {
            res.status(404).json({ error: "Interest not found" });
            return;
        }

        const updatedInterest = await updateInterestService(id, name.trim());

        // Log interest update
        await logAuditEvent(
            req,
            "UPDATE",
            `Interest updated: ${oldInterest.name} → ${name}`,
            "Interest",
            id,
            {},
            oldInterest,
            updatedInterest
        );

        res.status(200).json({ message: "Interest updated successfully", interest: updatedInterest });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to update interest" });
    }
};

export const deleteInterest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const interest = await getInterestByIdService(id);
        if (!interest) {
            res.status(404).json({ error: "Interest not found" });
            return;
        }

        await deleteInterestService(id);

        // Log interest deletion
        await logAuditEvent(
            req,
            "DELETE",
            `Interest deleted: ${interest.name}`,
            "Interest",
            id,
            {},
            interest
        );

        res.status(200).json({ message: "Interest deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to delete interest" });
    }
};

export const getInterestStats = async (req: Request, res: Response) => {
    try {
        const stats = await getInterestStatsService();
        res.status(200).json(stats);
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch interest statistics" });
    }
};

//
// ────────────────────────────────────────────────────────────
// USER INTERESTS (Students)
// ────────────────────────────────────────────────────────────
//

export const getMyInterests = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId; // schoolId from token

        if (!userId) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }

        const userInterests = await getUserInterestsBySchoolIdService(userId);
        res.status(200).json({ interests: userInterests });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch user interests" });
    }
};

export const checkIfUserHasInterests = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId; // schoolId from token

        if (!userId) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }

        // Get user UUID from schoolId
        const userInterests = await getUserInterestsBySchoolIdService(userId);
        const hasInterests = userInterests.length > 0;

        res.status(200).json({ 
            hasInterests,
            count: userInterests.length,
            needsToSelectInterests: !hasInterests
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to check user interests" });
    }
};

export const addMyInterests = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId; // schoolId from token
        const { interestIds } = req.body;

        if (!userId) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }

        if (!Array.isArray(interestIds) || interestIds.length === 0) {
            res.status(400).json({ error: "Interest IDs array is required" });
            return;
        }

        // Get user UUID from schoolId
        const db = (await import("../drizzle/db")).default;
        const { users } = await import("../drizzle/schema");
        const { eq, sql, and } = await import("drizzle-orm");

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

        const newInterests = await addUserInterestsService(user.id, interestIds);

        // Log interest addition
        await logAuditEvent(
            req,
            "UPDATE",
            `User added ${newInterests.length} interests`,
            "UserInterests",
            userId,
            { interestIds, addedCount: newInterests.length }
        );

        res.status(201).json({ 
            message: "Interests added successfully", 
            added: newInterests.length 
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to add interests" });
    }
};

export const removeMyInterest = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId; // schoolId from token
        const { interestId } = req.params;

        if (!userId) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }

        // Get user UUID from schoolId
        const db = (await import("../drizzle/db")).default;
        const { users } = await import("../drizzle/schema");
        const { eq, sql, and } = await import("drizzle-orm");

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

        const removed = await removeUserInterestService(user.id, interestId);

        if (!removed) {
            res.status(404).json({ error: "Interest not found in user's interests" });
            return;
        }

        // Log interest removal
        await logAuditEvent(
            req,
            "UPDATE",
            `User removed interest ${interestId}`,
            "UserInterests",
            userId,
            { interestId }
        );

        res.status(200).json({ message: "Interest removed successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to remove interest" });
    }
};

export const replaceMyInterests = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId; // schoolId from token
        const { interestIds } = req.body;

        if (!userId) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }

        if (!Array.isArray(interestIds)) {
            res.status(400).json({ error: "Interest IDs must be an array" });
            return;
        }

        // Get user UUID from schoolId
        const db = (await import("../drizzle/db")).default;
        const { users } = await import("../drizzle/schema");
        const { eq, sql, and } = await import("drizzle-orm");

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

        const newInterests = await replaceUserInterestsService(user.id, interestIds);

        // Log interest replacement
        await logAuditEvent(
            req,
            "UPDATE",
            `User replaced all interests (${interestIds.length} new)`,
            "UserInterests",
            userId,
            { interestIds, count: interestIds.length }
        );

        res.status(200).json({ 
            message: "Interests updated successfully", 
            count: newInterests.length 
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to update interests" });
    }
};

export const getUsersByInterest = async (req: Request, res: Response) => {
    try {
        const { interestId } = req.params;
        const limit = parseInt(req.query.limit as string) || 20;

        const users = await getUsersByInterestService(interestId, limit);
        res.status(200).json({ users, count: users.length });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch users by interest" });
    }
};
