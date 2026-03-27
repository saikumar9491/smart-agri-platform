import express from 'express';
import { getSetting } from '../controllers/settings.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Allow all authenticated users to read settings
router.get('/:key', protect, getSetting);

export default router;
