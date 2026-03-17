export const getIrrigationAdvice = (req, res) => {
  try {
    const defaultZones = {
       'Zone A': { crop: 'Wheat', moisture: 32, status: 'Critical', nextWatering: 'Today, 5:00 PM', needed: '15L per m²' },
       'Zone B': { crop: 'Corn', moisture: 68, status: 'Optimal', nextWatering: 'Tomorrow, 6:00 AM', needed: 'None' },
       'Zone C': { crop: 'Soybeans', moisture: 45, status: 'Good', nextWatering: 'In 2 Days', needed: '5L per m²' },
       'WeatherImpact': {
          rainProbability: 12,
          evaporation: 'High',
          summary: 'Low precipitation and high evaporation rates mean you cannot rely on rainfall for the next 48 hours. Continue with manual irrigation schedule.'
       }
    };

    res.status(200).json({
      success: true,
      data: defaultZones
    });
  } catch (error) {
    console.error('Error fetching irrigation advice:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
