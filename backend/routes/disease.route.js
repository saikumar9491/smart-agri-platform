import express from 'express';
import multer from 'multer';
import path from 'path';
import { detectDisease } from '../controllers/disease.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post('/detect', protect, upload.single('image'), detectDisease);

export default router;
