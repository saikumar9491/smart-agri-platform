import mongoose from 'mongoose';

const globalSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g., 'maintenanceMode', 'supportEmail'
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('GlobalSetting', globalSettingSchema);
