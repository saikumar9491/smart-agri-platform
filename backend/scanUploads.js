import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function scanUploads() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const collections = await mongoose.connection.db.listCollections().toArray();
  
  for (const col of collections) {
    const name = col.name;
    const documents = await mongoose.connection.db.collection(name).find({}).toArray();
    
    for (const doc of documents) {
      Object.keys(doc).forEach(key => {
        const val = doc[key];
        if (typeof val === 'string' && val.includes('/uploads/')) {
          console.log(`[${name}] ${doc._id} -> ${key}: ${val}`);
        }
        if (Array.isArray(val)) {
           val.forEach(item => {
             if (typeof item === 'string' && item.includes('/uploads/')) {
               console.log(`[${name}] ${doc._id} -> ${key} (array): ${item}`);
             }
           });
        }
      });
    }
  }
  
  process.exit(0);
}

scanUploads();
