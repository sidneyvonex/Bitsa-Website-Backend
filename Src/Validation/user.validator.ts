import { z } from "zod";

export const userValidator = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    schoolId: z.string().min(1, "School ID is required"),
    schoolName: z.string().optional(),
    major: z.string().min(1, "Major is required"),
    yearOfStudy: z.number().min(1).max(6).optional(),
    userRole: z.string().optional(),
});

export const loginValidator = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export type TUserInput = z.infer<typeof userValidator>;
