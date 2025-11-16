import { z } from "zod";

export const userValidator = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    schoolId: z.string().min(1),
    schoolName: z.string().optional(),
    major: z.string().min(1),
    userRole: z.string().optional(),
});

export const loginValidator = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export type TUserInput = z.infer<typeof userValidator>;
