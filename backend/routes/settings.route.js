import express from 'express';
import { getSetting, getAllSettings } from '../controllers/settings.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Allow all authenticated users to read settings
router.get('/', protect, getAllSettings);
router.get('/:key', protect, getSetting);

export default router;
