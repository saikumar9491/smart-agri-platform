import express from 'express';
import { sendMessage, getConversation, getRecentChats, unsendMessage, togglePinMessage } from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/send', protect, sendMessage);
router.get('/conversation/:userId', protect, getConversation);
router.get('/recent', protect, getRecentChats);
router.delete('/message/:id', protect, unsendMessage);
router.put('/message/:id/pin', protect, togglePinMessage);

export default router;
