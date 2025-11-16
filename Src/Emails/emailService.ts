import { sendEventEmail, sendPasswordResetEmail as sendPasswordResetRaw, sendAccountVerification as sendAccountVerificationRaw } from '../Middleware/googleMailer';
import * as Templates from './emailTemplates';

export interface EmailData {
    recipientEmail: string;
    recipientName: string;
}

export const sendWelcomeEmail = async (emailData: EmailData) => {
    const tpl = Templates.getWelcomeTemplate(emailData.recipientName);
    return sendEventEmail(emailData.recipientEmail, emailData.recipientName, tpl.subject, tpl.body);
};

export const sendPasswordResetEmail = async (emailData: EmailData, resetUrl: string) => {
    return sendPasswordResetRaw(emailData.recipientEmail, emailData.recipientName, resetUrl);
};

export const sendAccountVerificationEmail = async (emailData: EmailData, verifyUrl: string) => {
    return sendAccountVerificationRaw(emailData.recipientEmail, emailData.recipientName, verifyUrl);
};

export const sendBookingConfirmation = async (
    emailData: EmailData, 
    details: { 
        eventTitle: string; 
        venueName: string; 
        date: string; 
        time: string; 
        quantity: number; 
        total: number; 
        bookingId: number 
    }
) => {
    const tpl = Templates.getBookingConfirmationTemplate(
        emailData.recipientName, 
        details.eventTitle, 
        details.venueName, 
        details.date, 
        details.time, 
        details.quantity, 
        details.total, 
        details.bookingId
    );
    return sendEventEmail(emailData.recipientEmail, emailData.recipientName, tpl.subject, tpl.body);
};

export const sendPaymentConfirmation = async (
    emailData: EmailData, 
    eventTitle: string, 
    amount: number, 
    transactionId: string
) => {
    const tpl = Templates.getPaymentConfirmationTemplate(emailData.recipientName, eventTitle, amount, transactionId);
    return sendEventEmail(emailData.recipientEmail, emailData.recipientName, tpl.subject, tpl.body);
};

export default {
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendAccountVerificationEmail,
    sendBookingConfirmation,
    sendPaymentConfirmation,
};