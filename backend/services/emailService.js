import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Platform color palette (matching frontend)
const colors = {
  primary: '#4F9CF9',      // hsl(217 91% 60%)
  accent: '#F59E0B',       // hsl(38 92% 50%)
  background: '#F8FAFC',   // hsl(220 14% 98%)
  foreground: '#1E293B',   // hsl(222 47% 11%)
  muted: '#64748B',        // hsl(215 16% 47%)
};

// Email template with embedded logo
const getWelcomeEmailTemplate = (username, membershipNumber) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to BOOSE Cooperative</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${colors.background};">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
              
              <!-- Header with Logo -->
              <tr>
                <td style="background: linear-gradient(135deg, ${colors.primary} 0%, #3B82F6 100%); padding: 40px 30px; text-align: center;">
                  <img src="cid:logo" alt="BOOSE Logo" style="width: 120px; height: auto; margin-bottom: 20px;" />
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Welcome to BOOSE!</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: ${colors.foreground}; margin: 0 0 20px; font-size: 24px; font-weight: 600;">Hello, ${username}! 👋</h2>
                  
                  <p style="color: ${colors.muted}; line-height: 1.6; margin: 0 0 20px; font-size: 16px;">
                    We're thrilled to have you join our cooperative community! Your account has been successfully created, and you're now part of something special.
                  </p>
                  
                  <!-- Membership Card -->
                  <div style="background: linear-gradient(135deg, ${colors.background} 0%, #E0F2FE 100%); border-left: 4px solid ${colors.primary}; padding: 20px; border-radius: 8px; margin: 30px 0;">
                    <p style="color: ${colors.muted}; margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Your Membership Number</p>
                    <p style="color: ${colors.primary}; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 2px;">${membershipNumber}</p>
                  </div>
                  
                  <p style="color: ${colors.muted}; line-height: 1.6; margin: 0 0 30px; font-size: 16px;">
                    As a member, you now have access to all cooperative features including record management, member directory, and collaborative tools.
                  </p>
                  
                  <!-- CTA Button -->
                  <table role="presentation" style="margin: 0 auto;">
                    <tr>
                      <td style="border-radius: 8px; background: linear-gradient(135deg, ${colors.primary} 0%, #3B82F6 100%); box-shadow: 0 4px 12px rgba(79, 156, 249, 0.3);">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                          Get Started →
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: ${colors.background}; padding: 30px; text-align: center; border-top: 1px solid #E2E8F0;">
                  <p style="color: ${colors.muted}; margin: 0 0 10px; font-size: 14px;">
                    Need help? Contact us at <a href="mailto:support@boose.coop" style="color: ${colors.primary}; text-decoration: none;">support@boose.coop</a>
                  </p>
                  <p style="color: ${colors.muted}; margin: 0; font-size: 12px;">
                    © ${new Date().getFullYear()} BOOSE Cooperative. All rights reserved.
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

// Send welcome email
export const sendWelcomeEmail = async (email, username, membershipNumber) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"BOOSE Cooperative" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 Welcome to BOOSE Cooperative!',
      html: getWelcomeEmailTemplate(username, membershipNumber),
      attachments: [
        {
          filename: 'logo.png',
          path: './public/BOOSE.png',
          cid: 'logo', // Content ID for embedding in HTML
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, username, resetToken) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: `"BOOSE Cooperative" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Password Reset Request',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${colors.background};">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, ${colors.primary} 0%, #3B82F6 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                      <img src="cid:logo" alt="BOOSE Logo" style="width: 100px; height: auto; margin-bottom: 15px;" />
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Password Reset</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: ${colors.foreground}; margin: 0 0 20px; font-size: 20px;">Hello, ${username}</h2>
                      <p style="color: ${colors.muted}; line-height: 1.6; margin: 0 0 20px; font-size: 16px;">
                        We received a request to reset your password. Click the button below to create a new password:
                      </p>
                      <table role="presentation" style="margin: 30px auto;">
                        <tr>
                          <td style="border-radius: 8px; background: linear-gradient(135deg, ${colors.primary} 0%, #3B82F6 100%); box-shadow: 0 4px 12px rgba(79, 156, 249, 0.3);">
                            <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="color: ${colors.muted}; line-height: 1.6; margin: 20px 0 0; font-size: 14px;">
                        If you didn't request this, please ignore this email. This link will expire in 1 hour.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: ${colors.background}; padding: 20px 30px; text-align: center; border-radius: 0 0 12px 12px;">
                      <p style="color: ${colors.muted}; margin: 0; font-size: 12px;">
                        © ${new Date().getFullYear()} BOOSE Cooperative. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: 'logo.png',
          path: './public/BOOSE.png',
          cid: 'logo',
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

export default { sendWelcomeEmail, sendPasswordResetEmail };
