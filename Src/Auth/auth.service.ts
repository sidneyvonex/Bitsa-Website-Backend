import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { TUserInsert, TUserSelect, users } from "../drizzle/schema";
import bcrypt from "bcrypt";

//Create a new user
export const createUserService = async (user: TUserInsert): Promise<TUserSelect> => {
    const [created] = await db.insert(users).values(user).returning();
    return created;
};

//Get User by email
export const getUserByEmailService = async (email: string): Promise<TUserSelect | undefined> => {
    return await db.query.users.findFirst({
        where: eq(users.email, email),
    });
};

//Get User by School ID
export const getUserByIdService = async (schoolId: string): Promise<TUserSelect | undefined> => {
    return await db.query.users.findFirst({
        where: eq(users.schoolId, schoolId),
    });
};

//Update user email verification status
export const updateEmailVerificationService = async (schoolId: string,emailVerified: boolean): Promise<string> => {
    await db.update(users).set({ emailVerified }).where(eq(users.schoolId, schoolId));
    return "Email verification status updated successfully";
};

//Store password reset token
export const storePasswordResetTokenService = async (email: string,resetToken: string,resetTokenExpiry: Date): Promise<string> => {
    await db.update(users).set({
        resetToken,
        resetTokenExpiry,
    }).where(eq(users.email, email));
    return "Password reset token stored successfully";
};

//Get user by reset token
export const getUserByResetTokenService = async (resetToken: string): Promise<TUserSelect | undefined> => {
    return await db.query.users.findFirst({
        where: eq(users.resetToken, resetToken),
    });
};

//Update user password
export const updateUserPasswordService = async (schoolId: string, newPassword: string): Promise<string> => {
    await db.update(users).set({
        passwordHash: newPassword,
        resetToken: null,
        resetTokenExpiry: null,
    }).where(eq(users.schoolId, schoolId));
    return "Password updated successfully";
};

//Store email verification token
export const storeEmailVerificationTokenService = async (schoolId: string,verificationToken: string,verificationTokenExpiry: Date): Promise<string> => {
    await db.update(users).set({
        verificationToken,
        verificationTokenExpiry,
    }).where(eq(users.schoolId, schoolId));
    return "Email verification token stored successfully";
};

//Get user by verification token
export const getUserByVerificationTokenService = async (verificationToken: string): Promise<TUserSelect | undefined> => {
    return await db.query.users.findFirst({
        where: eq(users.verificationToken, verificationToken),
    });
};

//Generate secure random token using bcrypt
export const generateSecureToken = (): string => {
    const randomString = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    // Hash and sanitize to alphanumeric token
    return bcrypt.hashSync(randomString, salt).replace(/[^a-zA-Z0-9]/g, '').substring(0, 64);
};