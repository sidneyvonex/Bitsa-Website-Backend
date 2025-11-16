import { sendEventEmail, sendPasswordResetEmail as sendPasswordResetRaw, sendAccountVerification as sendAccountVerificationRaw } from '../Middleware/googleMailer';
import * as Templates from './emailTemplates';

export interface EmailData {
    recipientEmail: string;
    recipientName: string;
    role?: 'user' | 'admin';
}

export const sendWelcomeEmail = async (emailData: EmailData) => {
    const tpl = Templates.getWelcomeTemplate(emailData.recipientName);
    return sendEventEmail(emailData.recipientEmail, emailData.recipientName, tpl.subject, tpl.body, emailData.role || 'user', 'account_verification');
};

export const sendPasswordResetEmail = async (emailData: EmailData, resetUrl: string) => {
    const tpl = Templates.getPasswordResetTemplate(emailData.recipientName, resetUrl);
    return sendPasswordResetRaw(emailData.recipientEmail, emailData.recipientName, '', resetUrl);
};

export const sendAccountVerificationEmail = async (emailData: EmailData, verifyUrl: string) => {
    const tpl = Templates.getAccountVerificationTemplate(emailData.recipientName, verifyUrl);
    return sendAccountVerificationRaw(emailData.recipientEmail, emailData.recipientName, verifyUrl);
};

export const sendBookingConfirmation = async (emailData: EmailData, details: { eventTitle: string; venueName: string; date: string; time: string; quantity: number; total: number; bookingId: number }) => {
    const tpl = Templates.getBookingConfirmationTemplate(emailData.recipientName, details.eventTitle, details.venueName, details.date, details.time, details.quantity, details.total, details.bookingId);
    return sendEventEmail(emailData.recipientEmail, emailData.recipientName, tpl.subject, tpl.body, emailData.role || 'user', 'booking_confirmation');
};

export const sendPaymentConfirmation = async (emailData: EmailData, eventTitle: string, amount: number, transactionId: string) => {
    const tpl = Templates.getPaymentConfirmationTemplate(emailData.recipientName, eventTitle, amount, transactionId);
    return sendEventEmail(emailData.recipientEmail, emailData.recipientName, tpl.subject, tpl.body, emailData.role || 'user', 'payment_confirmation');
};

export default {
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendAccountVerificationEmail,
    sendBookingConfirmation,
    sendPaymentConfirmation,
};
// (optional helpers like sendEventReminder, cancellations etc. can be added as needed)