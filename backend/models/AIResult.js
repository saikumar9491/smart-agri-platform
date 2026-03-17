import mongoose from 'mongoose';

const aiResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  imageUrl: { type: String, required: true },
  detectedDisease: { type: String, required: true },
  confidenceScore: { type: Number, required: true }, // e.g., 0.95
  treatmentSuggestion: { type: String },
  recommendedPesticide: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('AIResult', aiResultSchema);
