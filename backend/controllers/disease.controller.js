import AIResult from '../models/AIResult.js';

export const detectDisease = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    // Wait a brief moment to simulate ML model inference time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // For a real app, you would process req.file.path with an ML model here.
    // For now, we mock a response.
    const filename = req.file.originalname.toLowerCase();
    let mockResult;

    if (filename.includes('maize') || filename.includes('corn')) {
      mockResult = {
        detectedDisease: 'Maize Rust (Puccinia sorghi)',
        confidenceScore: 0.96,
        treatmentSuggestion: 'Plant resistant hybrids. Apply fungicides like Propiconazole if infection appears early. Ensure good air circulation.',
        recommendedPesticide: 'Propiconazole 25% EC (Rate: 1.5ml/L)'
      };
    } else if (filename.includes('wheat')) {
      mockResult = {
        detectedDisease: 'Wheat Leaf Blight',
        confidenceScore: 0.91,
        treatmentSuggestion: 'Avoid excessive nitrogen fertilization. Use certified pathogen-free seeds. Target fungicide sprays during favorable conditions.',
        recommendedPesticide: 'Triazole-based fungicides (Rate: 1ml/L)'
      };
    } else if (filename.includes('rice') || filename.includes('paddy')) {
       mockResult = {
        detectedDisease: 'Rice Blast (Magnaporthe grisea)',
        confidenceScore: 0.94,
        treatmentSuggestion: 'Reduce field water level. Balance nitrogen application. Apply systemic fungicides like Tricyclazole during tilt and heading stages.',
        recommendedPesticide: 'Tricyclazole 75% WP (Rate: 0.6g/L)'
      };
    } else {
      mockResult = {
        detectedDisease: 'Apple Scab',
        confidenceScore: 0.94,
        treatmentSuggestion: 'Remove and destroy fallen leaves. Apply protective fungicides like Captan or Mancozeb before rainfall.',
        recommendedPesticide: 'Captan 50WP (Rate: 2g/L of water)'
      };
    }

    mockResult.imageUrl = '/uploads/' + req.file.filename;

    // Save to DB (logged in user available on req.user)
    const resultDoc = new AIResult({
       userId: req.user ? req.user.id : null,
       ...mockResult
    });
    
    await resultDoc.save();

    res.status(200).json({
      success: true,
      data: mockResult
    });
  } catch (error) {
    console.error('Error in detectDisease:', error);
    res.status(500).json({ success: false, message: 'Server error processing image.' });
  }
};
