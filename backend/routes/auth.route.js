import express from 'express';

// Import all controller functions
import {
  register,
  login,
  getMe,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword
} from '../controllers/auth.controller.js';

// Middleware
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

/* ================= AUTH ROUTES ================= */

// Register user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get logged-in user (protected route)
router.get('/me', protect, getMe);


/* ================= OTP ROUTES ================= */

// Send OTP (signup / reset)
router.post('/send-otp', sendOtp);

// Verify OTP
router.post('/verify-otp', verifyOtp);


/* ================= PASSWORD ROUTES ================= */

// Forgot password (send OTP)
router.post('/forgot-password', forgotPassword);

// Reset password
router.post('/reset-password', resetPassword);


/* ================= EXPORT ================= */

export default router; // 🔥 VERY IMPORTANT (fixes your error)