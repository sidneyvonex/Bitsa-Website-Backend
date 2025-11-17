import { Router } from "express";
import {
  getAllLeaders,
  getCurrentLeaders,
  getPastLeaders,
  getLeaderById,
  getAcademicYears,
  createLeader,
  updateLeader,
  deleteLeader,
  setCurrentLeadersByYear,
  getLeaderStats,
} from "./leaders.controller";
import { authenticate, adminRoleAuth } from "../Middleware/bearAuth";

const leadersRouter = Router();

/**
 * @swagger
 * /leaders:
 *   get:
 *     tags:
 *       - Leaders
 *     summary: Get all leaders with optional filters
 *     parameters:
 *       - in: query
 *         name: isCurrent
 *         schema:
 *           type: boolean
 *         description: Filter by current or past leaders
 *       - in: query
 *         name: academicYear
 *         schema:
 *           type: string
 *         description: Filter by academic year (e.g., "2024/2025")
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
 *         description: Leaders retrieved successfully
 */
leadersRouter.get("/", getAllLeaders);

/**
 * @swagger
 * /leaders/current:
 *   get:
 *     tags:
 *       - Leaders
 *     summary: Get current leaders only
 *     responses:
 *       200:
 *         description: Current leaders retrieved successfully
 */
leadersRouter.get("/current", getCurrentLeaders);

/**
 * @swagger
 * /leaders/past:
 *   get:
 *     tags:
 *       - Leaders
 *     summary: Get past leaders
 *     parameters:
 *       - in: query
 *         name: academicYear
 *         schema:
 *           type: string
 *         description: Filter by academic year
 *     responses:
 *       200:
 *         description: Past leaders retrieved successfully
 */
leadersRouter.get("/past", getPastLeaders);

/**
 * @swagger
 * /leaders/years:
 *   get:
 *     tags:
 *       - Leaders
 *     summary: Get all academic years
 *     responses:
 *       200:
 *         description: Academic years retrieved successfully
 */
leadersRouter.get("/years", getAcademicYears);

/**
 * @swagger
 * /leaders/{id}:
 *   get:
 *     tags:
 *       - Leaders
 *     summary: Get leader by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Leader retrieved successfully
 *       404:
 *         description: Leader not found
 */
leadersRouter.get("/:id", getLeaderById);

/**
 * @swagger
 * /leaders/admin/stats:
 *   get:
 *     tags:
 *       - Leaders
 *     summary: Get leader statistics (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
leadersRouter.get("/admin/stats", authenticate, adminRoleAuth, getLeaderStats);

/**
 * @swagger
 * /leaders/admin:
 *   post:
 *     tags:
 *       - Leaders
 *     summary: Create a new leader (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               position:
 *                 type: string
 *               academicYear:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               isCurrent:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Leader created successfully
 */
leadersRouter.post("/admin", authenticate, adminRoleAuth, createLeader);

/**
 * @swagger
 * /leaders/admin/{id}:
 *   put:
 *     tags:
 *       - Leaders
 *     summary: Update a leader (Admin only)
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
 *         description: Leader updated successfully
 *       404:
 *         description: Leader not found
 */
leadersRouter.put("/admin/:id", authenticate, adminRoleAuth, updateLeader);

/**
 * @swagger
 * /leaders/admin/{id}:
 *   delete:
 *     tags:
 *       - Leaders
 *     summary: Delete a leader (Admin only)
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
 *         description: Leader deleted successfully
 *       404:
 *         description: Leader not found
 */
leadersRouter.delete("/admin/:id", authenticate, adminRoleAuth, deleteLeader);

/**
 * @swagger
 * /leaders/admin/set-current:
 *   post:
 *     tags:
 *       - Leaders
 *     summary: Set current leaders by academic year (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               academicYear:
 *                 type: string
 *                 example: "2024/2025"
 *     responses:
 *       200:
 *         description: Current leaders set successfully
 */
leadersRouter.post("/admin/set-current", authenticate, adminRoleAuth, setCurrentLeadersByYear);

export default leadersRouter;
