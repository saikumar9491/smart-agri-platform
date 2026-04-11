import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'agri-smart/profiles',
    transformation: [{ width: 500, height: 500, crop: 'limit', format: 'webp' }],
    resource_type: 'auto',
  },
});

const listingStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'agri-smart/listings',
    transformation: [{ width: 800, height: 800, crop: 'limit', format: 'webp' }],
    resource_type: 'auto',
  },
});

const communityStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'agri-smart/posts',
    transformation: [{ width: 1200, crop: 'limit', quality: 'auto', format: 'webp' }],
    resource_type: 'auto',
  },
});

export { cloudinary, storage, listingStorage, communityStorage };
