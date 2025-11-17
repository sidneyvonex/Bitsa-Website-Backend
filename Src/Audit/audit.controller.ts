import { Request, Response } from "express";
import {
    getAllAuditLogsService,
    getUserAuditLogsService,
    getResourceAuditLogsService,
    getAuditStatsService,
    getRecentActivityService
} from "../Middleware/auditLogger";

// Get all audit logs (SuperAdmin only)
export const getAllAuditLogs = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        
        const filters = {
            userId: req.query.userId as string,
            action: req.query.action as string,
            resourceType: req.query.resourceType as string,
            startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
            endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
            success: req.query.success ? req.query.success === 'true' : undefined,
            search: req.query.search as string,
        };

        const result = await getAllAuditLogsService(page, limit, filters);
        
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to retrieve audit logs" });
    }
};

// Get audit logs for specific user (SuperAdmin only)
export const getUserAuditLogs = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;

        const result = await getUserAuditLogsService(userId, page, limit);
        
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to retrieve user audit logs" });
    }
};

// Get audit logs for specific resource (SuperAdmin only)
export const getResourceAuditLogs = async (req: Request, res: Response) => {
    try {
        const { resourceType, resourceId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;

        const result = await getResourceAuditLogsService(resourceType, resourceId, page, limit);
        
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to retrieve resource audit logs" });
    }
};

// Get audit statistics (SuperAdmin only)
export const getAuditStats = async (req: Request, res: Response) => {
    try {
        const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
        const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

        const stats = await getAuditStatsService(startDate, endDate);
        
        res.status(200).json({ stats });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to retrieve audit statistics" });
    }
};

// Get recent activity (SuperAdmin only)
export const getRecentActivity = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 20;

        const logs = await getRecentActivityService(limit);
        
        res.status(200).json({ logs, count: logs.length });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to retrieve recent activity" });
    }
};
