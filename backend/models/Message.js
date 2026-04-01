import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'image', 'voice', 'document', 'call'], default: 'text' },
  fileUrl: { type: String, default: null },
  fileSize: { type: Number, default: null },
  duration: { type: Number, default: null }, // for audio/calls
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  isPinned: { type: Boolean, default: false },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Message', messageSchema);
