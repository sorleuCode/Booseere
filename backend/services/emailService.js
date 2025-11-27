import nodemailer from 'nodemailer';

/**
 * Create Email Transporter
 */
const createTransporter = async () => {
  //  Prefer SendGrid if configured
  if (process.env.SENDGRID_API_KEY) {
    const sgMail = (await import('@sendgrid/mail')).default;
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    return { type: 'sendgrid', transporter: sgMail };
  }

  //  Gmail SMTP (Clean + Correct)
  return {
    type: 'nodemailer',
    transporter: nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      connectionTimeout: 60000,
      socketTimeout: 60000
    })
  };
};

/**
 * Brand Colors
 */
const colors = {
  primary: '#4F9CF9',
  accent: '#F59E0B',
  background: '#F8FAFC',
  foreground: '#1E293B',
  muted: '#64748B'
};

/**
 * Welcome Email Template
 */
const getWelcomeEmailTemplate = (username, membershipNumber) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Welcome to BOOSEERE</title>
</head>
<body style="margin:0;padding:0;font-family:sans-serif;background:${colors.background};">
<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:30px;">
<table width="600" style="background:#fff;border-radius:10px;overflow:hidden;">
<tr>
<td style="background:linear-gradient(135deg,${colors.primary},#3B82F6);padding:30px;text-align:center;">
<img src="cid:logo" width="120" />
<h1 style="color:white;margin:15px 0;">Welcome to BOOSE</h1>
</td>
</tr>

<tr>
<td style="padding:30px;">
<h2>Hello, ${username} 👋</h2>
<p>Your membership has been created successfully.</p>

<div style="background:#f1f5f9;padding:20px;border-left:4px solid ${colors.primary};">
<p style="margin:0;font-size:13px;">Membership Number</p>
<h1 style="margin:6px 0;color:${colors.primary};">${membershipNumber}</h1>
</div>

<p style="margin-top:20px;">
<a href="${process.env.FRONTEND_URL || 'http://localhost:5173/members'}/" 
style="display:inline-block;background:${colors.primary};padding:14px 30px;
color:white;text-decoration:none;border-radius:6px;">
Check membership</a>
</p>
</td>
</tr>

<tr>
<td style="background:${colors.background};padding:15px;text-align:center;font-size:12px;">
© ${new Date().getFullYear()} BOOSE Cooperative
</td>
</tr>

</table>
</td>
</tr>
</table>
</body>
</html>
`;

/**
 * Send Welcome Email
 */
export const sendWelcomeEmail = async (email, username, membershipNumber) => {
  try {
    const { type, transporter } = await createTransporter();

    const mail = {
      from: `"BOOSE Cooperative" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 Welcome to BOOSE Cooperative!',
      html: getWelcomeEmailTemplate(username, membershipNumber),
      attachments: [
        {
          filename: 'logo.png',
          path: './public/BOOSE.png',
          cid: 'logo'
        }
      ]
    };

    if (type === 'sendgrid') {
      await transporter.send({
        to: email,
        from: process.env.EMAIL_USER,
        subject: mail.subject,
        html: mail.html
      });
    } else {
      await transporter.sendMail(mail);
    }

    return { success: true };

  } catch (error) {
    console.error('Welcome email error:', error.message);
    return { success: false, error: error.message };
  }
};


/**
 * Send Password Reset Email
 */
export const sendPasswordResetEmail = async (email, username, resetToken) => {
  try {
    const { type, transporter } = await createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const html = `
    <h2>Hello ${username}</h2>
    <p>Click below to reset your password:</p>
    <a href="${resetUrl}" style="padding:12px 24px;background:#4F9CF9;color:white;text-decoration:none;">
      Reset Password
    </a>
    `;

    const mail = {
      from: `"BOOSE Cooperative" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔒 Reset Your Password',
      html,
      attachments: [{ filename: 'logo.png', path: './public/BOOSE.png', cid: 'logo' }]
    };

    if (type === 'sendgrid') {
      await transporter.send({
        to: email,
        from: process.env.EMAIL_USER,
        subject: mail.subject,
        html: mail.html
      });
    } else {
      await transporter.sendMail(mail);
    }

    return { success: true };

  } catch (error) {
    console.error('Reset email error:', error.message);
    return { success: false, error: error.message };
  }
};


/**
 * Send Contact Form Email
 */
export const sendContactNotificationEmail = async (contact) => {
  try {
    const { transporter } = await createTransporter();

    const html = `
    <h2>New Contact Message</h2>
    <p><b>Name:</b> ${contact.name}</p>
    <p><b>Email:</b> ${contact.email}</p>
    <p><b>Subject:</b> ${contact.subject}</p>
    <p><b>Message:</b><br/>${contact.message}</p>
    `;

    await transporter.sendMail({
      from: `"BOOSEERE Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `📬 ${contact.subject}`,
      html,
      attachments: [{ filename: 'logo.png', path: './public/BOOSE.png', cid: 'logo' }]
    });

    return { success: true };

  } catch (error) {
    console.error('Contact email error:', error.message);
    return { success: false, error: error.message };
  }
};

export default {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendContactNotificationEmail
};
