import express from 'express';
import { createListing, getListings, getMyListings, deleteListing, updateListingStatus, updateListing } from '../controllers/listing.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import multer from 'multer';
import { listingStorage } from '../utils/cloudinary.js';

const upload = multer({ storage: listingStorage });

const router = express.Router();

router.post('/', protect, upload.single('image'), createListing);
router.get('/', protect, getListings);
router.get('/my', protect, getMyListings);
router.delete('/:id', protect, deleteListing);
router.patch('/:id/status', protect, updateListingStatus);
router.patch('/:id', protect, upload.single('image'), updateListing);

export default router;
