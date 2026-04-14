import express from 'express';
import {
  register,
  login,
  getMe,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  googleLogin,
  updateProfile,
  uploadProfilePhoto,
  getPublicProfile,
  toggleFollowUser,
  searchUsers,
  getFollowers,
  getFollowing,
  getMutualFollowers
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import multer from 'multer';
import { storage } from '../utils/cloudinary.js';

const upload = multer({ storage });

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/profile/photo', protect, upload.single('photo'), uploadProfilePhoto);
router.get('/profile/:id', protect, getPublicProfile);
router.post('/profile/:id/follow', protect, toggleFollowUser);
router.get('/profile/:id/followers', protect, getFollowers);
router.get('/profile/:id/following', protect, getFollowing);
router.get('/profile/:id/mutuals', protect, getMutualFollowers);
router.get('/search', protect, searchUsers);

// OTP routes
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// Password routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;