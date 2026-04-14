import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import MarketPrice from './models/MarketPrice.js';

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-agri');
  
  await MarketPrice.create([
    {
      crop: 'Wheat',
      variety: 'Sharbati',
      price: '₹2,350/Q',
      change: '+1.5%',
      trend: 'up',
      location: 'Phagwara APMC',
      state: 'Punjab'
    },
    {
      crop: 'Basmati Rice',
      variety: '1121 Pusa',
      price: '₹9,800/Q',
      change: '-0.5%',
      trend: 'down',
      location: 'Kapurthala Mandi',
      state: 'Punjab'
    },
    {
      crop: 'Sugarcane',
      variety: 'Co-0238',
      price: '₹380/Q',
      change: '0%',
      trend: 'stable',
      location: 'Phagwara Tahsil Sugar Mill',
      state: 'Punjab'
    }
  ]);
  
  console.log("Seeded Punjab prices");
  process.exit(0);
}

seed();
