import { Request, Response } from "express";
import {
    getUserBySchoolIdService,
    getUserProfileService,
    getAllUsersService,
    updateUserProfileService,
    updateUserLanguageService,
    updateUserRoleService,
    deactivateUserService,
    activateUserService,
    deleteUserService,
    updateProfilePictureService,
    updateBioService,
    getUsersByRoleService,
    getUsersByMajorService,
    searchUsersService,
    getUserStatsService
} from "./users.service";
import { logAuditEvent } from "../Middleware/auditLogger";

// Get current user profile (authenticated user)
export const getCurrentUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId; // From JWT middleware
        
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        
        const user = await getUserProfileService(userId);
        
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        
        res.status(200).json({ user });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to get user profile" });
    }
};

// Get user by schoolId (admin or self)
export const getUserBySchoolId = async (req: Request, res: Response) => {
    try {
        const { schoolId } = req.params;
        const requesterId = req.user?.userId;
        const requesterRole = req.user?.userRole;
        
        // Check if user is requesting their own profile or is admin
        if (schoolId !== requesterId && requesterRole !== 'admin' && requesterRole !== 'superadmin') {
            res.status(403).json({ error: "Access denied" });
            return;
        }
        
        const user = await getUserProfileService(schoolId);
        
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        
        res.status(200).json({ user });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to get user" });
    }
};

// Get all users (admin only)
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const role = req.query.role as string;
        const major = req.query.major as string;
        const searchTerm = req.query.search as string;
        
        const result = await getAllUsersService(page, limit, role, major, searchTerm);
        
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to get users" });
    }
};

// Update current user profile
export const updateCurrentUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        
        const { firstName, lastName, bio, profilePicture, yearOfStudy, major, customMajor } = req.body;
        
        const updates: any = {};
        if (firstName) updates.firstName = firstName;
        if (lastName) updates.lastName = lastName;
        if (bio !== undefined) updates.bio = bio;
        if (profilePicture) updates.profilePicture = profilePicture;
        if (yearOfStudy) updates.yearOfStudy = Number(yearOfStudy);
        if (major) updates.major = major;
        if (customMajor) updates.customMajor = customMajor;
        
        const oldUser = await getUserProfileService(userId);
        const updatedUser = await updateUserProfileService(userId, updates);
        
        await logAuditEvent(
            req,
            "PROFILE_UPDATE",
            `User ${userId} updated their profile`,
            "User",
            userId,
            { fields: Object.keys(updates) },
            oldUser,
            updatedUser
        );
        
        res.status(200).json({ 
            message: "Profile updated successfully", 
            user: updatedUser 
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to update profile" });
    }
};

// Update user profile by schoolId (admin only)
export const updateUserBySchoolId = async (req: Request, res: Response) => {
    try {
        const { schoolId } = req.params;
        const updates = req.body;
        
        const updatedUser = await updateUserProfileService(schoolId, updates);
        
        if (!updatedUser) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        
        res.status(200).json({ 
            message: "User updated successfully", 
            user: updatedUser 
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to update user" });
    }
};

// Update user role (admin only)
export const updateUserRole = async (req: Request, res: Response) => {
    try {
        const { schoolId } = req.params;
        const { role } = req.body;
        const requesterRole = req.user?.userRole;
        
        if (!role) {
            res.status(400).json({ error: "Role is required" });
            return;
        }
        
        // Only superadmin can assign superadmin role
        if (role === 'superadmin' && requesterRole !== 'superadmin') {
            res.status(403).json({ error: "Only superadmin can assign superadmin role" });
            return;
        }
        
        const validRoles = ['student', 'admin', 'superadmin'];
        if (!validRoles.includes(role)) {
            res.status(400).json({ error: "Invalid role" });
            return;
        }
        
        const oldUser = await getUserProfileService(schoolId);
        const updatedUser = await updateUserRoleService(schoolId, role);
        
        if (!updatedUser) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        
        await logAuditEvent(
            req,
            "ROLE_CHANGE",
            `User ${schoolId} role changed from ${oldUser?.role} to ${role}`,
            "User",
            schoolId,
            { oldRole: oldUser?.role, newRole: role },
            { role: oldUser?.role },
            { role }
        );
        
        res.status(200).json({ 
            message: "User role updated successfully", 
            user: updatedUser 
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to update user role" });
    }
};

// Deactivate user (admin or self)
export const deactivateUser = async (req: Request, res: Response) => {
    try {
        const { schoolId } = req.params;
        const requesterId = req.user?.userId;
        const requesterRole = req.user?.userRole;
        
        // Check if user is deactivating their own account or is admin
        if (schoolId !== requesterId && requesterRole !== 'admin' && requesterRole !== 'superadmin') {
            res.status(403).json({ error: "Access denied" });
            return;
        }
        
        const updatedUser = await deactivateUserService(schoolId);
        
        if (!updatedUser) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        
        await logAuditEvent(
            req,
            "DEACTIVATE",
            `User ${schoolId} was deactivated`,
            "User",
            schoolId
        );
        
        res.status(200).json({ 
            message: "User deactivated successfully", 
            user: updatedUser 
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to deactivate user" });
    }
};

// Activate user (admin only)
export const activateUser = async (req: Request, res: Response) => {
    try {
        const { schoolId } = req.params;
        
        const updatedUser = await activateUserService(schoolId);
        
        if (!updatedUser) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        
        await logAuditEvent(
            req,
            "ACTIVATE",
            `User ${schoolId} was activated`,
            "User",
            schoolId
        );
        
        res.status(200).json({ 
            message: "User activated successfully", 
            user: updatedUser 
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to activate user" });
    }
};

// Delete user (admin only)
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { schoolId } = req.params;
        const requesterRole = req.user?.userRole;
        
        // Only superadmin can delete users
        if (requesterRole !== 'superadmin') {
            res.status(403).json({ error: "Only superadmin can delete users" });
            return;
        }
        
        const userToDelete = await getUserProfileService(schoolId);
        const deletedBy = req.user?.userId || 'unknown';
        
        const deletedUser = await deleteUserService(schoolId, deletedBy);
        
        await logAuditEvent(
            req,
            "DELETE",
            `User ${schoolId} was soft deleted by ${deletedBy}`,
            "User",
            schoolId,
            { deletedBy },
            userToDelete,
            deletedUser
        );
        
        res.status(200).json({ message: "User deleted successfully (soft delete)" });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to delete user" });
    }
};

// Update profile picture
export const updateProfilePicture = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { profilePicture } = req.body;
        
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        
        if (!profilePicture) {
            res.status(400).json({ error: "Profile picture URL is required" });
            return;
        }
        
        const updatedUser = await updateProfilePictureService(userId, profilePicture);
        
        res.status(200).json({ 
            message: "Profile picture updated successfully", 
            user: updatedUser 
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to update profile picture" });
    }
};

// Update bio
export const updateBio = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { bio } = req.body;
        
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        
        if (bio === undefined) {
            res.status(400).json({ error: "Bio is required" });
            return;
        }
        
        const updatedUser = await updateBioService(userId, bio);
        
        res.status(200).json({ 
            message: "Bio updated successfully", 
            user: updatedUser 
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to update bio" });
    }
};

// Update user language preference (for topbar language switcher)
export const updateLanguagePreference = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { language } = req.body;
        
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        
        const validLanguages = ["en", "sw", "fr", "id", "de", "es", "it", "pt", "ja"];
        if (!language || !validLanguages.includes(language)) {
            res.status(400).json({ 
                error: `Invalid language. Must be one of: ${validLanguages.join(", ")}` 
            });
            return;
        }
        
        const updatedUser = await updateUserLanguageService(userId, language);
        
        await logAuditEvent(
            req,
            "PROFILE_UPDATE",
            `Updated language preference to ${language}`,
            "User",
            userId
        );
        
        res.status(200).json({ 
            message: "Language preference updated successfully", 
            language: updatedUser.preferredLanguage
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to update language preference" });
    }
};

// Get users by role (admin only)
export const getUsersByRole = async (req: Request, res: Response) => {
    try {
        const { role } = req.params;
        
        const validRoles = ['student', 'admin', 'superadmin'];
        if (!validRoles.includes(role)) {
            res.status(400).json({ error: "Invalid role" });
            return;
        }
        
        const users = await getUsersByRoleService(role);
        
        res.status(200).json({ users, count: users.length });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to get users by role" });
    }
};

// Get users by major
export const getUsersByMajor = async (req: Request, res: Response) => {
    try {
        const { major } = req.params;
        
        const users = await getUsersByMajorService(major);
        
        res.status(200).json({ users, count: users.length });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to get users by major" });
    }
};

// Search users
export const searchUsers = async (req: Request, res: Response) => {
    try {
        const { q } = req.query;
        const limit = parseInt(req.query.limit as string) || 10;
        
        if (!q) {
            res.status(400).json({ error: "Search query is required" });
            return;
        }
        
        const users = await searchUsersService(q as string, limit);
        
        res.status(200).json({ users, count: users.length });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to search users" });
    }
};

// Get user statistics (admin only)
export const getUserStats = async (req: Request, res: Response) => {
    try {
        const stats = await getUserStatsService();
        
        res.status(200).json({ stats });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to get user statistics" });
    }
};
