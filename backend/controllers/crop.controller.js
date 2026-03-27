import Crop from '../models/Crop.js';

// Currently uses mocked logic based on simple rules as per plan
export const recommendCrop = async (req, res) => {
  try {
    const { soilType, location, season } = req.body;
    
    // Advanced Soil Family Matching (Black Soil vs Loamy vs Clay)
    const soilFamilies = {
      'Black Soil': ['Loamy', 'Clay'],
      'Loamy': ['Sandy', 'Silty'],
      'Clay': ['Loamy', 'Silty'],
      'Sandy': ['Loamy'],
      'Silty': ['Loamy', 'Clay']
    };

    // Build Query
    let query = {};
    if (soilType) {
      const family = soilFamilies[soilType] || [];
      query.idealSoil = { $in: [soilType, ...family] };
    }
    if (season) {
      query.season = season;
    }

    // Fetch and Enhance with AI Insights
    let recommendations = await Crop.find(query);
    
    // If no direct matches, broaden the search to just soil or just season
    if (recommendations.length === 0) {
      recommendations = await Crop.find({ 
        $or: [
          { idealSoil: soilType },
          { season: season }
        ]
      }).limit(3);
    }

    const enhancedResults = recommendations.map(crop => {
      let insight = `Perfect for ${season} seasons. `;
      if (crop.idealSoil.includes(soilType)) {
        insight += `Your ${soilType} provides the exact drainage this crop needs. `;
      } else {
        insight += `Adaptable to your ${soilType} with slightly more irrigation. `;
      }
      
      if (location && location.toLowerCase().includes('maharashtra') && crop.name === 'Cotton') {
        insight += `Recommended specifically for the Vidarbha/Marathwada regions.`;
      }

      return {
        ...crop._doc,
        aiInsight: insight,
        matchScore: crop.idealSoil.includes(soilType) ? 98 : 85
      };
    });

    res.status(200).json({
      success: true,
      data: enhancedResults.sort((a, b) => b.matchScore - a.matchScore)
    });
  } catch (error) {
    console.error('Error in recommendCrop:', error);
    res.status(500).json({ success: false, message: 'Server error analyzing crop data.' });
  }
};
