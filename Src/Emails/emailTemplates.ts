export interface EmailTemplate {
    subject: string;
    body: string;
}

const LOGO_URL = 'https://res.cloudinary.com/dbebjpzih/image/upload/v1763313841/WhatsApp_Image_2025-11-16_at_20.23.23_l4e9j8.jpg';
const FRONTEND_URL = process.env.FRONTEND_URL;

// Footer component for all emails
const getEmailFooter = () => `
  <div style="margin-top:48px; padding:32px 20px; background:#fafafa; border-radius:12px;">
    <div style="text-align:center; margin-bottom:24px;">
      <h3 style="font-size:16px; font-weight:600; color:#333; margin:0 0 20px 0;">Stay Connected</h3>
      <div style="margin:0 auto; max-width:500px;">
        <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
          <tr>
            <td style="padding:0 12px;">
              <a href="${FRONTEND_URL}/events" style="color:#667eea; text-decoration:none; font-size:14px; padding:10px 20px; background:#fff; border-radius:6px; display:inline-block; border:1px solid #e5e5e5; transition:all 0.3s;">Browse Events</a>
            </td>
            <td style="padding:0 12px;">
              <a href="${FRONTEND_URL}/community" style="color:#667eea; text-decoration:none; font-size:14px; padding:10px 20px; background:#fff; border-radius:6px; display:inline-block; border:1px solid #e5e5e5; transition:all 0.3s;">Join Community</a>
            </td>
            <td style="padding:0 12px;">
              <a href="${FRONTEND_URL}/projects" style="color:#667eea; text-decoration:none; font-size:14px; padding:10px 20px; background:#fff; border-radius:6px; display:inline-block; border:1px solid #e5e5e5; transition:all 0.3s;">View Projects</a>
            </td>
          </tr>
        </table>
      </div>
    </div>
    
    <div style="border-top:1px solid #e5e5e5; padding-top:24px; text-align:center;">
      <p style="font-size:14px; color:#666; margin:0 0 16px 0;">
        <strong style="color:#333;">BITSA</strong> - Bachelor of Information Technology Students Association
      </p>
      <p style="font-size:13px; color:#999; line-height:1.6; margin:0 0 20px 0;">
        University of Eastern Africa, Baraton<br/>
        Eldoret, Kenya
      </p>
      <div style="margin:20px 0;">
        <a href="mailto:info@bitsa.com" style="color:#667eea; text-decoration:none; font-size:13px; padding:0 16px;">Contact Us</a>
        <span style="color:#ddd; padding:0 8px;">|</span>
        <a href="${FRONTEND_URL}/privacy" style="color:#667eea; text-decoration:none; font-size:13px; padding:0 16px;">Privacy Policy</a>
        <span style="color:#ddd; padding:0 8px;">|</span>
        <a href="${FRONTEND_URL}/terms" style="color:#667eea; text-decoration:none; font-size:13px; padding:0 16px;">Terms</a>
      </div>
      <p style="font-size:12px; color:#999; margin:20px 0 0 0;">
        &copy; ${new Date().getFullYear()} BITSA. All rights reserved.
      </p>
    </div>
  </div>
`;

export const getWelcomeTemplate = (name: string): EmailTemplate => {
    return {
        subject: `Welcome to BITSA, ${name}`,
        body: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color:#1a1a1a; max-width:600px; margin:0 auto; padding:40px 20px; background:#ffffff;">
      <div style="text-align:center; margin-bottom:40px;">
        <img src="${LOGO_URL}" alt="BITSA Logo" style="width:140px; height:auto; max-width:100%; display:inline-block; border-radius:16px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); object-fit: contain;" />
      </div>
      
      <div style="text-align:center; margin-bottom:40px;">
        <h1 style="font-size:32px; font-weight:700; color:#000; margin:0 0 12px 0; letter-spacing:-0.5px;">Welcome to BITSA</h1>
        <div style="width:60px; height:4px; background:linear-gradient(90deg, #667eea 0%, #764ba2 100%); margin:0 auto; border-radius:2px;"></div>
        <p style="font-size:15px; color:#666; margin:16px 0 0 0;">Bachelor of Information Technology Students Association</p>
      </div>

      <div style="background:linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border-radius:12px; padding:24px; margin:32px 0;">
        <p style="font-size:18px; line-height:1.6; color:#333; margin:0 0 12px 0;">Hi <strong>${name}</strong>,</p>
        <p style="font-size:16px; line-height:1.7; color:#555; margin:0;">Thank you for joining our community of IT students, developers, and tech enthusiasts. Your journey to building amazing things starts here.</p>
      </div>
      
      <div style="margin:32px 0;">
        <h3 style="font-size:18px; font-weight:600; color:#333; margin:0 0 20px 0;">What's Available for You:</h3>
        <div style="display:grid; gap:16px;">
          <div style="padding:20px; background:#fff; border-left:4px solid #667eea; border-radius:8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h4 style="font-size:16px; font-weight:600; color:#667eea; margin:0 0 8px 0;">Tech Events & Workshops</h4>
            <p style="font-size:14px; color:#666; margin:0; line-height:1.6;">Attend workshops, hackathons, and networking sessions with industry professionals</p>
          </div>
          
          <div style="padding:20px; background:#fff; border-left:4px solid #667eea; border-radius:8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h4 style="font-size:16px; font-weight:600; color:#667eea; margin:0 0 8px 0;">Student Community</h4>
            <p style="font-size:14px; color:#666; margin:0; line-height:1.6;">Connect with peers, mentors, and collaborate on exciting projects</p>
          </div>
          
          <div style="padding:20px; background:#fff; border-left:4px solid #667eea; border-radius:8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h4 style="font-size:16px; font-weight:600; color:#667eea; margin:0 0 8px 0;">Project Showcase</h4>
            <p style="font-size:14px; color:#666; margin:0; line-height:1.6;">Share your projects and get valuable feedback from the community</p>
          </div>
        </div>
      </div>

      <div style="text-align:center; margin:40px 0;">
        <a href="${FRONTEND_URL}/dashboard" style="display:inline-block; padding:16px 40px; background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:#fff; text-decoration:none; border-radius:10px; font-weight:600; font-size:16px; letter-spacing:0.3px; box-shadow:0 4px 15px rgba(102, 126, 234, 0.3);">Explore Your Dashboard</a>
      </div>

      <div style="background:#f8f9ff; border-left:4px solid #667eea; border-radius:8px; padding:20px; margin:32px 0;">
        <p style="font-size:14px; color:#555; margin:0 0 12px 0;"><strong style="color:#667eea;">Quick Start Guide:</strong></p>
        <p style="font-size:14px; color:#666; margin:0; line-height:1.6;">
          1. Complete your profile<br/>
          2. Browse upcoming events and register<br/>
          3. Join community groups<br/>
          4. Start networking with fellow students
        </p>
      </div>

      ${getEmailFooter()}
    </div>
  `,
    };
};

export const getPasswordResetTemplate = (name: string, resetUrl: string): EmailTemplate => {
    return {
        subject: `Password Reset Request - BITSA`,
        body: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color:#1a1a1a; max-width:600px; margin:0 auto; padding:40px 20px; background:#ffffff;">
      <div style="text-align:center; margin-bottom:40px;">
        <img src="${LOGO_URL}" alt="BITSA Logo" style="width:120px; height:auto; max-width:100%; display:inline-block; border-radius:16px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); object-fit: contain;" />
      </div>
      
      <div style="text-align:center; margin-bottom:40px;">
        <h1 style="font-size:28px; font-weight:700; color:#000; margin:0 0 12px 0; letter-spacing:-0.5px;">Password Reset Request</h1>
        <div style="width:60px; height:4px; background:#667eea; margin:0 auto; border-radius:2px;"></div>
      </div>

      <div style="background:#f8f9ff; border-radius:12px; padding:24px; margin:32px 0;">
        <p style="font-size:16px; line-height:1.6; color:#333; margin:0 0 12px 0;">Hi <strong>${name}</strong>,</p>
        <p style="font-size:15px; line-height:1.7; color:#555; margin:0;">We received a request to reset your password. Click the button below to create a new secure password.</p>
      </div>
      
      <div style="text-align:center; margin:40px 0;">
        <a href="${resetUrl}" style="display:inline-block; padding:16px 40px; background:#000; color:#fff; text-decoration:none; border-radius:10px; font-weight:600; font-size:16px; letter-spacing:0.3px; box-shadow:0 4px 15px rgba(0,0,0,0.2);">Reset My Password</a>
        <p style="font-size:13px; color:#999; margin:16px 0 0 0;">Button not working? Copy and paste this link:<br/><span style="color:#667eea; word-break:break-all;">${resetUrl}</span></p>
      </div>

      <div style="background:#fff3cd; border-left:4px solid #ffc107; border-radius:8px; padding:20px; margin:32px 0;">
        <p style="font-size:14px; color:#856404; margin:0 0 8px 0;"><strong>Time Sensitive:</strong></p>
        <p style="font-size:13px; color:#856404; margin:0; line-height:1.6;">
          This reset link expires in <strong>1 hour</strong> for security reasons. If you didn't request this password reset, you can safely ignore this email.
        </p>
      </div>

      <div style="background:#f0f0f0; border-radius:8px; padding:20px; margin:32px 0; text-align:center;">
        <p style="font-size:14px; color:#666; margin:0 0 12px 0;"><strong>Need help?</strong></p>
        <a href="mailto:support@bitsa.com" style="color:#667eea; text-decoration:none; font-size:14px;">Contact Support</a>
        <span style="color:#ddd; margin:0 12px;">|</span>
        <a href="${FRONTEND_URL}/help" style="color:#667eea; text-decoration:none; font-size:14px;">Visit Help Center</a>
      </div>

      ${getEmailFooter()}
    </div>
  `,
    };
};

export const getAccountVerificationTemplate = (name: string, verifyUrl: string): EmailTemplate => {
    return {
        subject: `Verify Your BITSA Account`,
        body: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color:#1a1a1a; max-width:600px; margin:0 auto; padding:40px 20px; background:#ffffff;">
      <div style="text-align:center; margin-bottom:40px;">
        <img src="${LOGO_URL}" alt="BITSA Logo" style="width:120px; height:auto; max-width:100%; display:inline-block; border-radius:16px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); object-fit: contain;" />
      </div>
      
      <div style="text-align:center; margin-bottom:40px;">
        <h1 style="font-size:28px; font-weight:700; color:#000; margin:0 0 12px 0; letter-spacing:-0.5px;">Verify Your Email</h1>
        <div style="width:60px; height:4px; background:#667eea; margin:0 auto; border-radius:2px;"></div>
      </div>

      <div style="background:linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border-radius:12px; padding:24px; margin:32px 0; text-align:center;">
        <div style="width:60px; height:60px; background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius:50%; display:inline-flex; align-items:center; justify-content:center; margin-bottom:16px; font-size:28px; color:#fff; font-weight:700;">✓</div>
        <p style="font-size:16px; line-height:1.6; color:#333; margin:0 0 12px 0;">Hi <strong>${name}</strong>,</p>
        <p style="font-size:15px; line-height:1.7; color:#555; margin:0;">You're almost there! Just one click away from unlocking full access to the BITSA community.</p>
      </div>
      
      <div style="text-align:center; margin:40px 0;">
        <a href="${verifyUrl}" style="display:inline-block; padding:16px 40px; background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:#fff; text-decoration:none; border-radius:10px; font-weight:600; font-size:16px; letter-spacing:0.3px; box-shadow:0 4px 15px rgba(102, 126, 234, 0.3);">Verify My Email</a>
        <p style="font-size:13px; color:#999; margin:16px 0 0 0;">Or copy and paste this link:<br/><span style="color:#667eea; word-break:break-all; font-size:12px;">${verifyUrl}</span></p>
      </div>

      <div style="background:#e3f2fd; border-left:4px solid #2196f3; border-radius:8px; padding:20px; margin:32px 0;">
        <p style="font-size:13px; color:#0d47a1; margin:0;"><strong>Quick reminder:</strong> This verification link expires in 24 hours.</p>
      </div>

      <div style="text-align:center; margin:32px 0;">
        <p style="font-size:14px; color:#666; margin:0 0 16px 0; font-weight:600;">Once verified, you'll be able to:</p>
        <div style="display:inline-block; text-align:left;">
          <p style="font-size:14px; color:#555; margin:6px 0; line-height:1.6;">• Register for exclusive events</p>
          <p style="font-size:14px; color:#555; margin:6px 0; line-height:1.6;">• Participate in hackathons</p>
          <p style="font-size:14px; color:#555; margin:6px 0; line-height:1.6;">• Connect with mentors</p>
          <p style="font-size:14px; color:#555; margin:6px 0; line-height:1.6;">• Showcase your projects</p>
        </div>
      </div>

      ${getEmailFooter()}
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
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color:#1a1a1a; max-width:600px; margin:0 auto; padding:40px 20px; background:#ffffff;">
      <div style="text-align:center; margin-bottom:40px;">
        <img src="${LOGO_URL}" alt="BITSA Logo" style="width:120px; height:auto; max-width:100%; display:inline-block; border-radius:16px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); object-fit: contain;" />
      </div>
      
      <div style="text-align:center; margin-bottom:40px;">
        <div style="display:inline-block; padding:12px 24px; background:#e8f5e9; border-radius:24px; margin-bottom:16px;">
          <span style="font-size:14px; color:#2e7d32; font-weight:600;">CONFIRMED</span>
        </div>
        <h1 style="font-size:28px; font-weight:700; color:#000; margin:0 0 12px 0; letter-spacing:-0.5px;">Booking Confirmed</h1>
        <div style="width:60px; height:4px; background:#11998e; margin:0 auto; border-radius:2px;"></div>
      </div>

      <div style="background:linear-gradient(135deg, #11998e15 0%, #38ef7d15 100%); border-radius:12px; padding:24px; margin:32px 0;">
        <p style="font-size:16px; line-height:1.6; color:#333; margin:0;">Hi <strong>${name}</strong>, your booking for <strong>${eventTitle}</strong> has been confirmed. We look forward to seeing you at the event.</p>
      </div>
      
      <div style="border:2px solid #f0f0f0; border-radius:12px; padding:24px; margin:32px 0; background:#fafafa;">
        <h3 style="font-size:16px; font-weight:600; color:#333; margin:0 0 20px 0; text-align:center;">Event Details</h3>
        <div style="background:#fff; border-radius:8px; padding:20px;">
          <div style="margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid #f5f5f5;">
            <p style="font-size:13px; color:#999; margin:0 0 4px 0;">Event</p>
            <p style="font-size:16px; color:#333; font-weight:600; margin:0;">${eventTitle}</p>
          </div>
          <div style="margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid #f5f5f5;">
            <p style="font-size:13px; color:#999; margin:0 0 4px 0;">Venue</p>
            <p style="font-size:15px; color:#333; margin:0;">${venueName}</p>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid #f5f5f5;">
            <div>
              <p style="font-size:13px; color:#999; margin:0 0 4px 0;">Date</p>
              <p style="font-size:14px; color:#333; margin:0; font-weight:500;">${date}</p>
            </div>
            <div>
              <p style="font-size:13px; color:#999; margin:0 0 4px 0;">Time</p>
              <p style="font-size:14px; color:#333; margin:0; font-weight:500;">${time}</p>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
            <div>
              <p style="font-size:13px; color:#999; margin:0 0 4px 0;">Tickets</p>
              <p style="font-size:14px; color:#333; margin:0; font-weight:500;">${quantity}</p>
            </div>
            <div>
              <p style="font-size:13px; color:#999; margin:0 0 4px 0;">Total</p>
              <p style="font-size:18px; color:#11998e; margin:0; font-weight:700;">KSh ${total}</p>
            </div>
          </div>
        </div>
        
        <div style="background:linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color:#fff; text-align:center; padding:20px; border-radius:10px; margin-top:20px; box-shadow:0 4px 15px rgba(17, 153, 142, 0.2);">
          <p style="margin:0 0 8px 0; font-size:13px; color:#e0f2f1; text-transform:uppercase; letter-spacing:1.5px; font-weight:500;">Your Booking ID</p>
          <p style="margin:0; font-size:32px; font-weight:700; letter-spacing:2px;">#${bookingId}</p>
        </div>
      </div>

      <div style="background:#fff3cd; border-left:4px solid #ffc107; border-radius:8px; padding:20px; margin:32px 0;">
        <p style="font-size:14px; color:#856404; margin:0 0 8px 0;"><strong>Important:</strong></p>
        <p style="font-size:13px; color:#856404; margin:0; line-height:1.6;">
          Please save this booking ID and present it at the venue entrance for check-in.
        </p>
      </div>

      <div style="text-align:center; margin:32px 0;">
        <a href="${FRONTEND_URL}/bookings/${bookingId}" style="display:inline-block; padding:14px 32px; background:#000; color:#fff; text-decoration:none; border-radius:8px; font-weight:600; font-size:15px; margin:0 6px 12px 6px;">View Booking</a>
        <a href="${FRONTEND_URL}/events" style="display:inline-block; padding:14px 32px; background:#fff; color:#000; text-decoration:none; border-radius:8px; font-weight:600; font-size:15px; border:2px solid #000; margin:0 6px 12px 6px;">More Events</a>
      </div>

      ${getEmailFooter()}
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
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color:#1a1a1a; max-width:600px; margin:0 auto; padding:40px 20px; background:#ffffff;">
      <div style="text-align:center; margin-bottom:40px;">
        <img src="${LOGO_URL}" alt="Bitsa Logo" style="width:120px; height:auto; max-width:100%; display:inline-block; border-radius:16px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); object-fit: contain;" />
      </div>
      
      <div style="text-align:center; margin-bottom:40px;">
        <h1 style="font-size:28px; font-weight:700; color:#000; margin:0 0 12px 0; letter-spacing:-0.5px;">Payment Successful</h1>
        <div style="width:60px; height:4px; background:#11998e; margin:0 auto; border-radius:2px;"></div>
      </div>

      <p style="font-size:16px; line-height:1.6; color:#333; margin:0 0 32px 0;">Hi <strong>${name}</strong>, we've received your payment for <strong>${eventTitle}</strong>.</p>
      
      <div style="border:2px solid #f0f0f0; border-radius:12px; padding:24px; margin:32px 0;">
        <div style="text-align:center; margin-bottom:24px;">
          <p style="font-size:14px; color:#999; margin:0 0 8px 0; text-transform:uppercase; letter-spacing:1px;">Amount Paid</p>
          <p style="font-size:36px; font-weight:700; color:#11998e; margin:0;">KSh ${amount}</p>
        </div>
        
        <div style="border-top:1px solid #f5f5f5; padding-top:16px;">
          <p style="font-size:13px; color:#999; margin:0 0 4px 0;">Transaction ID</p>
          <p style="font-size:14px; color:#333; font-family:monospace; margin:0;">${transactionId}</p>
        </div>
        
        <div style="border-top:1px solid #f5f5f5; padding-top:16px; margin-top:16px;">
          <p style="font-size:13px; color:#999; margin:0 0 4px 0;">Date</p>
          <p style="font-size:14px; color:#333; margin:0;">${new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div style="background:#f0fdf4; border-left:3px solid #22c55e; border-radius:8px; padding:16px; margin:32px 0;">
        <p style="font-size:13px; color:#166534; margin:0;">
          ✓ <strong>Your tickets are confirmed!</strong> Check your inbox for booking details.
        </p>
      </div>

      <div style="margin-top:48px; padding-top:24px; border-top:1px solid #e5e5e5; text-align:center;">
        <p style="font-size:13px; color:#999; margin:0;">The Bitsa Team</p>
      </div>
    </div>
  `,
    };
};

export const getPasswordResetSuccessEmail = (name: string): EmailTemplate => {
    return {
        subject: "Password Reset Successful",
        body: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color:#1a1a1a; max-width:600px; margin:0 auto; padding:40px 20px; background:#ffffff;">
      <div style="text-align:center; margin-bottom:40px;">
        <img src="${LOGO_URL}" alt="Bitsa Logo" style="width:120px; height:auto; max-width:100%; display:inline-block; border-radius:16px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); object-fit: contain;" />
      </div>
      
      <div style="text-align:center; margin-bottom:40px;">
        <h1 style="font-size:28px; font-weight:700; color:#000; margin:0 0 12px 0; letter-spacing:-0.5px;">Password Updated</h1>
        <div style="width:60px; height:4px; background:#667eea; margin:0 auto; border-radius:2px;"></div>
      </div>

      <p style="font-size:16px; line-height:1.6; color:#333; margin:0 0 16px 0;">Hi <strong>${name}</strong>,</p>
      
      <div style="background:#f0fdf4; border-left:3px solid #22c55e; border-radius:8px; padding:16px; margin:32px 0;">
        <p style="font-size:14px; color:#166534; margin:0;">
          ✓ Your password has been successfully reset. You can now log in with your new password.
        </p>
      </div>

      <div style="background:#fef2f2; border-left:3px solid #ef4444; border-radius:8px; padding:16px; margin:32px 0;">
        <p style="font-size:13px; color:#991b1b; margin:0;">
          <strong>⚠️ Security Alert:</strong> If you didn't make this change, please contact us immediately.
        </p>
      </div>

      <div style="margin-top:48px; padding-top:24px; border-top:1px solid #e5e5e5; text-align:center;">
        <p style="font-size:13px; color:#999; margin:0;">The Bitsa Team</p>
      </div>
    </div>
  `,
    };
};

export const getEmailVerificationSuccessEmail = (name: string): EmailTemplate => {
    return {
        subject: "Email Verified Successfully",
        body: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color:#1a1a1a; max-width:600px; margin:0 auto; padding:40px 20px; background:#ffffff;">
      <div style="text-align:center; margin-bottom:40px;">
        <img src="${LOGO_URL}" alt="Bitsa Logo" style="width:120px; height:auto; max-width:100%; display:inline-block; border-radius:16px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); object-fit: contain;" />
      </div>
      
      <div style="text-align:center; margin-bottom:40px;">
        <h1 style="font-size:28px; font-weight:700; color:#000; margin:0 0 12px 0; letter-spacing:-0.5px;">Email Verified!</h1>
        <div style="width:60px; height:4px; background:#667eea; margin:0 auto; border-radius:2px;"></div>
      </div>

      <p style="font-size:16px; line-height:1.6; color:#333; margin:0 0 16px 0;">Hi <strong>${name}</strong>,</p>
      
      <div style="background:#f0fdf4; border-left:3px solid #22c55e; border-radius:8px; padding:16px; margin:32px 0;">
        <p style="font-size:14px; color:#166534; margin:0;">
          ✓ Your email has been verified! You now have full access to all Bitsa features.
        </p>
      </div>

      <p style="font-size:15px; line-height:1.7; color:#555; margin:0 0 24px 0;">Here's what you can do now:</p>

      <div style="border-left:3px solid #667eea; padding-left:20px; margin:32px 0;">
        <p style="font-size:14px; line-height:1.9; color:#555; margin:0;">
          <span style="display:block; margin-bottom:8px;">→ Browse and register for events</span>
          <span style="display:block; margin-bottom:8px;">→ Network with the community</span>
          <span style="display:block;">→ Share your innovative projects</span>
        </p>
      </div>

      <div style="text-align:center; margin:40px 0;">
        <a href="${process.env.FRONTEND_URL || 'https://bitsa.com'}" style="display:inline-block; padding:14px 32px; background:#000; color:#fff; text-decoration:none; border-radius:8px; font-weight:600; font-size:15px; letter-spacing:0.3px;">Get Started</a>
      </div>

      <div style="margin-top:48px; padding-top:24px; border-top:1px solid #e5e5e5; text-align:center;">
        <p style="font-size:13px; color:#999; margin:0;">The Bitsa Team</p>
      </div>
    </div>
  `,
    };
};