import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getMarketPrices, addMarketPrice, deleteMarketPrice } from '../controllers/market.controller.js';
import { admin } from '../middleware/admin.middleware.js';

const router = express.Router();

router.get('/prices', protect, getMarketPrices);
router.post('/prices', protect, admin, addMarketPrice);
router.delete('/prices/:id', protect, admin, deleteMarketPrice);

export default router;
