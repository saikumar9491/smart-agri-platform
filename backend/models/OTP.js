import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  type: { type: String, enum: ['signup', 'reset'], required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }
});

export default mongoose.model('OTP', otpSchema);
