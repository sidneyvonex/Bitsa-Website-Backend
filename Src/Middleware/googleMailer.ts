import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Validate email configuration
if (!process.env.EMAIL_SENDER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ Email configuration is missing! Please set EMAIL_SENDER and EMAIL_PASSWORD in your .env file');
    throw new Error('Missing email credentials. Check your .env file.');
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'true') === 'true',
    auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email transporter verification failed:', error.message);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

async function sendMail(to: string, subject: string, html: string) {
    try {
        const from = `${process.env.EMAIL_FROM_NAME || 'Bitsa'} <${process.env.EMAIL_SENDER}>`;
        const mailOptions = { from, to, subject, html };
        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully to ${to}`);
        return result;
    } catch (error: any) {
        console.error(`❌ Failed to send email to ${to}:`, error.message);
        throw error;
    }
}

export const sendEventEmail = async (
    recipientEmail: string,
    recipientName: string,
    subject: string,
    bodyHtml: string
) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto; padding:40px 20px;">
      ${bodyHtml}
      <div style="margin-top:40px; padding-top:20px; border-top:1px solid #e0e0e0;">
        <p style="color:#999; font-size:12px; line-height:1.5; margin:0;">
          &copy; ${new Date().getFullYear()} Bitsa. All rights reserved.
        </p>
      </div>
    </div>
  `;
    return sendMail(recipientEmail, subject, html);
};

export const sendPasswordResetEmail = async (
    recipientEmail: string, 
    recipientName: string, 
    resetUrl: string
) => {
    const subject = 'Reset your Bitsa password';
    const body = `
    <h2 style="color:#0f766e">Password Reset Request</h2>
    <p>Hi ${recipientName || ''},</p>
    <p>Use the link below to reset your password (expires in 1 hour):</p>
    <p><a href="${resetUrl}" style="background:#0f766e;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;display:inline-block;">Reset Password</a></p>
    <p style="color:#64748b;font-size:12px;margin-top:20px;">If you didn't request this, safely ignore this email.</p>
  `;
    return sendEventEmail(recipientEmail, recipientName, subject, body);
};

export const sendAccountVerification = async (
    recipientEmail: string, 
    recipientName: string, 
    verificationUrl: string
) => {
    const subject = 'Verify your Bitsa email';
    const body = `
    <h2 style="color:#0f766e">Verify Your Email</h2>
    <p>Hi ${recipientName || ''},</p>
    <p>Click below to verify your email and complete your registration:</p>
    <p><a href="${verificationUrl}" style="background:#0f766e;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;display:inline-block;">Verify Email</a></p>
    <p style="color:#64748b;font-size:12px;margin-top:20px;">This link expires in 24 hours.</p>
  `;
    return sendEventEmail(recipientEmail, recipientName, subject, body);
};

export default { sendEventEmail, sendPasswordResetEmail, sendAccountVerification };
