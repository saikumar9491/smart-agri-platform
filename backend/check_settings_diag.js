import mongoose from 'mongoose';
import dotenv from 'dotenv';
import GlobalSetting from './models/GlobalSetting.js';

dotenv.config();

const checkSettings = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const settings = await GlobalSetting.find();
    console.log('Global Settings in DB:');
    console.log(JSON.stringify(settings, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

checkSettings();
