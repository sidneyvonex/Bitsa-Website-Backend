import { Router } from "express";
import {
  getAllReports,
  getLatestReports,
  getReportById,
  searchReports,
  getReportsByCreator,
  createReport,
  updateReport,
  deleteReport,
  getReportStats,
} from "./reports.controller";
import { authenticate, adminRoleAuth } from "../Middleware/bearAuth";

const reportsRouter = Router();

/**
 * @swagger
 * /reports:
 *   get:
 *     tags:
 *       - Reports
 *     summary: Get all reports
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search reports by title
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Reports retrieved successfully
 */
reportsRouter.get("/", getAllReports);

/**
 * @swagger
 * /reports/latest:
 *   get:
 *     tags:
 *       - Reports
 *     summary: Get latest reports
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Latest reports retrieved successfully
 */
reportsRouter.get("/latest", getLatestReports);

/**
 * @swagger
 * /reports/search:
 *   get:
 *     tags:
 *       - Reports
 *     summary: Search reports by title
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 */
reportsRouter.get("/search", searchReports);

/**
 * @swagger
 * /reports/{id}:
 *   get:
 *     tags:
 *       - Reports
 *     summary: Get report by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report retrieved successfully
 *       404:
 *         description: Report not found
 */
reportsRouter.get("/:id", getReportById);

/**
 * @swagger
 * /reports/admin/stats:
 *   get:
 *     tags:
 *       - Reports
 *     summary: Get report statistics (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
reportsRouter.get("/admin/stats", authenticate, adminRoleAuth, getReportStats);

/**
 * @swagger
 * /reports/admin/creator/{creatorId}:
 *   get:
 *     tags:
 *       - Reports
 *     summary: Get reports by creator (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: creatorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reports retrieved successfully
 */
reportsRouter.get("/admin/creator/:creatorId", authenticate, adminRoleAuth, getReportsByCreator);

/**
 * @swagger
 * /reports/admin:
 *   post:
 *     tags:
 *       - Reports
 *     summary: Create a new report (Admin only)
 *     security:
 *       - bearerAuth: []
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
 *               fileUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Report created successfully
 */
reportsRouter.post("/admin", authenticate, adminRoleAuth, createReport);

/**
 * @swagger
 * /reports/admin/{id}:
 *   put:
 *     tags:
 *       - Reports
 *     summary: Update a report (Admin only)
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
 *     responses:
 *       200:
 *         description: Report updated successfully
 *       404:
 *         description: Report not found
 */
reportsRouter.put("/admin/:id", authenticate, adminRoleAuth, updateReport);

/**
 * @swagger
 * /reports/admin/{id}:
 *   delete:
 *     tags:
 *       - Reports
 *     summary: Delete a report (Admin only)
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
 *         description: Report deleted successfully
 *       404:
 *         description: Report not found
 */
reportsRouter.delete("/admin/:id", authenticate, adminRoleAuth, deleteReport);

export default reportsRouter;
