import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'true') === 'true',
    auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export type EmailType = 'booking_confirmation' | 'event_notification' | 'payment_confirmation' | 'account_verification' | 'password_reset';

async function sendMail(to: string, subject: string, html: string) {
    const from = `${process.env.EMAIL_FROM_NAME || 'Bitsa'} <${process.env.EMAIL_SENDER}>`;
    const mailOptions = { from, to, subject, html };
    const result = await transporter.sendMail(mailOptions);
    return result;
}

export const sendEventEmail = async (
    recipientEmail: string,
    recipientName: string,
    subject: string,
    bodyHtml: string,
    role: 'user' | 'admin' = 'user',
    _emailType?: EmailType
) => {
    // Wrap template body with simple container and footer
    const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; padding:20px; background:#f8fafc;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;padding:24px;border-top:4px solid #0f766e;">
        ${bodyHtml}
        <hr style="margin-top:20px;border:none;border-top:1px solid #e6edf0"/>
        <p style="color:#64748b;font-size:12px">&copy; ${new Date().getFullYear()} Bitsa</p>
      </div>
    </div>
  `;

    return sendMail(recipientEmail, subject, html);
};

export const sendPasswordResetEmail = async (recipientEmail: string, recipientName: string, _resetToken: string, resetUrl: string) => {
    const subject = 'Reset your Bitsa password';
    const body = `
    <h2 style="color:#0f766e">Password reset</h2>
    <p>Hi ${recipientName || ''},</p>
    <p>Use the link below to reset your password (expires in 1 hour):</p>
    <p><a href="${resetUrl}" style="background:#0f766e;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;">Reset password</a></p>
  `;
    return sendEventEmail(recipientEmail, recipientName, subject, body, 'user', 'password_reset');
};

export const sendAccountVerification = async (recipientEmail: string, recipientName: string, verificationUrl: string) => {
    const subject = 'Verify your Bitsa email';
    const body = `
    <h2 style="color:#0f766e">Verify your email</h2>
    <p>Hi ${recipientName || ''},</p>
    <p>Click below to verify your email:</p>
    <p><a href="${verificationUrl}" style="background:#0f766e;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;">Verify email</a></p>
  `;
    return sendEventEmail(recipientEmail, recipientName, subject, body, 'user', 'account_verification');
};

export default { sendEventEmail, sendPasswordResetEmail, sendAccountVerification };
