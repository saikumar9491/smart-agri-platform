import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  priceUnit: {
    type: String,
    enum: ['piece', 'kg', 'tonnes', 'quintals'],
    default: 'kg'
  },
  category: {
    type: String,
    required: true,
    enum: ['Crops', 'Vegetables', 'Fruits', 'Seeds', 'Fertilizers', 'Tools', 'Land', 'Other']
  },
  quantity: {
    type: String,
    required: true
  },
  quantityUnit: {
    type: String,
    enum: ['units', 'kg', 'tonnes', 'quintals'],
    default: 'kg'
  },
  location: {
    type: String,
    required: false
  },
  image: {
    type: String
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'out_of_stock'],
    default: 'available'
  },
  contactPhone: {
    type: String
  },
  contactEmail: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Listing', listingSchema);
