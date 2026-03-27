export const getWeather = (req, res) => {
  try {
    const { lat, lon } = req.query;
    let locationName = req.user?.location || 'Maharashtra, IN';
    
    // Simulate high-fidelity weather data based on coordinates or user location
    // In a production app, we would use a real weather API like OpenWeatherMap
    
    const isNorthIndia = lat && parseFloat(lat) > 22;
    const isCoastal = locationName.toLowerCase().includes('mumbai') || 
                      locationName.toLowerCase().includes('chennai') || 
                      locationName.toLowerCase().includes('kerala');

    // Base temperature logic
    let baseTemp = 28;
    if (isNorthIndia) baseTemp = 34; // North is hotter in this simulated season
    if (isCoastal) baseTemp = 30;

    const weatherData = {
      current: {
        temp: Math.round(baseTemp + (Math.random() * 4 - 2)),
        condition: Math.random() > 0.7 ? 'Partly Cloudy' : 'Sunny',
        location: lat && lon ? `Coord: ${parseFloat(lat).toFixed(2)}, ${parseFloat(lon).toFixed(2)}` : locationName,
        isDetected: !!(lat && lon),
        feelsLike: Math.round(baseTemp + 4),
        humidity: isCoastal ? 82 : 45,
        windSpeed: Math.round(10 + Math.random() * 10)
      },
      alerts: [
        { 
          type: isNorthIndia ? 'Heat Wave Warning' : 'Stable Conditions', 
          message: isNorthIndia 
            ? 'High temperatures expected. Ensure adequate irrigation for sensitive crops.' 
            : 'Conditions are favorable for harvesting and post-harvest activities.' 
        }
      ],
      forecast: [
        { day: 'Mon', temp: baseTemp + 1, condition: 'Sunny' },
        { day: 'Tue', temp: baseTemp, condition: 'Sunny' },
        { day: 'Wed', temp: baseTemp - 2, condition: 'Partly Cloudy' },
        { day: 'Thu', temp: baseTemp - 1, condition: 'Sunny' },
        { day: 'Fri', temp: baseTemp + 2, condition: 'Sunny' }
      ]
    };

    res.status(200).json({
      success: true,
      data: weatherData
    });
  } catch (error) {
    console.error('Error fetching weather:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
