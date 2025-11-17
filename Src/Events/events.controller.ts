import { Request, Response } from "express";
import {
    getAllEventsService,
    getEventByIdService,
    getUpcomingEventsService,
    getPastEventsService,
    createEventService,
    updateEventService,
    deleteEventService,
    getEventStatsService,
    addEventGalleryImageService,
    getEventGalleryService,
    deleteGalleryImageService,
    getAllGalleryImagesService
} from "./events.service";
import { logAuditEvent } from "../Middleware/auditLogger";
import db from "../drizzle/db";
import { users } from "../drizzle/schema";
import { eq, sql, and } from "drizzle-orm";

//
// ────────────────────────────────────────────────────────────
// PUBLIC - View Events
// ────────────────────────────────────────────────────────────
//

export const getAllEvents = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const search = req.query.search as string;
        const upcoming = req.query.upcoming === 'true';
        const past = req.query.past === 'true';
        const sortBy = (req.query.sortBy as 'startDate' | 'createdAt' | 'title') || 'startDate';
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

        const result = await getAllEventsService(page, limit, search, upcoming, past, sortBy, sortOrder);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch events" });
    }
};

export const getEventById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const event = await getEventByIdService(id);

        if (!event) {
            res.status(404).json({ error: "Event not found" });
            return;
        }

        res.status(200).json(event);
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch event" });
    }
};

export const getUpcomingEvents = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        const events = await getUpcomingEventsService(limit);
        res.status(200).json({ events, count: events.length });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch upcoming events" });
    }
};

export const getPastEvents = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        const events = await getPastEventsService(limit);
        res.status(200).json({ events, count: events.length });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch past events" });
    }
};

export const getEventGallery = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;
        const images = await getEventGalleryService(eventId);
        res.status(200).json({ images, count: images.length });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch event gallery" });
    }
};

export const getAllGallery = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 30;
        const eventId = req.query.eventId as string;

        const result = await getAllGalleryImagesService(page, limit, eventId);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch gallery" });
    }
};

//
// ────────────────────────────────────────────────────────────
// ADMIN - Manage Events
// ────────────────────────────────────────────────────────────
//

export const createEvent = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId; // schoolId from token

        if (!userId) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }

        const {
            title,
            description,
            image,
            startDate,
            endDate,
            locationName,
            latitude,
            longitude
        } = req.body;

        // Validation
        if (!title || title.trim() === "") {
            res.status(400).json({ error: "Event title is required" });
            return;
        }

        if (!description || description.trim() === "") {
            res.status(400).json({ error: "Event description is required" });
            return;
        }

        if (!startDate) {
            res.status(400).json({ error: "Event start date is required" });
            return;
        }

        if (!endDate) {
            res.status(400).json({ error: "Event end date is required" });
            return;
        }

        if (!locationName || locationName.trim() === "") {
            res.status(400).json({ error: "Event location is required" });
            return;
        }

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start >= end) {
            res.status(400).json({ error: "End date must be after start date" });
            return;
        }

        // Get user UUID
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

        const newEvent = await createEventService({
            title: title.trim(),
            description: description.trim(),
            image,
            startDate: start,
            endDate: end,
            locationName: locationName.trim(),
            latitude,
            longitude,
            createdBy: user.id
        });

        // Log event creation
        await logAuditEvent(
            req,
            "CREATE",
            `Event created: ${title}`,
            "Event",
            newEvent.id,
            { title, startDate, endDate, location: locationName }
        );

        res.status(201).json({ 
            message: "Event created successfully", 
            event: newEvent 
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to create event" });
    }
};

export const updateEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId; // schoolId from token

        if (!userId) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }

        // Check if event exists
        const existingEvent = await getEventByIdService(id);
        if (!existingEvent) {
            res.status(404).json({ error: "Event not found" });
            return;
        }

        const {
            title,
            description,
            image,
            startDate,
            endDate,
            locationName,
            latitude,
            longitude
        } = req.body;

        const updates: any = {};

        if (title !== undefined) updates.title = title.trim();
        if (description !== undefined) updates.description = description.trim();
        if (image !== undefined) updates.image = image;
        if (locationName !== undefined) updates.locationName = locationName.trim();
        if (latitude !== undefined) updates.latitude = latitude;
        if (longitude !== undefined) updates.longitude = longitude;

        // Validate and update dates
        if (startDate !== undefined) {
            updates.startDate = new Date(startDate);
        }
        if (endDate !== undefined) {
            updates.endDate = new Date(endDate);
        }

        // Validate date logic if both provided
        if (updates.startDate && updates.endDate && updates.startDate >= updates.endDate) {
            res.status(400).json({ error: "End date must be after start date" });
            return;
        }

        const updatedEvent = await updateEventService(id, updates);

        // Log event update
        await logAuditEvent(
            req,
            "UPDATE",
            `Event updated: ${existingEvent.title}`,
            "Event",
            id,
            { updatedFields: Object.keys(updates) },
            existingEvent,
            updatedEvent
        );

        res.status(200).json({ 
            message: "Event updated successfully", 
            event: updatedEvent 
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to update event" });
    }
};

export const deleteEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId; // schoolId from token

        if (!userId) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }

        // Check if event exists
        const existingEvent = await getEventByIdService(id);
        if (!existingEvent) {
            res.status(404).json({ error: "Event not found" });
            return;
        }

        await deleteEventService(id);

        // Log event deletion
        await logAuditEvent(
            req,
            "DELETE",
            `Event deleted: ${existingEvent.title}`,
            "Event",
            id,
            {},
            existingEvent
        );

        res.status(200).json({ message: "Event deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to delete event" });
    }
};

export const getEventStats = async (req: Request, res: Response) => {
    try {
        const stats = await getEventStatsService();
        res.status(200).json(stats);
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch event statistics" });
    }
};

//
// ────────────────────────────────────────────────────────────
// ADMIN - Manage Gallery
// ────────────────────────────────────────────────────────────
//

export const addGalleryImage = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId; // schoolId from token

        if (!userId) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }

        const { eventId, imageUrl, title } = req.body;

        if (!eventId) {
            res.status(400).json({ error: "Event ID is required" });
            return;
        }

        if (!imageUrl || imageUrl.trim() === "") {
            res.status(400).json({ error: "Image URL is required" });
            return;
        }

        // Get user UUID
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

        const newImage = await addEventGalleryImageService({
            eventId,
            imageUrl: imageUrl.trim(),
            title: title?.trim(),
            uploadedBy: user.id
        });

        // Log gallery upload
        await logAuditEvent(
            req,
            "CREATE",
            `Gallery image uploaded for event ${eventId}`,
            "Gallery",
            newImage.id,
            { eventId, title }
        );

        res.status(201).json({ 
            message: "Image added to gallery successfully", 
            image: newImage 
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to add gallery image" });
    }
};

export const deleteGalleryImage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId; // schoolId from token

        if (!userId) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }

        const deletedImage = await deleteGalleryImageService(id);

        if (!deletedImage) {
            res.status(404).json({ error: "Gallery image not found" });
            return;
        }

        // Log gallery deletion
        await logAuditEvent(
            req,
            "DELETE",
            `Gallery image deleted: ${id}`,
            "Gallery",
            id,
            {},
            deletedImage
        );

        res.status(200).json({ message: "Gallery image deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to delete gallery image" });
    }
};
