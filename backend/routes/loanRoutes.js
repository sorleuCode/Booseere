import express from 'express';
import {
  getLoans,
  getLoan,
  applyLoan,
  updateLoan,
  deleteLoan,
  approveLoan,
  rejectLoan,
  disburseLoan,
  addRepayment,
  getMemberLoans,
} from '../controllers/loanController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getLoans)
  .post(protect, applyLoan);

router.get('/member/:memberId', protect, getMemberLoans);

router.route('/:id')
  .get(protect, getLoan)
  .put(protect, admin, updateLoan)
  .delete(protect, admin, deleteLoan);

router.put('/:id/approve', protect, admin, approveLoan);
router.put('/:id/reject', protect, admin, rejectLoan);
router.put('/:id/disburse', protect, admin, disburseLoan);
router.post('/:id/repayment', protect, admin, addRepayment);

export default router;
