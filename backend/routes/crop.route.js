import express from 'express';
import { recommendCrop } from '../controllers/crop.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/recommend', protect, recommendCrop);

export default router;
