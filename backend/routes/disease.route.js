import express from 'express';
import multer from 'multer';
import path from 'path';
import { detectDisease } from '../controllers/disease.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

import { storage } from '../utils/cloudinary.js';

const upload = multer({ storage });

router.post('/detect', protect, upload.single('image'), detectDisease);

export default router;
