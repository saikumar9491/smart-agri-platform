import Listing from '../models/Listing.js';

// Create a new marketplace listing
export const createListing = async (req, res) => {
  try {
    const { title, description, price, priceUnit, category, quantity, quantityUnit, location, contactPhone, contactEmail } = req.body;
    
    const newListing = new Listing({
      seller: req.user.id,
      title,
      description,
      price: Number(price),
      priceUnit,
      category,
      quantity,
      quantityUnit,
      location,
      contactPhone,
      contactEmail,
      image: req.file ? req.file.path : null
    });

    await newListing.save();
    
    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: newListing
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating listing'
    });
  }
};

// Get all marketplace listings with filters
export const getListings = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;
    
    let query = { status: 'available' };
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const listings = await Listing.find(query)
      .populate('seller', 'name profilePic')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: listings
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching listings'
    });
  }
};

// Get listings by the current user
export const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: listings
    });
  } catch (error) {
    console.error('Get my listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your listings'
    });
  }
};

// Delete a listing
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check ownership or admin role
    if (listing.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this listing'
      });
    }

    await listing.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting listing'
    });
  }
};

// Update listing status (e.g. mark as sold)
export const updateListingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    if (listing.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this listing'
      });
    }

    listing.status = status;
    await listing.save();

    res.status(200).json({
      success: true,
      message: 'Listing status updated',
      data: listing
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating listing status'
    });
  }
};
