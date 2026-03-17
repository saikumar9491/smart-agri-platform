import express from 'express';
import { recommendCrop } from '../controllers/crop.controller.js';

const router = express.Router();

router.post('/recommend', recommendCrop);

export default router;
