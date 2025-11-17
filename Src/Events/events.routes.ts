import { Router } from "express";
import {
    getAllEvents,
    getEventById,
    getUpcomingEvents,
    getPastEvents,
    getEventGallery,
    getAllGallery,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventStats,
    addGalleryImage,
    deleteGalleryImage
} from "./events.controller";
import { authenticate, adminRoleAuth } from "../Middleware/bearAuth";

export const eventsRouter = Router();

//
// ────────────────────────────────────────────────────────────
// PUBLIC ROUTES - Anyone can view events
// ────────────────────────────────────────────────────────────
//

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all events (paginated, searchable, filterable)
 *     tags: [Events]
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
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, description, or location
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
 *         description: Filter upcoming events
 *       - in: query
 *         name: past
 *         schema:
 *           type: boolean
 *         description: Filter past events
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [startDate, createdAt, title]
 *           default: startDate
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *     responses:
 *       200:
 *         description: List of events with pagination
 */
eventsRouter.get("/", getAllEvents);

/**
 * @swagger
 * /events/upcoming:
 *   get:
 *     summary: Get upcoming events
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Upcoming events
 */
eventsRouter.get("/upcoming", getUpcomingEvents);

/**
 * @swagger
 * /events/past:
 *   get:
 *     summary: Get past events
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Past events
 */
eventsRouter.get("/past", getPastEvents);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get event by ID (with gallery)
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event details with gallery images
 *       404:
 *         description: Event not found
 */
eventsRouter.get("/:id", getEventById);

/**
 * @swagger
 * /events/{eventId}/gallery:
 *   get:
 *     summary: Get event gallery images
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event gallery images
 */
eventsRouter.get("/:eventId/gallery", getEventGallery);

//
// ────────────────────────────────────────────────────────────
// GALLERY ROUTES
// ────────────────────────────────────────────────────────────
//

/**
 * @swagger
 * /events/gallery/all:
 *   get:
 *     summary: Get all gallery images (across all events)
 *     tags: [Gallery]
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
 *           default: 30
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: string
 *         description: Filter by event ID
 *     responses:
 *       200:
 *         description: Gallery images with pagination
 */
eventsRouter.get("/gallery/all", getAllGallery);

//
// ────────────────────────────────────────────────────────────
// ADMIN ROUTES - Manage Events
// ────────────────────────────────────────────────────────────
//

/**
 * @swagger
 * /events/admin/stats:
 *   get:
 *     summary: Get event statistics (Admin)
 *     tags: [Events - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event statistics
 */
eventsRouter.get("/admin/stats", adminRoleAuth, getEventStats);

/**
 * @swagger
 * /events/admin:
 *   post:
 *     summary: Create a new event (Admin only)
 *     tags: [Events - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - startDate
 *               - endDate
 *               - locationName
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Tech Conference 2025"
 *               description:
 *                 type: string
 *                 example: "Annual technology conference featuring latest innovations"
 *               image:
 *                 type: string
 *                 description: URL to event cover image
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-01T09:00:00Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-01T17:00:00Z"
 *               locationName:
 *                 type: string
 *                 example: "University Main Hall"
 *               latitude:
 *                 type: string
 *                 example: "-0.3476"
 *               longitude:
 *                 type: string
 *                 example: "36.0685"
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Invalid input
 */
eventsRouter.post("/admin", adminRoleAuth, createEvent);

/**
 * @swagger
 * /events/admin/{id}:
 *   put:
 *     summary: Update an event (Admin only)
 *     tags: [Events - Admin]
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
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               locationName:
 *                 type: string
 *               latitude:
 *                 type: string
 *               longitude:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       404:
 *         description: Event not found
 */
eventsRouter.put("/admin/:id", adminRoleAuth, updateEvent);

/**
 * @swagger
 * /events/admin/{id}:
 *   delete:
 *     summary: Delete an event (Admin only)
 *     tags: [Events - Admin]
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
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 */
eventsRouter.delete("/admin/:id", adminRoleAuth, deleteEvent);

//
// ────────────────────────────────────────────────────────────
// ADMIN ROUTES - Manage Gallery
// ────────────────────────────────────────────────────────────
//

/**
 * @swagger
 * /events/admin/gallery:
 *   post:
 *     summary: Add image to event gallery (Admin only)
 *     tags: [Events - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - imageUrl
 *             properties:
 *               eventId:
 *                 type: string
 *                 description: ID of the event
 *               imageUrl:
 *                 type: string
 *                 description: URL of the image
 *               title:
 *                 type: string
 *                 description: Caption/title for the image
 *     responses:
 *       201:
 *         description: Image added to gallery successfully
 *       400:
 *         description: Invalid input
 */
eventsRouter.post("/admin/gallery", adminRoleAuth, addGalleryImage);

/**
 * @swagger
 * /events/admin/gallery/{id}:
 *   delete:
 *     summary: Delete image from gallery (Admin only)
 *     tags: [Events - Admin]
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
 *         description: Gallery image deleted successfully
 *       404:
 *         description: Image not found
 */
eventsRouter.delete("/admin/gallery/:id", adminRoleAuth, deleteGalleryImage);
