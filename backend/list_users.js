import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function listUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({}).select('email name role');
        console.log('--- USERS START ---');
        console.log(JSON.stringify(users, null, 2));
        console.log('--- USERS END ---');
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

listUsers();
