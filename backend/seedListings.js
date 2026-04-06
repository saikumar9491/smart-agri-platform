import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Listing from './models/Listing.js';
import User from './models/User.js';

dotenv.config();

const sampleListings = [
  {
    title: 'Fresh Organic Wheat',
    description: 'High quality Sharbati wheat grown without pesticides. Perfect for making soft rotis.',
    price: 2450,
    priceUnit: 'quintals',
    category: 'Crops',
    quantity: '50',
    quantityUnit: 'quintals',
    location: 'Sehore, MP',
    status: 'available',
    contactPhone: '9876543210',
    contactEmail: 'expert@agrismart.com'
  },
  {
    title: 'Red Onions (Nashik)',
    description: 'Medium sized red onions from Nashik. Long shelf life and great taste.',
    price: 1800,
    priceUnit: 'quintals',
    category: 'Crops',
    quantity: '100',
    quantityUnit: 'quintals',
    location: 'Lasalgaon, MH',
    status: 'available',
    contactPhone: '9876543210'
  },
  {
    title: 'Hybrid Maize Seeds',
    description: 'High yield potential maize seeds. Suitable for monsoon sowing.',
    price: 450,
    priceUnit: 'kg',
    category: 'Seeds',
    quantity: '500',
    quantityUnit: 'kg',
    location: 'Dharwad, KA',
    status: 'available'
  },
  {
    title: 'Organic Cow Manure',
    description: 'Fully decomposed organic manure. Rich in nitrogen and organic matter.',
    price: 5000,
    priceUnit: 'tonnes',
    category: 'Fertilizers',
    quantity: '10',
    quantityUnit: 'tonnes',
    location: 'Pune, MH',
    status: 'available'
  },
  {
    title: 'Desi Ghee (Pure)',
    description: 'Pure buffalo milk ghee made using traditional methods.',
    price: 650,
    priceUnit: 'kg',
    category: 'Other',
    quantity: '20',
    quantityUnit: 'kg',
    location: 'Amritsar, PB',
    status: 'available'
  }
];

// Add 5 more items to Crops to test long horizontal scroll
for(let i=1; i<=5; i++) {
    sampleListings.push({
        title: `Crop Sample ${i}`,
        description: `Description for sample crop ${i}`,
        price: 2000 + (i * 100),
        priceUnit: 'quintals',
        category: 'Crops',
        quantity: '10',
        quantityUnit: 'quintals',
        location: 'Sample Location',
        status: 'available'
    });
}

const seedListings = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    let expert = await User.findOne({ email: 'demo@agrismart.com' });
    if (!expert) {
        // If demo user doesn't exist, use any user
        expert = await User.findOne({});
    }

    if (!expert) {
        console.error('No users found in database. Please register a user first.');
        process.exit(1);
    }

    const listingsWithSeller = sampleListings.map(l => ({
        ...l,
        seller: expert._id,
        contactEmail: l.contactEmail || expert.email,
        contactPhone: l.contactPhone || expert.phone || '9999999999'
    }));

    await Listing.deleteMany({});
    console.log('Cleared existing listings');
    
    await Listing.insertMany(listingsWithSeller);
    console.log(`Successfully seeded ${listingsWithSeller.length} marketplace listings!`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding marketplace:', err);
    process.exit(1);
  }
};

seedListings();
