import express from 'express';
import {
  getMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
  getMemberStats,
  getMemberStatsById,
  addLoanToMember,
  getPublicMembers,
} from '../controllers/memberController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public endpoint for member listing (accessible without authentication)
router.get('/public', getPublicMembers);

// All member routes are Admin only
router.get('/', protect, admin, getMembers);
router.post('/', protect, admin, createMember);
router.get('/stats', protect, admin, getMemberStats);

// Individual member routes (Admin only)
router.get('/:id', protect, admin, getMember);
router.put('/:id', protect, admin, updateMember);
router.delete('/:id', protect, admin, deleteMember);
router.get('/:id', getMemberStatsById);
router.post('/:id/loans', protect, admin, addLoanToMember);

export default router;