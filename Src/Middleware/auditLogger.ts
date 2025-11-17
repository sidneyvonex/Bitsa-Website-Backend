import { Request } from "express";
import db from "../drizzle/db";
import { auditLogs, TAuditLogInsert } from "../drizzle/schema";
import { eq, desc, and, gte, lte, ilike, or, sql } from "drizzle-orm";

// Helper to extract IP address from request
export const getIpAddress = (req: Request): string => {
    return (
        (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
        req.socket.remoteAddress ||
        'unknown'
    );
};

// Helper to get user agent
export const getUserAgent = (req: Request): string => {
    return req.headers['user-agent'] || 'unknown';
};

// Create audit log entry
export const createAuditLog = async (data: {
    userId?: string;
    userEmail?: string;
    userRole?: string;
    action: string;
    actionDescription: string;
    resourceType?: string;
    resourceId?: string;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
    oldValues?: any;
    newValues?: any;
    success?: boolean;
    errorMessage?: string;
}) => {
    const logEntry: TAuditLogInsert = {
        userId: data.userId,
        userEmail: data.userEmail,
        userRole: data.userRole,
        action: data.action as any,
        actionDescription: data.actionDescription,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        oldValues: data.oldValues ? JSON.stringify(data.oldValues) : null,
        newValues: data.newValues ? JSON.stringify(data.newValues) : null,
        success: data.success ?? true,
        errorMessage: data.errorMessage,
    };

    const [created] = await db.insert(auditLogs).values(logEntry).returning();
    return created;
};

// Log from request context
export const logAuditEvent = async (
    req: Request,
    action: string,
    actionDescription: string,
    resourceType?: string,
    resourceId?: string,
    metadata?: any,
    oldValues?: any,
    newValues?: any,
    success: boolean = true,
    errorMessage?: string
) => {
    const user = req.user;
    
    return await createAuditLog({
        userId: user?.userId,
        userEmail: user?.email,
        userRole: user?.userRole,
        action,
        actionDescription,
        resourceType,
        resourceId,
        metadata,
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req),
        oldValues,
        newValues,
        success,
        errorMessage,
    });
};

// Get all audit logs (SuperAdmin only)
export const getAllAuditLogsService = async (
    page: number = 1,
    limit: number = 50,
    filters?: {
        userId?: string;
        action?: string;
        resourceType?: string;
        startDate?: Date;
        endDate?: Date;
        success?: boolean;
        search?: string;
    }
) => {
    const offset = (page - 1) * limit;
    const conditions = [];

    if (filters?.userId) {
        conditions.push(eq(auditLogs.userId, filters.userId));
    }

    if (filters?.action) {
        conditions.push(eq(auditLogs.action, filters.action as any));
    }

    if (filters?.resourceType) {
        conditions.push(eq(auditLogs.resourceType, filters.resourceType));
    }

    if (filters?.startDate) {
        conditions.push(gte(auditLogs.createdAt, filters.startDate));
    }

    if (filters?.endDate) {
        conditions.push(lte(auditLogs.createdAt, filters.endDate));
    }

    if (filters?.success !== undefined) {
        conditions.push(eq(auditLogs.success, filters.success));
    }

    if (filters?.search) {
        conditions.push(
            or(
                ilike(auditLogs.actionDescription, `%${filters.search}%`),
                ilike(auditLogs.userEmail, `%${filters.search}%`),
                ilike(auditLogs.resourceId, `%${filters.search}%`)
            )
        );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const logs = await db.query.auditLogs.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: [desc(auditLogs.createdAt)]
    });

    const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(auditLogs)
        .where(whereClause);

    return {
        logs,
        pagination: {
            page,
            limit,
            total: Number(count),
            totalPages: Math.ceil(Number(count) / limit)
        }
    };
};

// Get audit logs for specific user
export const getUserAuditLogsService = async (userId: string, page: number = 1, limit: number = 50) => {
    const offset = (page - 1) * limit;

    const logs = await db.query.auditLogs.findMany({
        where: eq(auditLogs.userId, userId),
        limit,
        offset,
        orderBy: [desc(auditLogs.createdAt)]
    });

    const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(auditLogs)
        .where(eq(auditLogs.userId, userId));

    return {
        logs,
        pagination: {
            page,
            limit,
            total: Number(count),
            totalPages: Math.ceil(Number(count) / limit)
        }
    };
};

// Get audit logs for specific resource
export const getResourceAuditLogsService = async (
    resourceType: string,
    resourceId: string,
    page: number = 1,
    limit: number = 50
) => {
    const offset = (page - 1) * limit;

    const logs = await db.query.auditLogs.findMany({
        where: and(
            eq(auditLogs.resourceType, resourceType),
            eq(auditLogs.resourceId, resourceId)
        ),
        limit,
        offset,
        orderBy: [desc(auditLogs.createdAt)]
    });

    const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(auditLogs)
        .where(and(
            eq(auditLogs.resourceType, resourceType),
            eq(auditLogs.resourceId, resourceId)
        ));

    return {
        logs,
        pagination: {
            page,
            limit,
            total: Number(count),
            totalPages: Math.ceil(Number(count) / limit)
        }
    };
};

// Get audit statistics
export const getAuditStatsService = async (startDate?: Date, endDate?: Date) => {
    const conditions = [];
    
    if (startDate) {
        conditions.push(gte(auditLogs.createdAt, startDate));
    }
    
    if (endDate) {
        conditions.push(lte(auditLogs.createdAt, endDate));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const totalLogs = await db
        .select({ count: sql<number>`count(*)` })
        .from(auditLogs)
        .where(whereClause);

    const successfulActions = await db
        .select({ count: sql<number>`count(*)` })
        .from(auditLogs)
        .where(and(whereClause, eq(auditLogs.success, true)));

    const failedActions = await db
        .select({ count: sql<number>`count(*)` })
        .from(auditLogs)
        .where(and(whereClause, eq(auditLogs.success, false)));

    const actionsByType = await db
        .select({
            action: auditLogs.action,
            count: sql<number>`count(*)`
        })
        .from(auditLogs)
        .where(whereClause)
        .groupBy(auditLogs.action);

    const actionsByResource = await db
        .select({
            resourceType: auditLogs.resourceType,
            count: sql<number>`count(*)`
        })
        .from(auditLogs)
        .where(whereClause)
        .groupBy(auditLogs.resourceType);

    const topUsers = await db
        .select({
            userId: auditLogs.userId,
            userEmail: auditLogs.userEmail,
            count: sql<number>`count(*)`
        })
        .from(auditLogs)
        .where(whereClause)
        .groupBy(auditLogs.userId, auditLogs.userEmail)
        .orderBy(desc(sql`count(*)`))
        .limit(10);

    return {
        total: Number(totalLogs[0].count),
        successful: Number(successfulActions[0].count),
        failed: Number(failedActions[0].count),
        byAction: actionsByType.map(a => ({ action: a.action, count: Number(a.count) })),
        byResource: actionsByResource.map(r => ({ 
            resourceType: r.resourceType || 'unknown', 
            count: Number(r.count) 
        })),
        topUsers: topUsers.map(u => ({
            userId: u.userId,
            userEmail: u.userEmail,
            count: Number(u.count)
        }))
    };
};

// Get recent activity (last N logs)
export const getRecentActivityService = async (limit: number = 20) => {
    return await db.query.auditLogs.findMany({
        limit,
        orderBy: [desc(auditLogs.createdAt)]
    });
};
