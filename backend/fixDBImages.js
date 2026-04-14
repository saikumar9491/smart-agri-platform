import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import Setting from './models/GlobalSetting.js';

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const badKeys = [
    'user_dashboard_bg',
    'user_dashboard_bg_mobile',
    'tile_crop_guide',
    'tile_disease_ml',
    'tile_irrigation',
    'tile_market_prices',
    'tile_marketplace'
  ];
  
  const result = await Setting.deleteMany({ key: { $in: badKeys } });
  console.log(`Deleted ${result.deletedCount} broken local image settings.`);
  process.exit(0);
}

fix();
