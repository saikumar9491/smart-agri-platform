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
    const mockResult = {
      detectedDisease: 'Apple Scab',
      confidenceScore: 0.94,
      treatmentSuggestion: 'Remove and destroy fallen leaves. Apply protective fungicides like Captan or Mancozeb before rainfall.',
      recommendedPesticide: 'Captan 50WP (Rate: 2g/L of water)',
      imageUrl: '/uploads/' + req.file.filename // We would host this statically
    };

    // Save to DB (mocking user for now if we don't have auth)
    const resultDoc = new AIResult({
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
