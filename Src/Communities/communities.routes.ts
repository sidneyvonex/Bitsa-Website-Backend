import { Router } from "express";
import {
  getAllCommunities,
  getCommunityById,
  searchCommunities,
  createCommunity,
  updateCommunity,
  deleteCommunity,
  getCommunityStats,
} from "./communities.controller";
import { authenticate, adminRoleAuth } from "../Middleware/bearAuth";

const communitiesRouter = Router();

/**
 * @swagger
 * /communities:
 *   get:
 *     tags:
 *       - Communities
 *     summary: Get all communities
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search communities by name
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
 *         description: Communities retrieved successfully
 */
communitiesRouter.get("/", getAllCommunities);

/**
 * @swagger
 * /communities/search:
 *   get:
 *     tags:
 *       - Communities
 *     summary: Search communities by name
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
communitiesRouter.get("/search", searchCommunities);

/**
 * @swagger
 * /communities/{id}:
 *   get:
 *     tags:
 *       - Communities
 *     summary: Get community by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Community retrieved successfully
 *       404:
 *         description: Community not found
 */
communitiesRouter.get("/:id", getCommunityById);

/**
 * @swagger
 * /communities/admin/stats:
 *   get:
 *     tags:
 *       - Communities
 *     summary: Get community statistics (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
communitiesRouter.get("/admin/stats", authenticate, adminRoleAuth, getCommunityStats);

/**
 * @swagger
 * /communities/admin:
 *   post:
 *     tags:
 *       - Communities
 *     summary: Create a new community (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               whatsappLink:
 *                 type: string
 *     responses:
 *       201:
 *         description: Community created successfully
 */
communitiesRouter.post("/admin", authenticate, adminRoleAuth, createCommunity);

/**
 * @swagger
 * /communities/admin/{id}:
 *   put:
 *     tags:
 *       - Communities
 *     summary: Update a community (Admin only)
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
 *         description: Community updated successfully
 *       404:
 *         description: Community not found
 */
communitiesRouter.put("/admin/:id", authenticate, adminRoleAuth, updateCommunity);

/**
 * @swagger
 * /communities/admin/{id}:
 *   delete:
 *     tags:
 *       - Communities
 *     summary: Delete a community (Admin only)
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
 *         description: Community deleted successfully
 *       404:
 *         description: Community not found
 */
communitiesRouter.delete("/admin/:id", authenticate, adminRoleAuth, deleteCommunity);

export default communitiesRouter;
