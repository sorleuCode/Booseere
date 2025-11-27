import express from 'express';
import {
  getDashboardStats,
  getRecentActivities,
  getFinancialReport,
  createAdmin,
  exportData,
  updateAdminNotes,
  getAdminNotes,
  updateAdminNote,
  deleteAdminNote,
  getSettings,
  updateSettings,
  getSystemStats,
  getChartData,
} from '../controllers/adminController.js';
import {
  getContacts,
  getContact,
  updateContactStatus,
  deleteContact,
  getContactStats,
} from '../controllers/contactController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(admin);


router.get('/dashboard', getDashboardStats);
router.get('/activities', getRecentActivities);
router.get('/reports', getFinancialReport);
router.get('/financial-report', getFinancialReport);
router.get('/chart-data', getChartData);
router.get('/export/:type', exportData);
router.post('/create-admin', createAdmin);

// Admin Settings Management
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// System Statistics
router.get('/stats', getSystemStats);

// Contact Management
router.get('/contacts', getContacts);
router.get('/contacts/:id', getContact);
router.put('/contacts/:id', updateContactStatus);
router.delete('/contacts/:id', deleteContact);
router.get('/contacts/stats', getContactStats);

// Admin Notes Management
router.get('/notes', getAdminNotes);
router.post('/notes', updateAdminNotes);
router.put('/notes/:noteId', updateAdminNote);
router.delete('/notes/:noteId', deleteAdminNote);

// Test email endpoint (for debugging) - temporarily public
const testEmailRouter = express.Router();
testEmailRouter.post('/test-email', async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    const nodemailer = (await import('nodemailer')).default;

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    const mailOptions = {
      from: `"BOOSE Test" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject || 'Test Email from BOOSE',
      text: message || 'This is a test email from BOOSE Cooperative system.',
    };

    console.log('Testing email with config:', {
      host: 'smtp.gmail.com',
      port: 587,
      user: process.env.EMAIL_USER,
      passLength: process.env.EMAIL_PASSWORD?.length
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('Test email sent successfully:', info);
    res.json({ success: true, messageId: info.messageId, response: info.response });
  } catch (error) {
    console.error('Test email failed:', error);
    res.status(500).json({ success: false, error: error.message, code: error.code });
  }
});

// Export both routers
export { testEmailRouter };

export default router;
