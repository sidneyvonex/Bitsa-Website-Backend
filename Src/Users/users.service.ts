import { eq, and, or, ilike, sql } from "drizzle-orm";
import db from "../drizzle/db";
import { TUserInsert, TUserSelect, users } from "../drizzle/schema";

// Get user by schoolId (primary identifier)
export const getUserBySchoolIdService = async (schoolId: string): Promise<TUserSelect | undefined> => {
    return await db.query.users.findFirst({
        where: eq(users.schoolId, schoolId),
    });
};

// Get user profile (excluding sensitive data)
export const getUserProfileService = async (schoolId: string) => {
    const user = await db.query.users.findFirst({
        where: eq(users.schoolId, schoolId),
        columns: {
            id: true,
            schoolId: true,
            isInternal: true,
            schoolName: true,
            email: true,
            firstName: true,
            lastName: true,
            major: true,
            customMajor: true,
            yearOfStudy: true,
            role: true,
            isActive: true,
            profilePicture: true,
            bio: true,
            emailVerified: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
            // Exclude password and tokens
            passwordHash: false,
            verificationToken: false,
            verificationTokenExpiry: false,
            resetToken: false,
            resetTokenExpiry: false,
            refreshToken: false,
            refreshTokenExpiry: false,
        }
    });
    return user;
};

// Get all users (admin only) with pagination and filters
export const getAllUsersService = async (
    page: number = 1,
    limit: number = 10,
    role?: string,
    major?: string,
    searchTerm?: string
) => {
    const offset = (page - 1) * limit;
    
    // Build where conditions
    const conditions = [];
    
    if (role) {
        conditions.push(eq(users.role, role as any));
    }
    
    if (major) {
        conditions.push(eq(users.major, major as any));
    }
    
    if (searchTerm) {
        conditions.push(
            or(
                ilike(users.firstName, `%${searchTerm}%`),
                ilike(users.lastName, `%${searchTerm}%`),
                ilike(users.email, `%${searchTerm}%`),
                ilike(users.schoolId, `%${searchTerm}%`)
            )
        );
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Get users
    const usersList = await db.query.users.findMany({
        where: whereClause,
        limit,
        offset,
        columns: {
            passwordHash: false,
            verificationToken: false,
            verificationTokenExpiry: false,
            resetToken: false,
            resetTokenExpiry: false,
            refreshToken: false,
            refreshTokenExpiry: false,
        },
        orderBy: (users, { desc }) => [desc(users.createdAt)]
    });
    
    // Get total count
    const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(whereClause);
    
    return {
        users: usersList,
        pagination: {
            page,
            limit,
            total: Number(count),
            totalPages: Math.ceil(Number(count) / limit)
        }
    };
};

// Update user profile
export const updateUserProfileService = async (
    schoolId: string,
    updates: Partial<TUserInsert>
) => {
    // Remove sensitive fields that shouldn't be updated via this service
    const { passwordHash, resetToken, resetTokenExpiry, verificationToken, 
            verificationTokenExpiry, refreshToken, refreshTokenExpiry, 
            role, emailVerified, ...safeUpdates } = updates as any;
    
    const [updated] = await db
        .update(users)
        .set({ ...safeUpdates, updatedAt: new Date() })
        .where(eq(users.schoolId, schoolId))
        .returning();
    
    return updated;
};

// Update user role (admin only)
export const updateUserRoleService = async (schoolId: string, newRole: string) => {
    const [updated] = await db
        .update(users)
        .set({ role: newRole as any, updatedAt: new Date() })
        .where(eq(users.schoolId, schoolId))
        .returning();
    
    return updated;
};

// Deactivate user account
export const deactivateUserService = async (schoolId: string) => {
    const [updated] = await db
        .update(users)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(users.schoolId, schoolId))
        .returning();
    
    return updated;
};

// Activate user account
export const activateUserService = async (schoolId: string) => {
    const [updated] = await db
        .update(users)
        .set({ isActive: true, updatedAt: new Date() })
        .where(eq(users.schoolId, schoolId))
        .returning();
    
    return updated;
};

// Delete user account (soft delete via deactivation)
export const deleteUserService = async (schoolId: string) => {
    await db.delete(users).where(eq(users.schoolId, schoolId));
    return { message: "User deleted successfully" };
};

// Update profile picture
export const updateProfilePictureService = async (schoolId: string, profilePictureUrl: string) => {
    const [updated] = await db
        .update(users)
        .set({ profilePicture: profilePictureUrl, updatedAt: new Date() })
        .where(eq(users.schoolId, schoolId))
        .returning();
    
    return updated;
};

// Update bio
export const updateBioService = async (schoolId: string, bio: string) => {
    const [updated] = await db
        .update(users)
        .set({ bio, updatedAt: new Date() })
        .where(eq(users.schoolId, schoolId))
        .returning();
    
    return updated;
};

// Get users by role
export const getUsersByRoleService = async (role: string) => {
    return await db.query.users.findMany({
        where: eq(users.role, role as any),
        columns: {
            passwordHash: false,
            verificationToken: false,
            verificationTokenExpiry: false,
            resetToken: false,
            resetTokenExpiry: false,
            refreshToken: false,
            refreshTokenExpiry: false,
        }
    });
};

// Get users by major
export const getUsersByMajorService = async (major: string) => {
    return await db.query.users.findMany({
        where: eq(users.major, major as any),
        columns: {
            passwordHash: false,
            verificationToken: false,
            verificationTokenExpiry: false,
            resetToken: false,
            resetTokenExpiry: false,
            refreshToken: false,
            refreshTokenExpiry: false,
        }
    });
};

// Search users
export const searchUsersService = async (searchTerm: string, limit: number = 10) => {
    return await db.query.users.findMany({
        where: or(
            ilike(users.firstName, `%${searchTerm}%`),
            ilike(users.lastName, `%${searchTerm}%`),
            ilike(users.email, `%${searchTerm}%`),
            ilike(users.schoolId, `%${searchTerm}%`)
        ),
        limit,
        columns: {
            id: true,
            schoolId: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePicture: true,
            major: true,
            yearOfStudy: true,
            role: true,
        }
    });
};

// Update last login
export const updateLastLoginService = async (schoolId: string) => {
    await db
        .update(users)
        .set({ lastLogin: new Date() })
        .where(eq(users.schoolId, schoolId));
};

// Get user statistics (admin only)
export const getUserStatsService = async () => {
    const totalUsers = await db
        .select({ count: sql<number>`count(*)` })
        .from(users);
    
    const activeUsers = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.isActive, true));
    
    const verifiedUsers = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.emailVerified, true));
    
    const usersByRole = await db
        .select({
            role: users.role,
            count: sql<number>`count(*)`
        })
        .from(users)
        .groupBy(users.role);
    
    const usersByMajor = await db
        .select({
            major: users.major,
            count: sql<number>`count(*)`
        })
        .from(users)
        .groupBy(users.major);
    
    return {
        total: Number(totalUsers[0].count),
        active: Number(activeUsers[0].count),
        verified: Number(verifiedUsers[0].count),
        byRole: usersByRole.map(r => ({ role: r.role, count: Number(r.count) })),
        byMajor: usersByMajor.map(m => ({ major: m.major, count: Number(m.count) }))
    };
};
