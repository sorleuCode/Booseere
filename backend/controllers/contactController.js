import asyncHandler from 'express-async-handler';
import Contact from '../models/Contact.js';
import { sendContactNotificationEmail } from '../services/emailService.js';

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContactForm = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  // Create contact message
  const contact = await Contact.create({
    name,
    email,
    phone,
    subject,
    message,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
  });

  // Send notification email to admin asynchronously
  if (process.env.ENABLE_EMAILS !== 'false') {
    setImmediate(async () => {
      try {
        await sendContactNotificationEmail(contact);
      } catch (emailError) {
        console.error('Failed to send contact notification email (async):', emailError);
        // Email failure doesn't affect contact form submission
      }
    });
  } else {
    // Email sending disabled via ENABLE_EMAILS=false
  }

  res.status(201).json({
    success: true,
    message: 'Message sent successfully! We\'ll get back to you soon.',
    data: {
      id: contact._id,
      name: contact.name,
      email: contact.email,
      subject: contact.subject,
      createdAt: contact.createdAt,
    },
  });
});

// @desc    Get all contact messages (Admin only)
// @route   GET /api/admin/contacts
// @access  Private/Admin
const getContacts = asyncHandler(async (req, res) => {
  const { status, subject, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;
  if (subject) query.subject = subject;

  const skip = (page - 1) * limit;

  const contacts = await Contact.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Contact.countDocuments(query);

  res.json({
    success: true,
    data: contacts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get single contact message
// @route   GET /api/admin/contacts/:id
// @access  Private/Admin
const getContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    res.status(404);
    throw new Error('Contact message not found');
  }

  res.json({
    success: true,
    data: contact,
  });
});

// @desc    Update contact message status
// @route   PUT /api/admin/contacts/:id
// @access  Private/Admin
const updateContactStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    res.status(404);
    throw new Error('Contact message not found');
  }

  contact.status = status;
  await contact.save();

  res.json({
    success: true,
    message: 'Contact status updated successfully',
    data: contact,
  });
});

// @desc    Delete contact message
// @route   DELETE /api/admin/contacts/:id
// @access  Private/Admin
const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    res.status(404);
    throw new Error('Contact message not found');
  }

  await contact.deleteOne();

  res.json({
    success: true,
    message: 'Contact message deleted successfully',
  });
});

// @desc    Get contact statistics
// @route   GET /api/admin/contacts/stats
// @access  Private/Admin
const getContactStats = asyncHandler(async (req, res) => {
  const totalContacts = await Contact.countDocuments();
  const newContacts = await Contact.countDocuments({ status: 'new' });
  const readContacts = await Contact.countDocuments({ status: 'read' });
  const repliedContacts = await Contact.countDocuments({ status: 'replied' });

  // Get contacts by subject
  const contactsBySubject = await Contact.aggregate([
    { $group: { _id: '$subject', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Get recent contacts (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentContacts = await Contact.countDocuments({
    createdAt: { $gte: sevenDaysAgo }
  });

  res.json({
    success: true,
    data: {
      total: totalContacts,
      new: newContacts,
      read: readContacts,
      replied: repliedContacts,
      recent: recentContacts,
      bySubject: contactsBySubject,
    },
  });
});

export {
  submitContactForm,
  getContacts,
  getContact,
  updateContactStatus,
  deleteContact,
  getContactStats,
};