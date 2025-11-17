import { Router } from "express";
import {
    getAllInterests,
    getInterestById,
    createInterest,
    updateInterest,
    deleteInterest,
    getInterestStats,
    getMyInterests,
    checkIfUserHasInterests,
    addMyInterests,
    removeMyInterest,
    replaceMyInterests,
    getUsersByInterest
} from "./interests.controller";
import { adminRoleAuth, authenticate } from "../Middleware/bearAuth";

export const interestsRouter = Router();

//
// ────────────────────────────────────────────────────────────
// ADMIN ROUTES - Manage Interests
// ────────────────────────────────────────────────────────────
//

/**
 * @swagger
 * /interests/admin/all:
 *   get:
 *     summary: Get all interests (Admin)
 *     tags: [Interests - Admin]
 *     security:
 *       - bearerAuth: []
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
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, createdAt]
 *           default: name
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *     responses:
 *       200:
 *         description: List of all interests
 */
interestsRouter.get("/admin/all", adminRoleAuth, getAllInterests);

/**
 * @swagger
 * /interests/admin/stats:
 *   get:
 *     summary: Get interest statistics (Admin)
 *     tags: [Interests - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Interest statistics with user counts
 */
interestsRouter.get("/admin/stats", adminRoleAuth, getInterestStats);

/**
 * @swagger
 * /interests/admin/{id}:
 *   get:
 *     summary: Get interest by ID (Admin)
 *     tags: [Interests - Admin]
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
 *         description: Interest details
 *       404:
 *         description: Interest not found
 */
interestsRouter.get("/admin/:id", adminRoleAuth, getInterestById);

/**
 * @swagger
 * /interests/admin:
 *   post:
 *     summary: Create new interest (Admin)
 *     tags: [Interests - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Machine Learning"
 *     responses:
 *       201:
 *         description: Interest created successfully
 *       400:
 *         description: Invalid input
 */
interestsRouter.post("/admin", adminRoleAuth, createInterest);

/**
 * @swagger
 * /interests/admin/{id}:
 *   put:
 *     summary: Update interest (Admin)
 *     tags: [Interests - Admin]
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
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Interest updated successfully
 *       404:
 *         description: Interest not found
 */
interestsRouter.put("/admin/:id", adminRoleAuth, updateInterest);

/**
 * @swagger
 * /interests/admin/{id}:
 *   delete:
 *     summary: Delete interest (Admin)
 *     tags: [Interests - Admin]
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
 *         description: Interest deleted successfully
 *       404:
 *         description: Interest not found
 */
interestsRouter.delete("/admin/:id", adminRoleAuth, deleteInterest);

//
// ────────────────────────────────────────────────────────────
// STUDENT ROUTES - User Interests
// ────────────────────────────────────────────────────────────
//

/**
 * @swagger
 * /interests:
 *   get:
 *     summary: Get all available interests (Public - for selection)
 *     tags: [Interests - Student]
 *     security:
 *       - bearerAuth: []
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
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of available interests
 */
interestsRouter.get("/", authenticate, getAllInterests);

/**
 * @swagger
 * /interests/my:
 *   get:
 *     summary: Get my selected interests
 *     description: CRITICAL - First thing students see after login
 *     tags: [Interests - Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's selected interests
 */
interestsRouter.get("/my", authenticate, getMyInterests);

/**
 * @swagger
 * /interests/my/check:
 *   get:
 *     summary: Check if user has selected interests
 *     description: Used to determine if student needs to see interest selection screen
 *     tags: [Interests - Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Interest selection status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasInterests:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 needsToSelectInterests:
 *                   type: boolean
 */
interestsRouter.get("/my/check", authenticate, checkIfUserHasInterests);

/**
 * @swagger
 * /interests/my:
 *   post:
 *     summary: Add interests to my profile
 *     tags: [Interests - Student]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - interestIds
 *             properties:
 *               interestIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["uuid-1", "uuid-2", "uuid-3"]
 *     responses:
 *       201:
 *         description: Interests added successfully
 *       400:
 *         description: Invalid input
 */
interestsRouter.post("/my", authenticate, addMyInterests);

/**
 * @swagger
 * /interests/my:
 *   put:
 *     summary: Replace all my interests
 *     description: Removes old interests and sets new ones
 *     tags: [Interests - Student]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - interestIds
 *             properties:
 *               interestIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Interests updated successfully
 */
interestsRouter.put("/my", authenticate, replaceMyInterests);

/**
 * @swagger
 * /interests/my/{interestId}:
 *   delete:
 *     summary: Remove an interest from my profile
 *     tags: [Interests - Student]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: interestId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Interest removed successfully
 *       404:
 *         description: Interest not found
 */
interestsRouter.delete("/my/:interestId", authenticate, removeMyInterest);

/**
 * @swagger
 * /interests/{interestId}/users:
 *   get:
 *     summary: Get users who share a specific interest
 *     tags: [Interests - Student]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: interestId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of users with this interest
 */
interestsRouter.get("/:interestId/users", authenticate, getUsersByInterest);
