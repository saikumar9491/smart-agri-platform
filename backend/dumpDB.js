import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function dump() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const collections = ['globalsettings', 'spotlights'];
  
  for (const name of collections) {
    const documents = await mongoose.connection.db.collection(name).find({}).toArray();
    console.log(`--- Collection [${name}] ---`);
    console.log(documents);
  }
  
  process.exit(0);
}

dump();
