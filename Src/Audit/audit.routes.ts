import { Router } from "express";
import {
    getAllAuditLogs,
    getUserAuditLogs,
    getResourceAuditLogs,
    getAuditStats,
    getRecentActivity
} from "./audit.controller";
import { superAdminAuth } from "../Middleware/bearAuth";

export const auditRouter = Router();

// All audit routes require SuperAdmin access

auditRouter.get('/audit/logs', superAdminAuth, getAllAuditLogs);
/**
 * @swagger
 * /audit/logs:
 *   get:
 *     summary: Get all audit logs (SuperAdmin only)
 *     description: Returns paginated audit logs with optional filters
 *     security:
 *       - bearerAuth: []
 *     tags: [Audit]
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
 *           default: 50
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: resourceType
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: success
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *       403:
 *         description: Access denied - SuperAdmin role required
 */

auditRouter.get('/audit/stats', superAdminAuth, getAuditStats);
/**
 * @swagger
 * /audit/stats:
 *   get:
 *     summary: Get audit statistics (SuperAdmin only)
 *     description: Returns comprehensive audit statistics
 *     security:
 *       - bearerAuth: []
 *     tags: [Audit]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       403:
 *         description: Access denied - SuperAdmin role required
 */

auditRouter.get('/audit/recent', superAdminAuth, getRecentActivity);
/**
 * @swagger
 * /audit/recent:
 *   get:
 *     summary: Get recent activity (SuperAdmin only)
 *     description: Returns the most recent audit log entries
 *     security:
 *       - bearerAuth: []
 *     tags: [Audit]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Recent activity retrieved successfully
 *       403:
 *         description: Access denied - SuperAdmin role required
 */

auditRouter.get('/audit/user/:userId', superAdminAuth, getUserAuditLogs);
/**
 * @swagger
 * /audit/user/{userId}:
 *   get:
 *     summary: Get audit logs for specific user (SuperAdmin only)
 *     description: Returns all audit logs for a specific user
 *     security:
 *       - bearerAuth: []
 *     tags: [Audit]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: User audit logs retrieved successfully
 *       403:
 *         description: Access denied - SuperAdmin role required
 */

auditRouter.get('/audit/resource/:resourceType/:resourceId', superAdminAuth, getResourceAuditLogs);
/**
 * @swagger
 * /audit/resource/{resourceType}/{resourceId}:
 *   get:
 *     summary: Get audit logs for specific resource (SuperAdmin only)
 *     description: Returns all audit logs for a specific resource
 *     security:
 *       - bearerAuth: []
 *     tags: [Audit]
 *     parameters:
 *       - in: path
 *         name: resourceType
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Resource audit logs retrieved successfully
 *       403:
 *         description: Access denied - SuperAdmin role required
 */
