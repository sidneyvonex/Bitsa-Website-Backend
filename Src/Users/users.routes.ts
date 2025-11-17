import { Router } from "express";
import {
    getCurrentUserProfile,
    getUserBySchoolId,
    getAllUsers,
    updateCurrentUserProfile,
    updateUserBySchoolId,
    updateUserRole,
    deactivateUser,
    activateUser,
    deleteUser,
    updateProfilePicture,
    updateBio,
    getUsersByRole,
    getUsersByMajor,
    searchUsers,
    getUserStats
} from "./users.controller";
import { authenticate, adminRoleAuth, superAdminAuth } from "../Middleware/bearAuth";

export const usersRouter = Router();

// Public/authenticated user endpoints
usersRouter.get('/users/me', authenticate, getCurrentUserProfile);
/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     description: Returns the authenticated user's profile information
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */

usersRouter.put('/users/me', authenticate, updateCurrentUserProfile);
/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Update current user profile
 *     description: Updates the authenticated user's profile information
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               bio:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *               yearOfStudy:
 *                 type: number
 *               major:
 *                 type: string
 *               customMajor:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */

usersRouter.put('/users/me/profile-picture', authenticate, updateProfilePicture);
/**
 * @swagger
 * /users/me/profile-picture:
 *   put:
 *     summary: Update profile picture
 *     description: Updates the authenticated user's profile picture
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 description: URL of the profile picture
 *     responses:
 *       200:
 *         description: Profile picture updated successfully
 *       400:
 *         description: Profile picture URL is required
 */

usersRouter.put('/users/me/bio', authenticate, updateBio);
/**
 * @swagger
 * /users/me/bio:
 *   put:
 *     summary: Update bio
 *     description: Updates the authenticated user's bio
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bio updated successfully
 */

usersRouter.get('/users/search', authenticate, searchUsers);
/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Search users
 *     description: Search users by name, email, or school ID
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Search query is required
 */

// Admin endpoints
usersRouter.get('/users', adminRoleAuth, getAllUsers);
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Admin only)
 *     description: Returns a paginated list of all users with optional filters
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
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
 *           default: 10
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, admin, superadmin]
 *       - in: query
 *         name: major
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       403:
 *         description: Access denied - Admin role required
 */

usersRouter.get('/users/stats', adminRoleAuth, getUserStats);
/**
 * @swagger
 * /users/stats:
 *   get:
 *     summary: Get user statistics (Admin only)
 *     description: Returns statistics about users (total, active, by role, by major)
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       403:
 *         description: Access denied - Admin role required
 */

usersRouter.get('/users/role/:role', adminRoleAuth, getUsersByRole);
/**
 * @swagger
 * /users/role/{role}:
 *   get:
 *     summary: Get users by role (Admin only)
 *     description: Returns all users with the specified role
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [student, admin, superadmin]
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       400:
 *         description: Invalid role
 *       403:
 *         description: Access denied - Admin role required
 */

usersRouter.get('/users/major/:major', authenticate, getUsersByMajor);
/**
 * @swagger
 * /users/major/{major}:
 *   get:
 *     summary: Get users by major
 *     description: Returns all users with the specified major
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: major
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */

usersRouter.get('/users/:schoolId', authenticate, getUserBySchoolId);
/**
 * @swagger
 * /users/{schoolId}:
 *   get:
 *     summary: Get user by school ID
 *     description: Returns user profile by school ID (self or admin only)
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 */

usersRouter.put('/users/:schoolId', adminRoleAuth, updateUserBySchoolId);
/**
 * @swagger
 * /users/{schoolId}:
 *   put:
 *     summary: Update user by school ID (Admin only)
 *     description: Updates user information by school ID
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: schoolId
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
 *         description: User updated successfully
 *       403:
 *         description: Access denied - Admin role required
 *       404:
 *         description: User not found
 */

usersRouter.put('/users/:schoolId/role', adminRoleAuth, updateUserRole);
/**
 * @swagger
 * /users/{schoolId}/role:
 *   put:
 *     summary: Update user role (Admin only)
 *     description: Updates user role (superadmin can only assign superadmin role)
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: schoolId
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
 *               role:
 *                 type: string
 *                 enum: [student, admin, superadmin]
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Invalid role
 *       403:
 *         description: Access denied or insufficient permissions
 */

usersRouter.put('/users/:schoolId/deactivate', authenticate, deactivateUser);
/**
 * @swagger
 * /users/{schoolId}/deactivate:
 *   put:
 *     summary: Deactivate user
 *     description: Deactivates a user account (self or admin)
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *       403:
 *         description: Access denied
 */

usersRouter.put('/users/:schoolId/activate', adminRoleAuth, activateUser);
/**
 * @swagger
 * /users/{schoolId}/activate:
 *   put:
 *     summary: Activate user (Admin only)
 *     description: Activates a deactivated user account
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User activated successfully
 *       403:
 *         description: Access denied - Admin role required
 */

usersRouter.delete('/users/:schoolId', superAdminAuth, deleteUser);
/**
 * @swagger
 * /users/{schoolId}:
 *   delete:
 *     summary: Delete user (SuperAdmin only)
 *     description: Permanently deletes a user account
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       403:
 *         description: Access denied - SuperAdmin role required
 */
