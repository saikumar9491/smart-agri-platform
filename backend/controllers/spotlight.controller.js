import Spotlight from '../models/Spotlight.js';

// @desc    Get active spotlight items for dashboard
// @route   GET /api/spotlights
// @access  Public
export const getActiveSpotlights = async (req, res) => {
  try {
    const spotlights = await Spotlight.find({ active: true }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: spotlights.length,
      data: spotlights
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
