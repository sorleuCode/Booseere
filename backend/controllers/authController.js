import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import crypto from 'crypto';
import generateToken from '../utils/generateToken.js';
import { sendPasswordResetEmail } from '../services/emailService.js';
import { createError, errors as errorTypes } from '../utils/errorResponse.js';

// @desc    Register admin (only if no admin exists)
// @route   POST /api/auth/register-admin
// @access  Public (but only works once)
const registerAdmin = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  // Check if admin already exists
  const existingAdmin = await User.findOne({ role: 'admin' });
  if (existingAdmin) {
    throw errorTypes.conflict('Admin already exists. Please login.');
  }

  const { email, password, fullName } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw errorTypes.conflict('Admin with this email already exists');
  }

  // Create admin user
  const user = await User.create({
    email,
    password,
    role: 'admin',
  });

  if (user) {
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } else {
    res.status(400);
    throw new Error('Invalid admin data');
  }
});

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { email, password } = req.body;

  // Check for admin user
  const user = await User.findOne({ email, role: 'admin' }).select('+password');

  if (user && (await user.matchPassword(password))) {
    if (!user.isActive) {
      throw errorTypes.unauthorized('Account is inactive. Contact system administrator.');
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } else {
    throw errorTypes.unauthorized('Invalid email or password');
  }
});

// @desc    Get current admin
// @route   GET /api/auth/me
// @access  Private/Admin
const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      _id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      isActive: req.user.isActive,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt,
    },
  });
});

// @desc    Update admin profile
// @route   PUT /api/auth/profile
// @access  Private/Admin
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // Update allowed fields
    if (req.body.username !== undefined) user.username = req.body.username;
    if (req.body.email !== undefined) user.email = req.body.email;
    if (req.body.fullName !== undefined) user.fullName = req.body.fullName;
    if (req.body.phone !== undefined) user.phone = req.body.phone;

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
      },
    });
  } else {
    throw errorTypes.notFound('Admin not found');
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private/Admin
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (user && (await user.matchPassword(currentPassword))) {
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } else {
    throw errorTypes.unauthorized('Current password is incorrect');
  }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email, role: 'admin' });
  if (!user) {
    throw errorTypes.notFound('No admin found with this email');
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  try {
    await sendPasswordResetEmail(user.email, resetToken);
    res.json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    throw errorTypes.serverError('Email could not be sent');
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:resetToken
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  // Hash token and compare
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
    role: 'admin',
  }).select('+password');

  if (!user) {
    throw errorTypes.badRequest('Invalid or expired reset token');
  }

  // Set new password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Password reset successful',
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private/Admin
const logout = asyncHandler(async (req, res) => {
  // Clear the token from client side (handled by frontend)
  // In a JWT system, logout is typically handled client-side by removing the token
  // But we can provide an endpoint for consistency and potential future enhancements

  res.json({
    success: true,
    message: 'Logout successful',
  });
});

export {
  registerAdmin,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
};