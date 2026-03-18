import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Crop from './models/Crop.js';
import Post from './models/Post.js';
import User from './models/User.js';

dotenv.config();

const crops = [
  {
    name: 'Wheat',
    idealSoil: ['Loamy', 'Clay'],
    season: ['Winter', 'Spring'],
    waterRequirement: 'Medium',
    estimatedYield: '3-4 tons/hectare',
    description: 'A versatile staple crop that thrives in well-drained loamy soils and cool weather.'
  },
  {
    name: 'Rice (Basmati)',
    idealSoil: ['Clay', 'Silty'],
    season: ['Monsoon'],
    waterRequirement: 'High',
    estimatedYield: '2.5-3.5 tons/hectare',
    description: 'High-value aromatic rice. Requires standing water and humid conditions.'
  },
  {
    name: 'Cotton',
    idealSoil: ['Black Soil', 'Alluvial'],
    season: ['Summer'],
    waterRequirement: 'Medium',
    estimatedYield: '1.5-2 tons/hectare',
    description: 'A major cash crop. Needs deep soil and clear sunny days during flowering.'
  },
  {
    name: 'Maize (Corn)',
    idealSoil: ['Loamy', 'Sandy Loam'],
    season: ['Summer', 'Monsoon'],
    waterRequirement: 'Medium',
    estimatedYield: '5-7 tons/hectare',
    description: 'Grows quickly and requires good sunlight and nitrogen-rich soil.'
  },
  {
    name: 'Soybean',
    idealSoil: ['Loamy', 'Black Soil'],
    season: ['Monsoon'],
    waterRequirement: 'Medium',
    estimatedYield: '2-3 tons/hectare',
    description: 'Excellent for soil nitrogen fixation. Requires moderate rainfall.'
  }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await Crop.deleteMany({});
        
        // Insert Crops
        await Crop.insertMany(crops);
        console.log('✅ Crops seeded successfully');

        // Check if we need to seed a demo user for community posts
        let demoUser = await User.findOne({ email: 'demo@agrismart.com' });
        if (!demoUser) {
           const salt = await bcrypt.genSalt(10);
           const hashedPassword = await bcrypt.hash('password123', salt);
           
           demoUser = new User({
             name: 'Agri Expert',
             email: 'demo@agrismart.com',
             password: hashedPassword,
             location: 'Pune, Maharashtra'
           });
           await demoUser.save();
        }

        // Optional: Seed some initial posts if empty
        const postCount = await Post.countDocuments();
        if (postCount === 0) {
            const posts = [
                {
                    userId: demoUser._id,
                    title: 'Sustainable Pest Management',
                    content: 'Highly recommend using pheromone traps along with neem oil for early-stage pest control in tomatoes. It reduced my crop loss by 30% this season.',
                    tags: ['Pest Control', 'Tomatoes'],
                    likes: 42
                },
                {
                    userId: demoUser._id,
                    title: 'New Subsidy for Drip Irrigation',
                    content: 'The state government has announced a 80% subsidy for small-scale farmers installing drip systems. Check the Mahadbt portal for details.',
                    tags: ['Irrigation', 'Subsidy'],
                    likes: 85
                }
            ];
            await Post.insertMany(posts);
            console.log('✅ Community posts seeded successfully');
        }

        console.log('All seeding operations complete.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedDB();
