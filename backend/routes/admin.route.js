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
  uploadKishanTVVideo,
  uploadDashboardBg, // New controller
  bulkUpdateUsers,
  getAuditLogs,
  exportUsersData,
  exportMarketData,
  getAllListings,
  deleteAdminListing,
  bulkDeleteListings,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAllSpotlights,
  createSpotlight,
  deleteSpotlight,
} from '../controllers/admin.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { admin } from '../middleware/admin.middleware.js';
import { bgStorage, videoStorage } from '../utils/cloudinary.js';
import multer from 'multer';

const upload = multer({ 
  storage: videoStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for videos
});

const imageUpload = multer({ 
  storage: bgStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for bg
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
router.post('/settings/background', imageUpload.single('image'), uploadDashboardBg);
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
router.put('/announcements/:id', updateAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

// Spotlight management
router.get('/spotlights', getAllSpotlights);
router.post('/spotlights', createSpotlight);
router.delete('/spotlights/:id', deleteSpotlight);

export default router;
