import mongoose from 'mongoose';

const cropSchema = new mongoose.Schema({
  name: { type: String, required: true },
  idealSoil: [{ type: String }],
  season: [{ type: String }], // e.g., 'Summer', 'Winter'
  waterRequirement: { type: String }, // e.g., 'High', 'Medium', 'Low'
  estimatedYield: { type: String },
  description: { type: String }
});

export default mongoose.model('Crop', cropSchema);
