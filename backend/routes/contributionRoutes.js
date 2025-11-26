import express from 'express';
import {
  getContributions,
  getContribution,
  createContribution,
  updateContribution,
  deleteContribution,
  getMemberContributions,
} from '../controllers/contributionController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getContributions)
  .post(protect, admin, createContribution);

router.get('/member/:memberId', protect, getMemberContributions);

router.route('/:id')
  .get(protect, getContribution)
  .put(protect, admin, updateContribution)
  .delete(protect, admin, deleteContribution);

export default router;
