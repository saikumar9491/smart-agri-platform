import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema({
  path: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ip: { type: String }
});

// Indexing for faster aggregation by date
visitSchema.index({ timestamp: -1 });

export default mongoose.model('Visit', visitSchema);
