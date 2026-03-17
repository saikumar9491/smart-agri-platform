import express from 'express';
import { getMarketPrices } from '../controllers/market.controller.js';

const router = express.Router();

router.get('/prices', getMarketPrices);

export default router;
