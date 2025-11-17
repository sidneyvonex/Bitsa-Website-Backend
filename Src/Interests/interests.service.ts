import db from "../drizzle/db";
import { interests, userInterests, users } from "../drizzle/schema";
import { eq, sql, and, ilike, desc, asc } from "drizzle-orm";

//
// ────────────────────────────────────────────────────────────
// INTERESTS CRUD OPERATIONS
// ────────────────────────────────────────────────────────────
//

/**
 * Get all interests (paginated and searchable)
 * Used for: Admin managing interests, students selecting interests
 */
export const getAllInterestsService = async (
    page: number = 1,
    limit: number = 50,
    search?: string,
    sortBy: 'name' | 'createdAt' = 'name',
    sortOrder: 'asc' | 'desc' = 'asc'
) => {
    const offset = (page - 1) * limit;

    const whereConditions = search
        ? ilike(interests.name, `%${search}%`)
        : undefined;

    const orderColumn = sortBy === 'name' ? interests.name : interests.createdAt;
    const orderDirection = sortOrder === 'asc' ? asc(orderColumn) : desc(orderColumn);

    const [allInterests, totalCount] = await Promise.all([
        db.select()
            .from(interests)
            .where(whereConditions)
            .orderBy(orderDirection)
            .limit(limit)
            .offset(offset),
        db.select({ count: sql<number>`count(*)` })
            .from(interests)
            .where(whereConditions)
            .then((result: any) => Number(result[0].count))
    ]);

    return {
        interests: allInterests,
        pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit)
        }
    };
};

/**
 * Get a single interest by ID
 */
export const getInterestByIdService = async (interestId: string) => {
    const [interest] = await db.select()
        .from(interests)
        .where(eq(interests.id, interestId));

    return interest;
};

/**
 * Create a new interest (Admin only)
 */
export const createInterestService = async (name: string) => {
    const [newInterest] = await db.insert(interests)
        .values({ name })
        .returning();

    return newInterest;
};

/**
 * Update an interest (Admin only)
 */
export const updateInterestService = async (interestId: string, name: string) => {
    const [updatedInterest] = await db.update(interests)
        .set({ name })
        .where(eq(interests.id, interestId))
        .returning();

    return updatedInterest;
};

/**
 * Delete an interest (Admin only)
 * Note: Cascading delete will remove all userInterests associations
 */
export const deleteInterestService = async (interestId: string) => {
    const [deletedInterest] = await db.delete(interests)
        .where(eq(interests.id, interestId))
        .returning();

    return deletedInterest;
};

//
// ────────────────────────────────────────────────────────────
// USER INTERESTS OPERATIONS
// ────────────────────────────────────────────────────────────
//

/**
 * Get all interests for a specific user
 * CRITICAL: First thing students see after registration/login
 */
export const getUserInterestsService = async (userId: string) => {
    const userInterestsList = await db.select({
        interestId: interests.id,
        interestName: interests.name,
        addedAt: userInterests.createdAt
    })
        .from(userInterests)
        .innerJoin(interests, eq(userInterests.interestId, interests.id))
        .where(eq(userInterests.userId, userId))
        .orderBy(asc(interests.name));

    return userInterestsList;
};

/**
 * Get all interests for a user by schoolId (for easier frontend access)
 */
export const getUserInterestsBySchoolIdService = async (schoolId: string) => {
    // First get the user's UUID from schoolId
    const [user] = await db.select({ id: users.id })
        .from(users)
        .where(and(
            eq(users.schoolId, schoolId),
            sql`${users.deletedAt} IS NULL`
        ));

    if (!user) {
        return [];
    }

    return getUserInterestsService(user.id);
};

/**
 * Add interests to a user
 * Used when: Student first selects interests or updates them
 */
export const addUserInterestsService = async (userId: string, interestIds: string[]) => {
    // Remove duplicates
    const uniqueInterestIds = [...new Set(interestIds)];

    // Prepare insert values
    const values = uniqueInterestIds.map(interestId => ({
        userId,
        interestId
    }));

    // Insert all at once (on conflict do nothing to handle duplicates)
    const newUserInterests = await db.insert(userInterests)
        .values(values)
        .onConflictDoNothing()
        .returning();

    return newUserInterests;
};

/**
 * Remove a specific interest from a user
 */
export const removeUserInterestService = async (userId: string, interestId: string) => {
    const [removed] = await db.delete(userInterests)
        .where(and(
            eq(userInterests.userId, userId),
            eq(userInterests.interestId, interestId)
        ))
        .returning();

    return removed;
};

/**
 * Replace all user interests (removes old ones, adds new ones)
 * Useful for "update my interests" functionality
 */
export const replaceUserInterestsService = async (userId: string, interestIds: string[]) => {
    // Remove all existing interests for this user
    await db.delete(userInterests)
        .where(eq(userInterests.userId, userId));

    // Add new interests if any provided
    if (interestIds.length > 0) {
        return addUserInterestsService(userId, interestIds);
    }

    return [];
};

/**
 * Get users who share a specific interest
 * Useful for: Finding people with similar interests
 */
export const getUsersByInterestService = async (interestId: string, limit: number = 20) => {
    const usersWithInterest = await db.select({
        schoolId: users.schoolId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        major: users.major,
        yearOfStudy: users.yearOfStudy,
        profilePicture: users.profilePicture,
        bio: users.bio
    })
        .from(userInterests)
        .innerJoin(users, eq(userInterests.userId, users.id))
        .where(and(
            eq(userInterests.interestId, interestId),
            sql`${users.deletedAt} IS NULL`,
            eq(users.isActive, true)
        ))
        .limit(limit);

    return usersWithInterest;
};

/**
 * Get interest statistics
 * Shows: How many users have each interest
 */
export const getInterestStatsService = async () => {
    const stats = await db.select({
        interestId: interests.id,
        interestName: interests.name,
        userCount: sql<number>`count(${userInterests.userId})::int`
    })
        .from(interests)
        .leftJoin(userInterests, eq(interests.id, userInterests.interestId))
        .groupBy(interests.id, interests.name)
        .orderBy(desc(sql`count(${userInterests.userId})`));

    return stats;
};

/**
 * Check if user has selected any interests
 * Used to: Determine if student needs to see interest selection screen
 */
export const hasUserSelectedInterestsService = async (userId: string): Promise<boolean> => {
    const [result] = await db.select({ count: sql<number>`count(*)` })
        .from(userInterests)
        .where(eq(userInterests.userId, userId));

    return Number(result.count) > 0;
};
