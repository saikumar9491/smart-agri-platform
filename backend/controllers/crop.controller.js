import Crop from '../models/Crop.js';

// Currently uses mocked logic based on simple rules as per plan
export const recommendCrop = async (req, res) => {
  try {
    const { soilType, location, season } = req.body;
    
    // In a real app we'd call an external ML API here.
    // For now, we perform a simple database query based on rules.
    
    // Find crops that match at least one criteria
    let query = {};
    if (soilType) {
      query.idealSoil = { $regex: new RegExp(soilType, 'i') };
    }
    if (season) {
      query.season = { $regex: new RegExp(season, 'i') };
    }

    // Default to some crops if no matches to provide a UX
    let recommendations = await Crop.find(query).limit(3);
    
    if (recommendations.length === 0) {
      // Return a mocked ideal crop if DB is empty for demo purposes
      return res.status(200).json({
        success: true,
        mocked: true,
        data: [
          {
             name: 'Wheat',
             idealSoil: ['Loamy', 'Clay'],
             season: ['Winter'],
             waterRequirement: 'Medium',
             estimatedYield: '3-4 tons/hectare',
             description: 'A highly adaptable staple crop suitable for temperate climates.'
          },
          {
             name: 'Corn',
             idealSoil: ['Silty', 'Loamy'],
             season: ['Summer'],
             waterRequirement: 'High',
             estimatedYield: '5-8 tons/hectare',
             description: 'Fast growing crop that requires substantial sunlight and deep soil.'
          }
        ]
      });
    }

    res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Error in recommendCrop:', error);
    res.status(500).json({ success: false, message: 'Server error analyzing crop data.' });
  }
};
