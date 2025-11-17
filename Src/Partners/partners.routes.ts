import { Router } from "express";
import {
  getAllPartners,
  getPartnerById,
  searchPartners,
  createPartner,
  updatePartner,
  deletePartner,
  getPartnerStats,
} from "./partners.controller";
import { authenticate, adminRoleAuth } from "../Middleware/bearAuth";

const partnersRouter = Router();

/**
 * @swagger
 * /partners:
 *   get:
 *     tags:
 *       - Partners
 *     summary: Get all partners
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search partners by name
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
 *         description: Partners retrieved successfully
 */
partnersRouter.get("/", getAllPartners);

/**
 * @swagger
 * /partners/search:
 *   get:
 *     tags:
 *       - Partners
 *     summary: Search partners by name
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
partnersRouter.get("/search", searchPartners);

/**
 * @swagger
 * /partners/{id}:
 *   get:
 *     tags:
 *       - Partners
 *     summary: Get partner by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Partner retrieved successfully
 *       404:
 *         description: Partner not found
 */
partnersRouter.get("/:id", getPartnerById);

/**
 * @swagger
 * /partners/admin/stats:
 *   get:
 *     tags:
 *       - Partners
 *     summary: Get partner statistics (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
partnersRouter.get("/admin/stats", authenticate, adminRoleAuth, getPartnerStats);

/**
 * @swagger
 * /partners/admin:
 *   post:
 *     tags:
 *       - Partners
 *     summary: Create a new partner (Admin only)
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
 *               logo:
 *                 type: string
 *               website:
 *                 type: string
 *     responses:
 *       201:
 *         description: Partner created successfully
 */
partnersRouter.post("/admin", authenticate, adminRoleAuth, createPartner);

/**
 * @swagger
 * /partners/admin/{id}:
 *   put:
 *     tags:
 *       - Partners
 *     summary: Update a partner (Admin only)
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
 *         description: Partner updated successfully
 *       404:
 *         description: Partner not found
 */
partnersRouter.put("/admin/:id", authenticate, adminRoleAuth, updatePartner);

/**
 * @swagger
 * /partners/admin/{id}:
 *   delete:
 *     tags:
 *       - Partners
 *     summary: Delete a partner (Admin only)
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
 *         description: Partner deleted successfully
 *       404:
 *         description: Partner not found
 */
partnersRouter.delete("/admin/:id", authenticate, adminRoleAuth, deletePartner);

export default partnersRouter;
