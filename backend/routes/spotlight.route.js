import express from 'express';
import { getActiveSpotlights } from '../controllers/spotlight.controller.js';

const router = express.Router();

router.get('/', getActiveSpotlights);

export default router;
