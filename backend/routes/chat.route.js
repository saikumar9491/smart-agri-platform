import express from 'express';
import { sendMessage, getConversation, getRecentChats } from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/send', protect, sendMessage);
router.get('/conversation/:userId', protect, getConversation);
router.get('/recent', protect, getRecentChats);

export default router;
