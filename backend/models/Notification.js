import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'success', 'follow'], default: 'info' },
  target: { type: String, enum: ['all', 'specific'], default: 'all' },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ target: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
