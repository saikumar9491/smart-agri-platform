import mongoose from 'mongoose';

const spotlightSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    default: ""
  },
  secondaryImageUrl: {
    type: String,
    default: ""
  },
  badge: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  buttonText: {
    type: String,
    default: "Learn More"
  },
  link: {
    type: String,
    default: ""
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    default: 'image'
  },
  color: {
    type: String,
    default: "indigo-600"
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

export default mongoose.model('Spotlight', spotlightSchema);
