import express from 'express';
import { getIrrigationAdvice } from '../controllers/irrigation.controller.js';

const router = express.Router();

router.get('/advice', getIrrigationAdvice);

export default router;
