import mongoose from 'mongoose';

const marketPriceSchema = new mongoose.Schema({
  crop: { type: String, required: true },
  variety: { type: String, required: true },
  price: { type: String, required: true }, // Format: "₹1,500"
  change: { type: String, default: "0%" },
  trend: { type: String, enum: ['up', 'down', 'stable'], default: 'stable' },
  location: { type: String, required: true },
  state: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('MarketPrice', marketPriceSchema);
