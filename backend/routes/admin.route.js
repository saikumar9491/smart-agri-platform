import express from 'express';
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  toggleUserStatus,
  createNotification,
  deleteNotification,
  getAllNotifications,
  getStats,
  addCrop,
  createAdminPost,
  getAllPosts,
  deletePost,
  deleteComment,
  addMarketPrice,
  getAllMarketPrices,
  deleteMarketPrice,
  getInsights,
  getGlobalSettings,
  updateGlobalSetting,
  uploadKishanTVVideo, // New controller
  bulkUpdateUsers,
  getAuditLogs,
  exportUsersData,
  exportMarketData,
  getAllListings,
  deleteAdminListing,
  bulkDeleteListings,
  getAllAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  getAllSpotlights,
  createSpotlight,
  deleteSpotlight,
} from '../controllers/admin.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { admin } from '../middleware/admin.middleware.js';
import multer from 'multer';
import path from 'path';

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `livetv_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  }
});

const router = express.Router();

// Apply protection to all admin routes
router.use(protect);
router.use(admin);

// Admin dashboard stats & insights
router.get('/stats', getStats);
router.get('/insights', getInsights);

// Global Settings & Logs
router.get('/settings', getGlobalSettings);
router.post('/settings', updateGlobalSetting);
router.post('/settings/video', upload.single('video'), uploadKishanTVVideo);
router.get('/logs', getAuditLogs);

// Export Data
router.get('/export/users', exportUsersData);
router.get('/export/market', exportMarketData);

// User management
router.get('/users', getAllUsers);
router.put('/users/bulk', bulkUpdateUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

// Notification management
router.get('/notifications', getAllNotifications);
router.post('/notifications', createNotification);
router.delete('/notifications/:id', deleteNotification);

// Crop management
router.post('/crops', addCrop);

// Community management
router.get('/posts', getAllPosts);
router.delete('/posts/:id', deletePost);
router.delete('/posts/:postId/comments/:commentId', deleteComment);
router.post('/posts', createAdminPost);

// Market price management
router.get('/market', getAllMarketPrices);
router.post('/market', addMarketPrice);
router.delete('/market/:id', deleteMarketPrice);

// Listing management
router.get('/listings', getAllListings);
router.delete('/listings/bulk', bulkDeleteListings);
router.delete('/listings/:id', deleteAdminListing);

router.get('/announcements', getAllAnnouncements);
router.post('/announcements', createAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

// Spotlight management
router.get('/spotlights', getAllSpotlights);
router.post('/spotlights', createSpotlight);
router.delete('/spotlights/:id', deleteSpotlight);

export default router;
