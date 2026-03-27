import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ email: 'balisaikumar9491@gmail.com' });
        if (user) {
            console.log('User found:', {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            });
        } else {
            console.log('User NOT found');
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
