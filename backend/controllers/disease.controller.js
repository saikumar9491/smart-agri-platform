import AIResult from '../models/AIResult.js';

export const detectDisease = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    // Wait a brief moment to simulate ML model inference time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const cropType = req.body.cropType || 'Generic';
    const filename = req.file.originalname.toLowerCase();
    
    // Expanded safety check for common mobile/non-agri filenames
    const nonAgriKeywords = ['selfie', 'profile', 'person', 'car', 'building', 'office', 'whatsapp', 'screenshot', 'attachment'];
    const genericPrefixes = ['img_', 'pxl_', 'dsc_', 'dcim_', 'image_', '2026', '2025'];
    const plantKeywords = ['leaf', 'plant', 'crop', 'rust', 'spot', 'infection', 'diseas', 'paddy', 'wheat', 'corn', 'maize', 'tomato'];
    
    const isGenericMobileUpload = genericPrefixes.some(p => filename.startsWith(p)) || 
                                  filename.includes('whatsapp') ||
                                  /^\d+$/.test(filename.split('.')[0]); // Numeric filenames

    const containsPlantRecall = plantKeywords.some(k => filename.includes(k));

    // A "Smart" prototype should be skeptical of generic mobile uploads without plant keywords
    const isLikelyNotPlant = (isGenericMobileUpload || nonAgriKeywords.some(k => filename.includes(k))) && !containsPlantRecall;

    const fullDatabase = {
      'Maize': {
        name: 'Maize Rust (Puccinia sorghi)',
        confidence: 0.98,
        treatment: 'Plant resistant hybrids. Apply fungicides if infection appears early. Ensure good air circulation.',
        medicine: 'Propiconazole 25% EC (Rate: 1.5ml/L)'
      },
      'Wheat': {
        name: 'Wheat Leaf Blight',
        confidence: 0.94,
        treatment: 'Avoid excessive nitrogen fertilization. Use certified pathogen-free seeds. Target fungicide sprays.',
        medicine: 'Triazole-based fungicides (Rate: 1ml/L)'
      },
      'Rice': {
        name: 'Rice Blast (Magnaporthe grisea)',
        confidence: 0.96,
        treatment: 'Reduce field water level. Balance nitrogen application. Apply systemic fungicides.',
        medicine: 'Tricyclazole 75% WP (Rate: 0.6g/L)'
      },
      'Tomato': {
        name: 'Early Blight (Alternaria solani)',
        confidence: 0.92,
        treatment: 'Remove infected lower leaves. Use drip irrigation to keep foliage dry. Apply copper-based fungicides.',
        medicine: 'Copper Oxychloride 50% WP (Rate: 2.5g/L)'
      },
      'Apple': {
        name: 'Apple Scab',
        confidence: 0.95,
        treatment: 'Remove and destroy fallen leaves. Apply protective fungicides before rainfall.',
        medicine: 'Captan 50WP (Rate: 2g/L of water)'
      },
      'Chilli': {
        name: 'Chilli Anthracnose',
        confidence: 0.89,
        treatment: 'Remove infected fruits. Use disease-free seeds. Spray fungicides at 15-day intervals.',
        medicine: 'Mancozeb 75% WP (Rate: 2g/L)'
      }
    };

    let mockResult;

    if (cropType === 'Generic' && !containsPlantRecall) {
      mockResult = {
        detectedDisease: 'Unable to Identify',
        confidenceScore: 0.15,
        treatmentSuggestion: 'Please upload a clear photo of a crop leaf and specify the crop type for better accuracy.',
        recommendedPesticide: 'N/A'
      };
    } else {
      const selectedCrop = (cropType !== 'Generic' && fullDatabase[cropType]) 
        ? cropType 
        : Object.keys(fullDatabase).find(k => filename.includes(k.toLowerCase())) || 'Apple';

      const disease = fullDatabase[selectedCrop];
      
      // If it's a generic upload without plant keywords, cap the confidence at 50% (well below meds threshold)
      const score = isLikelyNotPlant 
        ? (0.3 + Math.random() * 0.2) 
        : (disease.confidence - (Math.random() * 0.05));

      mockResult = {
        detectedDisease: isLikelyNotPlant ? `Uncertain: Potential ${disease.name}` : disease.name,
        confidenceScore: score,
        treatmentSuggestion: isLikelyNotPlant 
          ? 'Image analysis is inconclusive. This does not look like a typical crop leaf. For safety, medicine advice is withheld.' 
          : disease.treatment,
        recommendedPesticide: isLikelyNotPlant ? 'None' : disease.medicine
      };
    }

    mockResult.imageUrl = req.file.path;

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
