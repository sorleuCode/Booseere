import express from 'express';
import {
  submitContactForm,
} from '../controllers/contactController.js';

const router = express.Router();

// Public route for contact form submission
router.post('/', submitContactForm);

export default router;