export interface EmailTemplate {
    subject: string;
    body: string;
}

export const getWelcomeTemplate = (name: string): EmailTemplate => {
    return {
        subject: `Welcome to Bitsa, ${name}!`,
        body: `
    <div style="font-family: Arial, sans-serif; color:#333; max-width:600px; margin:0 auto; padding:20px;">
      <h2 style="color:#000; font-weight:normal;">Welcome to Bitsa, ${name}</h2>
      <p style="line-height:1.6;">Thank you for joining Bitsa. We're excited to have you as part of our tech community.</p>
      <p style="line-height:1.6;">You can now browse events, connect with other students, and showcase your projects.</p>
      <p style="line-height:1.6; margin-top:30px;">Best regards,<br/>The Bitsa Team</p>
    </div>
  `,
    };
};

export const getPasswordResetTemplate = (name: string, resetUrl: string): EmailTemplate => {
    return {
        subject: `Reset Your Bitsa Password`,
        body: `
    <div style="font-family: Arial, sans-serif; color:#333; max-width:600px; margin:0 auto; padding:20px;">
      <h2 style="color:#000; font-weight:normal;">Reset Your Password</h2>
      <p style="line-height:1.6;">Hi ${name},</p>
      <p style="line-height:1.6;">We received a request to reset your password. Click the link below to reset it:</p>
      <p style="margin:30px 0;">
        <a href="${resetUrl}" style="color:#0066cc; text-decoration:none;">Reset Password</a>
      </p>
      <p style="line-height:1.6; color:#666; font-size:14px;">This link expires in 1 hour.</p>
      <p style="line-height:1.6; color:#666; font-size:14px;">If you didn't request this, you can safely ignore this email.</p>
      <p style="line-height:1.6; margin-top:30px;">Best regards,<br/>The Bitsa Team</p>
    </div>
  `,
    };
};

export const getAccountVerificationTemplate = (name: string, verifyUrl: string): EmailTemplate => {
    return {
        subject: `Verify Your Bitsa Account`,
        body: `
    <div style="font-family: Arial, sans-serif; color:#333; max-width:600px; margin:0 auto; padding:20px;">
      <h2 style="color:#000; font-weight:normal;">Verify Your Email</h2>
      <p style="line-height:1.6;">Hi ${name},</p>
      <p style="line-height:1.6;">Please verify your email address to complete your registration:</p>
      <p style="margin:30px 0;">
        <a href="${verifyUrl}" style="color:#0066cc; text-decoration:none;">Verify Email Address</a>
      </p>
      <p style="line-height:1.6; color:#666; font-size:14px;">This link expires in 24 hours.</p>
      <p style="line-height:1.6; margin-top:30px;">Best regards,<br/>The Bitsa Team</p>
    </div>
  `,
    };
};

export const getBookingConfirmationTemplate = (
    name: string,
    eventTitle: string,
    venueName: string,
    date: string,
    time: string,
    quantity: number,
    total: number,
    bookingId: number
): EmailTemplate => {
    return {
        subject: `Booking Confirmed: ${eventTitle}`,
        body: `
    <div style="font-family: Arial, sans-serif; color:#333; max-width:600px; margin:0 auto; padding:20px;">
      <h2 style="color:#000; font-weight:normal;">Booking Confirmed</h2>
      <p style="line-height:1.6;">Hi ${name},</p>
      <p style="line-height:1.6;">Your booking for <strong>${eventTitle}</strong> has been confirmed.</p>
      <div style="margin:20px 0; padding:15px; background:#f9f9f9; border-radius:4px;">
        <p style="margin:5px 0;"><strong>Event:</strong> ${eventTitle}</p>
        <p style="margin:5px 0;"><strong>Venue:</strong> ${venueName}</p>
        <p style="margin:5px 0;"><strong>Date:</strong> ${date}</p>
        <p style="margin:5px 0;"><strong>Time:</strong> ${time}</p>
        <p style="margin:5px 0;"><strong>Tickets:</strong> ${quantity}</p>
        <p style="margin:5px 0;"><strong>Total:</strong> KSh ${total}</p>
        <p style="margin:5px 0;"><strong>Booking ID:</strong> #${bookingId}</p>
      </div>
      <p style="line-height:1.6;">Please present your booking ID at the venue entrance.</p>
      <p style="line-height:1.6; margin-top:30px;">Best regards,<br/>The Bitsa Team</p>
    </div>
  `,
    };
};

export const getPaymentConfirmationTemplate = (
    name: string, 
    eventTitle: string, 
    amount: number, 
    transactionId: string
): EmailTemplate => {
    return {
        subject: `Payment Confirmed: ${eventTitle}`,
        body: `
    <div style="font-family: Arial, sans-serif; color:#333; max-width:600px; margin:0 auto; padding:20px;">
      <h2 style="color:#000; font-weight:normal;">Payment Successful</h2>
      <p style="line-height:1.6;">Hi ${name},</p>
      <p style="line-height:1.6;">We received your payment for <strong>${eventTitle}</strong>.</p>
      <div style="margin:20px 0; padding:15px; background:#f9f9f9; border-radius:4px;">
        <p style="margin:5px 0;"><strong>Amount:</strong> KSh ${amount}</p>
        <p style="margin:5px 0;"><strong>Transaction ID:</strong> ${transactionId}</p>
        <p style="margin:5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      <p style="line-height:1.6;">Your tickets are now confirmed.</p>
      <p style="line-height:1.6; margin-top:30px;">Best regards,<br/>The Bitsa Team</p>
    </div>
  `,
    };
};

export const getPasswordResetSuccessEmail = (name: string): EmailTemplate => {
    return {
        subject: "Password Reset Successful",
        body: `
    <div style="font-family: Arial, sans-serif; color:#333; max-width:600px; margin:0 auto; padding:20px;">
      <h2 style="color:#000; font-weight:normal;">Password Reset Successful</h2>
      <p style="line-height:1.6;">Hi ${name},</p>
      <p style="line-height:1.6;">Your password has been successfully reset.</p>
      <p style="line-height:1.6;">You can now log in to your Bitsa account using your new password.</p>
      <p style="line-height:1.6; color:#d32f2f; margin-top:20px;">If you didn't make this change, please contact us immediately.</p>
      <p style="line-height:1.6; margin-top:30px;">Best regards,<br/>The Bitsa Team</p>
    </div>
  `,
    };
};

export const getEmailVerificationSuccessEmail = (name: string): EmailTemplate => {
    return {
        subject: "Email Verified Successfully",
        body: `
    <div style="font-family: Arial, sans-serif; color:#333; max-width:600px; margin:0 auto; padding:20px;">
      <h2 style="color:#000; font-weight:normal;">Email Verified</h2>
      <p style="line-height:1.6;">Hi ${name},</p>
      <p style="line-height:1.6;">Your email address has been successfully verified.</p>
      <p style="line-height:1.6;">You now have full access to all Bitsa features.</p>
      <p style="line-height:1.6; margin-top:30px;">Best regards,<br/>The Bitsa Team</p>
    </div>
  `,
    };
};