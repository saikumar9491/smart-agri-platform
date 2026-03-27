import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g., 'DELETE_USER', 'UPDATE_SETTING'
  targetId: { type: String }, // ID of the user, post, or setting affected
  details: { type: String }, // Human-readable description
  ipAddress: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('AuditLog', auditLogSchema);
