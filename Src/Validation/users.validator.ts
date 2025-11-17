import { z } from "zod";

// Update profile validation
export const updateProfileValidator = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters").max(100).optional(),
    lastName: z.string().min(2, "Last name must be at least 2 characters").max(100).optional(),
    bio: z.string().max(500, "Bio must not exceed 500 characters").optional().nullable(),
    profilePicture: z.string().url("Must be a valid URL").optional().nullable(),
    yearOfStudy: z.number().int().min(1).max(7).optional(),
    major: z.enum([
        "Software Engineering",
        "Computer Science",
        "Networking",
        "Cybersecurity",
        "BBIT",
        "Data Science",
        "Other"
    ]).optional(),
    customMajor: z.string().max(255).optional(),
});

// Update role validation
export const updateRoleValidator = z.object({
    role: z.enum(["student", "admin", "superadmin"])
});

// Profile picture validation
export const updateProfilePictureValidator = z.object({
    profilePicture: z.string().url("Must be a valid URL")
});

// Bio validation
export const updateBioValidator = z.object({
    bio: z.string().max(500, "Bio must not exceed 500 characters")
});

// Search validation
export const searchQueryValidator = z.object({
    q: z.string().min(1, "Search query must not be empty"),
    limit: z.number().int().min(1).max(50).optional().default(10)
});

// Pagination validation
export const paginationValidator = z.object({
    page: z.number().int().min(1).optional().default(1),
    limit: z.number().int().min(1).max(100).optional().default(10),
    role: z.enum(["student", "admin", "superadmin"]).optional(),
    major: z.string().optional(),
    search: z.string().optional()
});
