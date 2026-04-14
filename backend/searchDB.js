import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function search() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const collections = await mongoose.connection.db.listCollections().toArray();
  const searchString = '1776';
  
  for (const col of collections) {
    const name = col.name;
    const documents = await mongoose.connection.db.collection(name).find({}).toArray();
    
    for (const doc of documents) {
      const docString = JSON.stringify(doc);
      if (docString.includes(searchString)) {
        console.log(`Found in collection [${name}]:`, doc);
      }
    }
  }
  
  process.exit(0);
}

search();
