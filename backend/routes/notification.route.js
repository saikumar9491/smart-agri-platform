import express from 'express';
import { 
  getUserNotifications, 
  markAsRead, 
  deleteNotification,
  clearAllNotifications
} from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getUserNotifications);
router.patch('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);
router.delete('/', protect, clearAllNotifications);

export default router;
