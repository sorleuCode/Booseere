import express from 'express';
import {
  getDashboardStats,
  getRecentActivities,
  getFinancialReport,
  createAdmin,
  exportData,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(admin);

router.get('/dashboard', getDashboardStats);
router.get('/activities', getRecentActivities);
router.get('/reports', getFinancialReport);
router.get('/financial-report', getFinancialReport);
router.get('/export/:type', exportData);
router.post('/create-admin', createAdmin);

export default router;
