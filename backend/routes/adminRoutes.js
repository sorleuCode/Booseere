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




export default router;
