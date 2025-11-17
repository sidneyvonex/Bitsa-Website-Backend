import db from "../drizzle/db";
import { events, users, gallery } from "../drizzle/schema";
import { eq, sql, and, ilike, desc, asc, gte, lte, or } from "drizzle-orm";

//
// ────────────────────────────────────────────────────────────
// EVENTS CRUD OPERATIONS
// ────────────────────────────────────────────────────────────
//

/**
 * Get all events (paginated, searchable, filterable)
 */
export const getAllEventsService = async (
    page: number = 1,
    limit: number = 20,
    search?: string,
    upcoming?: boolean,
    past?: boolean,
    sortBy: 'startDate' | 'createdAt' | 'title' = 'startDate',
    sortOrder: 'asc' | 'desc' = 'asc'
) => {
    const offset = (page - 1) * limit;
    const now = new Date();

    // Build where conditions
    const conditions = [];

    if (search) {
        conditions.push(
            or(
                ilike(events.title, `%${search}%`),
                ilike(events.description, `%${search}%`),
                ilike(events.locationName, `%${search}%`)
            )
        );
    }

    // Filter by upcoming/past
    if (upcoming && !past) {
        conditions.push(gte(events.startDate, now));
    } else if (past && !upcoming) {
        conditions.push(lte(events.endDate, now));
    }

    const whereConditions = conditions.length > 0 ? and(...conditions) : undefined;

    // Determine sort column
    const sortColumn = 
        sortBy === 'title' ? events.title :
        sortBy === 'createdAt' ? events.createdAt :
        events.startDate;

    const orderDirection = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const [allEvents, totalCount] = await Promise.all([
        db.select({
            id: events.id,
            title: events.title,
            description: events.description,
            image: events.image,
            startDate: events.startDate,
            endDate: events.endDate,
            locationName: events.locationName,
            latitude: events.latitude,
            longitude: events.longitude,
            createdBy: events.createdBy,
            createdAt: events.createdAt,
            // Join creator info
            creatorSchoolId: users.schoolId,
            creatorFirstName: users.firstName,
            creatorLastName: users.lastName,
            creatorEmail: users.email,
            creatorRole: users.role
        })
            .from(events)
            .leftJoin(users, eq(events.createdBy, users.id))
            .where(whereConditions)
            .orderBy(orderDirection)
            .limit(limit)
            .offset(offset),
        db.select({ count: sql<number>`count(*)` })
            .from(events)
            .where(whereConditions)
            .then((result: any) => Number(result[0].count))
    ]);

    return {
        events: allEvents,
        pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit)
        }
    };
};

/**
 * Get a single event by ID (with gallery images)
 */
export const getEventByIdService = async (eventId: string) => {
    const [event] = await db.select({
        id: events.id,
        title: events.title,
        description: events.description,
        image: events.image,
        startDate: events.startDate,
        endDate: events.endDate,
        locationName: events.locationName,
        latitude: events.latitude,
        longitude: events.longitude,
        createdBy: events.createdBy,
        createdAt: events.createdAt,
        // Join creator info
        creatorSchoolId: users.schoolId,
        creatorFirstName: users.firstName,
        creatorLastName: users.lastName,
        creatorEmail: users.email
    })
        .from(events)
        .leftJoin(users, eq(events.createdBy, users.id))
        .where(eq(events.id, eventId));

    if (!event) return null;

    // Get gallery images for this event
    const galleryImages = await db.select({
        id: gallery.id,
        title: gallery.title,
        imageUrl: gallery.imageUrl,
        uploadedBy: gallery.uploadedBy,
        createdAt: gallery.createdAt,
        uploaderSchoolId: users.schoolId,
        uploaderFirstName: users.firstName,
        uploaderLastName: users.lastName
    })
        .from(gallery)
        .leftJoin(users, eq(gallery.uploadedBy, users.id))
        .where(eq(gallery.eventId, eventId))
        .orderBy(desc(gallery.createdAt));

    return {
        ...event,
        gallery: galleryImages
    };
};

/**
 * Get upcoming events
 */
export const getUpcomingEventsService = async (limit: number = 10) => {
    const now = new Date();

    const upcomingEvents = await db.select({
        id: events.id,
        title: events.title,
        description: events.description,
        image: events.image,
        startDate: events.startDate,
        endDate: events.endDate,
        locationName: events.locationName,
        latitude: events.latitude,
        longitude: events.longitude,
        createdAt: events.createdAt,
        // Creator info
        creatorSchoolId: users.schoolId,
        creatorFirstName: users.firstName,
        creatorLastName: users.lastName
    })
        .from(events)
        .leftJoin(users, eq(events.createdBy, users.id))
        .where(gte(events.startDate, now))
        .orderBy(asc(events.startDate))
        .limit(limit);

    return upcomingEvents;
};

/**
 * Get past events
 */
export const getPastEventsService = async (limit: number = 10) => {
    const now = new Date();

    const pastEvents = await db.select({
        id: events.id,
        title: events.title,
        description: events.description,
        image: events.image,
        startDate: events.startDate,
        endDate: events.endDate,
        locationName: events.locationName,
        createdAt: events.createdAt,
        // Creator info
        creatorSchoolId: users.schoolId,
        creatorFirstName: users.firstName,
        creatorLastName: users.lastName
    })
        .from(events)
        .leftJoin(users, eq(events.createdBy, users.id))
        .where(lte(events.endDate, now))
        .orderBy(desc(events.endDate))
        .limit(limit);

    return pastEvents;
};

/**
 * Create a new event (Admin only)
 */
export const createEventService = async (eventData: {
    title: string;
    description: string;
    image?: string;
    startDate: Date;
    endDate: Date;
    locationName: string;
    latitude?: string;
    longitude?: string;
    createdBy: string; // UUID of the creator (admin)
}) => {
    const [newEvent] = await db.insert(events)
        .values({
            ...eventData,
            createdAt: new Date()
        })
        .returning();

    return newEvent;
};

/**
 * Update an event
 */
export const updateEventService = async (
    eventId: string,
    updates: Partial<{
        title: string;
        description: string;
        image: string;
        startDate: Date;
        endDate: Date;
        locationName: string;
        latitude: string;
        longitude: string;
    }>
) => {
    const [updatedEvent] = await db.update(events)
        .set(updates)
        .where(eq(events.id, eventId))
        .returning();

    return updatedEvent;
};

/**
 * Delete an event
 */
export const deleteEventService = async (eventId: string) => {
    const [deletedEvent] = await db.delete(events)
        .where(eq(events.id, eventId))
        .returning();

    return deletedEvent;
};

/**
 * Get event statistics
 */
export const getEventStatsService = async () => {
    const now = new Date();

    const [total] = await db.select({ count: sql<number>`count(*)` })
        .from(events);

    const [upcomingCount] = await db.select({ count: sql<number>`count(*)` })
        .from(events)
        .where(gte(events.startDate, now));

    const [pastCount] = await db.select({ count: sql<number>`count(*)` })
        .from(events)
        .where(lte(events.endDate, now));

    const [ongoingCount] = await db.select({ count: sql<number>`count(*)` })
        .from(events)
        .where(and(
            lte(events.startDate, now),
            gte(events.endDate, now)
        ));

    return {
        total: Number(total.count),
        upcoming: Number(upcomingCount.count),
        past: Number(pastCount.count),
        ongoing: Number(ongoingCount.count)
    };
};

//
// ────────────────────────────────────────────────────────────
// GALLERY OPERATIONS
// ────────────────────────────────────────────────────────────
//

/**
 * Add image to event gallery
 */
export const addEventGalleryImageService = async (imageData: {
    eventId: string;
    imageUrl: string;
    title?: string;
    uploadedBy: string; // UUID of uploader
}) => {
    const [newImage] = await db.insert(gallery)
        .values({
            ...imageData,
            createdAt: new Date()
        })
        .returning();

    return newImage;
};

/**
 * Get all gallery images for an event
 */
export const getEventGalleryService = async (eventId: string) => {
    const images = await db.select({
        id: gallery.id,
        title: gallery.title,
        imageUrl: gallery.imageUrl,
        uploadedBy: gallery.uploadedBy,
        createdAt: gallery.createdAt,
        uploaderSchoolId: users.schoolId,
        uploaderFirstName: users.firstName,
        uploaderLastName: users.lastName
    })
        .from(gallery)
        .leftJoin(users, eq(gallery.uploadedBy, users.id))
        .where(eq(gallery.eventId, eventId))
        .orderBy(desc(gallery.createdAt));

    return images;
};

/**
 * Delete gallery image
 */
export const deleteGalleryImageService = async (imageId: string) => {
    const [deletedImage] = await db.delete(gallery)
        .where(eq(gallery.id, imageId))
        .returning();

    return deletedImage;
};

/**
 * Get all gallery images (for gallery page)
 */
export const getAllGalleryImagesService = async (
    page: number = 1,
    limit: number = 30,
    eventId?: string
) => {
    const offset = (page - 1) * limit;

    const whereCondition = eventId ? eq(gallery.eventId, eventId) : undefined;

    const [images, totalCount] = await Promise.all([
        db.select({
            id: gallery.id,
            title: gallery.title,
            imageUrl: gallery.imageUrl,
            eventId: gallery.eventId,
            uploadedBy: gallery.uploadedBy,
            createdAt: gallery.createdAt,
            // Event info
            eventTitle: events.title,
            eventDate: events.startDate,
            // Uploader info
            uploaderSchoolId: users.schoolId,
            uploaderFirstName: users.firstName,
            uploaderLastName: users.lastName
        })
            .from(gallery)
            .leftJoin(events, eq(gallery.eventId, events.id))
            .leftJoin(users, eq(gallery.uploadedBy, users.id))
            .where(whereCondition)
            .orderBy(desc(gallery.createdAt))
            .limit(limit)
            .offset(offset),
        db.select({ count: sql<number>`count(*)` })
            .from(gallery)
            .where(whereCondition)
            .then((result: any) => Number(result[0].count))
    ]);

    return {
        images,
        pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit)
        }
    };
};

/**
 * Check if event is ongoing
 */
export const isEventOngoingService = async (eventId: string): Promise<boolean> => {
    const now = new Date();

    const [event] = await db.select({
        startDate: events.startDate,
        endDate: events.endDate
    })
        .from(events)
        .where(eq(events.id, eventId));

    if (!event) return false;

    return event.startDate <= now && event.endDate >= now;
};

/**
 * Check if event is upcoming
 */
export const isEventUpcomingService = async (eventId: string): Promise<boolean> => {
    const now = new Date();

    const [event] = await db.select({
        startDate: events.startDate
    })
        .from(events)
        .where(eq(events.id, eventId));

    if (!event) return false;

    return event.startDate > now;
};
