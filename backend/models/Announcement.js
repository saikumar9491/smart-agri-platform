import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    required: true
  },
  bgGradient: {
    type: String, // e.g., "bg-gradient-to-br from-green-500 to-emerald-700"
    required: true,
    default: "bg-gradient-to-br from-slate-700 to-slate-900"
  },
  imageUrl: {
    type: String,
    required: true
  },
  accentColor: {
    type: String, // e.g., "bg-green-400/20"
    default: "bg-white/20"
  },
  link: {
    type: String,
    default: ""
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Announcement', announcementSchema);
