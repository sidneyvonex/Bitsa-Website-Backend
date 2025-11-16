import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUserService, getUserByEmailService, getUserByIdService, updateEmailVerificationService, storePasswordResetTokenService, getUserByResetTokenService, updateUserPasswordService, storeEmailVerificationTokenService, getUserByVerificationTokenService, generateSecureToken } from "./auth.service";
import { loginValidator, userValidator } from "../Validation/user.validator";
import { sendWelcomeEmail, sendPasswordResetEmail, sendAccountVerificationEmail } from "../Emails/emailService";
import { getPasswordResetSuccessEmail, getEmailVerificationSuccessEmail } from "../Emails/emailTemplates";
import { sendEventEmail } from "../Middleware/googleMailer";

export const createUser = async (req: Request, res: Response) => {
    try {
        const parseResult = userValidator.safeParse(req.body)
        if (!parseResult.success) {
            res.status(400).json({ error: parseResult.error.issues })
            return;
        }
        const { firstName, lastName, email, password, schoolId, schoolName, yearOfStudy, major } = req.body;
        
        if (!firstName || !lastName || !email || !password || !schoolId || !major) {
            res.status(400).json({ error: "firstName, lastName, email, password, schoolId and major are required" });
            return;
        }

        const existingUser = await getUserByEmailService(email);
        if (existingUser) {
            res.status(409).json({ error: "Email already exists" });
            return;
        }

        const existingBySchoolId = await getUserByIdService(schoolId);
        if (existingBySchoolId) {
            res.status(409).json({ error: "School ID already exists" });
            return;
        }

        const saltRounds = 12;
        const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(saltRounds));

        const yOfStudy = yearOfStudy ? Number(yearOfStudy) : 1;
        const defaultSchoolName = 'University of Eastern Africa Baraton';

        // Valid major enum values
        const validMajors = ["Software Engineering", "Computer Science", "Networking", "Cybersecurity", "BBIT", "Data Science", "Other"];
        const isValidMajor = validMajors.includes(major);

        const newUser = await createUserService({
            schoolId,
            isInternal: false,
            schoolName: schoolName || defaultSchoolName,
            email,
            passwordHash: hashedPassword,
            firstName,
            lastName,
            major: isValidMajor ? major : "Other",
            customMajor: isValidMajor ? undefined : major,
            yearOfStudy: yOfStudy,
            role: 'student',
        });

        await sendWelcomeEmail({
            recipientEmail: email,
            recipientName: `${firstName} ${lastName}`
        });

        res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to create user" });
    }
}

export const loginUser = async (req: Request, res: Response) => {
    try {
        const parseResult = loginValidator.safeParse(req.body)
        if (!parseResult.success) {
            res.status(400).json({ error: parseResult.error.issues })
            return;
        }

        const existingUser = await getUserByEmailService(req.body.email);
        if (!existingUser) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        const isMatch = bcrypt.compareSync(req.body.password, existingUser.passwordHash)
        if (!isMatch) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }

        const payload = {
            userId: existingUser.schoolId,
            email: existingUser.email,
            fullName: `${existingUser.firstName} ${existingUser.lastName}`,
            userRole: existingUser.role,
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
        }
        
        const secret = process.env.JWT_SECRET as string;
        const token = jwt.sign(payload, secret);
        
        res.status(200).json({ 
            token, 
            userId: existingUser.schoolId, 
            email: existingUser.email, 
            fullName: `${existingUser.firstName} ${existingUser.lastName}`, 
            userRole: existingUser.role, 
            profileUrl: existingUser.profilePicture 
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to login user" });
    }
}

export const adminCreateUser = async (req: Request, res: Response) => {
    try {
        const parseResult = userValidator.safeParse(req.body)
        if (!parseResult.success) {
            res.status(400).json({ error: parseResult.error.issues })
            return;
        }
        
        const { firstName, lastName, email, password, schoolId, schoolName, yearOfStudy, userRole, major } = req.body;
        
        if (!firstName || !lastName || !email || !password || !schoolId || !major) {
            res.status(400).json({ error: "firstName, lastName, email, password, schoolId and major are required" });
            return;
        }

        const existingUser = await getUserByEmailService(email);
        if (existingUser) {
            res.status(409).json({ error: "Email already exists" });
            return;
        }

        const existingBySchoolIdAdmin = await getUserByIdService(schoolId);
        if (existingBySchoolIdAdmin) {
            res.status(409).json({ error: "School ID already exists" });
            return;
        }

        const saltRounds = 12;
        const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(saltRounds));

        const yOfStudy = yearOfStudy ? Number(yearOfStudy) : 1;
        const defaultSchoolName = 'University of Eastern Africa Baraton(UEAB)';

        const requestedRole = (userRole || 'student').toLowerCase();
        const creatorRole = (req.user?.userRole || '').toLowerCase();
        
        if (requestedRole === 'superadmin' && creatorRole !== 'superadmin') {
            res.status(403).json({ error: 'Only a superadmin can create a superadmin account' });
            return;
        }

        const newUser = await createUserService({
            schoolId,
            isInternal: false,
            schoolName: schoolName || defaultSchoolName,
            firstName,
            lastName,
            email,
            major,
            passwordHash: hashedPassword,
            yearOfStudy: yOfStudy,
            role: userRole || 'student',
            emailVerified: true,
        });

        await sendWelcomeEmail({
            recipientEmail: email,
            recipientName: `${firstName} ${lastName}`
        });

        res.status(201).json({
            message: "User account created successfully by admin",
            user: { firstName, lastName, email, userRole: userRole || 'student' }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to create user account" });
    }
}

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ error: "Email is required" });
            return;
        }

        const user = await getUserByEmailService(email);
        if (!user) {
            res.status(404).json({ error: "User with this email does not exist" });
            return;
        }

        const resetToken = generateSecureToken();
        const resetTokenExpiry = new Date(Date.now() + 3600000);

        await storePasswordResetTokenService(email, resetToken, resetTokenExpiry);

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

        await sendPasswordResetEmail({
            recipientEmail: email,
            recipientName: `${user.firstName} ${user.lastName}`
        }, resetUrl);

        res.status(200).json({
            message: "Password reset email sent successfully. Please check your email."
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to process forgot password request" });
    }
}

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            res.status(400).json({ error: "Token and new password are required" });
            return;
        }

        if (newPassword.length < 6) {
            res.status(400).json({ error: "Password must be at least 6 characters long" });
            return;
        }

        const user = await getUserByResetTokenService(token);
        if (!user) {
            res.status(400).json({ error: "Invalid or expired reset token" });
            return;
        }

        if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
            res.status(400).json({ error: "Reset token has expired" });
            return;
        }

        const saltRounds = 12;
        const hashedPassword = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(saltRounds));

        await updateUserPasswordService(user.schoolId, hashedPassword);

        const tpl = getPasswordResetSuccessEmail(user.firstName);
        await sendEventEmail(user.email, `${user.firstName} ${user.lastName}`, tpl.subject, tpl.body);

        res.status(200).json({
            message: "Password reset successfully. A confirmation email has been sent to your email address."
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to reset password" });
    }
}

export const sendEmailVerification = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ error: "Email is required" });
            return;
        }

        const user = await getUserByEmailService(email);
        if (!user) {
            res.status(404).json({ error: "User with this email does not exist" });
            return;
        }

        if (user.emailVerified === true) {
            res.status(400).json({ error: "Email is already verified" });
            return;
        }

        const verificationToken = generateSecureToken();
        const verificationTokenExpiry = new Date(Date.now() + 24 * 3600000);

        await storeEmailVerificationTokenService(user.schoolId, verificationToken, verificationTokenExpiry);

        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

        await sendAccountVerificationEmail({
            recipientEmail: email,
            recipientName: `${user.firstName} ${user.lastName}`
        }, verificationUrl);

        res.status(200).json({
            message: "Verification email sent successfully. Please check your email."
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to send verification email" });
    }
}

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({ error: "Verification token is required" });
            return;
        }

        const user = await getUserByVerificationTokenService(token);
        if (!user) {
            res.status(400).json({ error: "Invalid or expired verification token" });
            return;
        }

        if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
            res.status(400).json({ error: "Verification token has expired" });
            return;
        }

        await updateEmailVerificationService(user.schoolId, true);
        await storeEmailVerificationTokenService(user.schoolId, '', new Date());

        const tpl = getEmailVerificationSuccessEmail(user.firstName);
        await sendEventEmail(user.email, `${user.firstName} ${user.lastName}`, tpl.subject, tpl.body);

        res.status(200).json({
            message: "Email verified successfully! A confirmation email has been sent. You can now log in and enjoy full access to Bitsa."
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to verify email" });
    }
}

export const resendVerificationCode = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ error: "Email is required" });
            return;
        }

        const user = await getUserByEmailService(email);
        if (!user) {
            res.status(404).json({ error: "User with this email does not exist" });
            return;
        }

        if (user.emailVerified === true) {
            res.status(400).json({ error: "Email is already verified" });
            return;
        }

        const verificationToken = generateSecureToken();
        const verificationTokenExpiry = new Date(Date.now() + 24 * 3600000);

        await storeEmailVerificationTokenService(user.schoolId, verificationToken, verificationTokenExpiry);

        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

        await sendAccountVerificationEmail({
            recipientEmail: email,
            recipientName: `${user.firstName} ${user.lastName}`
        }, verificationUrl);

        res.status(200).json({
            message: "New verification code sent successfully. Please check your email."
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to resend verification code" });
    }
}