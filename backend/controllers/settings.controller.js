import GlobalSetting from '../models/GlobalSetting.js';

// @desc    Get a global setting by key
// @route   GET /api/settings/:key
// @access  Public/Authenticated
export const getSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await GlobalSetting.findOne({ key });
    
    if (!setting) {
      return res.status(404).json({ success: false, message: 'Setting not found' });
    }

    res.status(200).json({ success: true, data: setting.value });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
