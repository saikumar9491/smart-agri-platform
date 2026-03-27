import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Crop from './models/Crop.js';

dotenv.config();

const crops = [
  {
    name: 'Wheat',
    idealSoil: ['Loamy', 'Clay'],
    season: ['Winter'],
    waterRequirement: 'Medium',
    estimatedYield: '3-4 tons/hectare',
    description: 'A highly adaptable staple crop suitable for temperate climates. Thrives in cool weather.'
  },
  {
    name: 'Rice (Paddy)',
    idealSoil: ['Clay', 'Silty'],
    season: ['Monsoon'],
    waterRequirement: 'High',
    estimatedYield: '4-6 tons/hectare',
    description: 'A major food staple that requires standing water. Best suited for heavy soils and high rainfall.'
  },
  {
    name: 'Maize (Corn)',
    idealSoil: ['Loamy', 'Silty'],
    season: ['Summer', 'Monsoon'],
    waterRequirement: 'Medium',
    estimatedYield: '5-8 tons/hectare',
    description: 'Fast growing crop that requires substantial sunlight and well-drained fertile soil.'
  },
  {
    name: 'Cotton',
    idealSoil: ['Black Soil', 'Loamy'],
    season: ['Summer'],
    waterRequirement: 'Medium',
    estimatedYield: '2-3 tons/hectare',
    description: 'A cash crop that performs exceptionally well in black cotton soil under sunny conditions.'
  },
  {
    name: 'Sugarcane',
    idealSoil: ['Loamy', 'Clay'],
    season: ['Summer'],
    waterRequirement: 'Very High',
    estimatedYield: '70-100 tons/hectare',
    description: 'Long duration crop requiring abundant water and rich, moist soil.'
  },
  {
    name: 'Tomato',
    idealSoil: ['Loamy', 'Sandy'],
    season: ['Summer', 'Winter'],
    waterRequirement: 'Medium',
    estimatedYield: '20-30 tons/hectare',
    description: 'Versatile vegetable crop that needs consistent moisture and well-drained soil.'
  },
  {
    name: 'Chilli',
    idealSoil: ['Loamy', 'Black Soil'],
    season: ['Summer', 'Winter'],
    waterRequirement: 'Medium',
    estimatedYield: '2-3 tons/hectare',
    description: 'Grows best in warm climates with moderate rainfall and good soil drainage.'
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');
    
    await Crop.deleteMany({});
    console.log('Cleared existing crops.');
    
    await Crop.insertMany(crops);
    console.log('Seeded 7 core crops successfully.');
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding DB:', err);
    process.exit(1);
  }
};

seedDB();
