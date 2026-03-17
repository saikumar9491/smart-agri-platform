import mongoose from 'mongoose';

const marketPriceSchema = new mongoose.Schema({
  cropName: { type: String, required: true },
  marketLocation: { type: String, required: true },
  pricePerKg: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  trend: { type: String, enum: ['up', 'down', 'stable'], default: 'stable' }
});

export default mongoose.model('MarketPrice', marketPriceSchema);
