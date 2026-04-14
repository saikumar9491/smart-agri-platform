import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function findInPostsAndListings() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const searchPattern = /bg_|bq_|1776/;
  
  console.log("--- Scanning Posts ---");
  const posts = await mongoose.connection.db.collection('posts').find({}).toArray();
  for (const post of posts) {
    if (post.image && searchPattern.test(post.image)) {
      console.log(`Found broken image in Post [${post.title}]: ${post.image}`);
    }
  }

  console.log("--- Scanning Listings ---");
  const listings = await mongoose.connection.db.collection('listings').find({}).toArray();
  for (const listing of listings) {
    if (listing.image && searchPattern.test(listing.image)) {
      console.log(`Found broken image in Listing [${listing.title}]: ${listing.image}`);
    }
    if (listing.images && Array.isArray(listing.images)) {
      listing.images.forEach(img => {
        if (searchPattern.test(img)) {
          console.log(`Found broken image in Listing [${listing.title}] (images array): ${img}`);
        }
      });
    }
  }

  console.log("--- Scanning Announcements ---");
  const ann = await mongoose.connection.db.collection('announcements').find({}).toArray();
  for (const a of ann) {
    if (a.imageUrl && searchPattern.test(a.imageUrl)) {
      console.log(`Found broken image in Announcement [${a.title}]: ${a.imageUrl}`);
    }
  }

  process.exit(0);
}

findInPostsAndListings();
