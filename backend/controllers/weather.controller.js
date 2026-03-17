export const getWeather = (req, res) => {
  try {
    const weatherData = {
      current: {
        temp: 28,
        condition: 'Partly Cloudy',
        location: 'Maharashtra, IN',
        feelsLike: 31,
        humidity: 64,
        windSpeed: 12
      },
      alerts: [
        { type: 'Heavy Rain Warning', message: 'Expected unexpected heavy showers in late evening. Secure harvested grains.' }
      ],
      forecast: [
        { day: 'Mon', temp: 29, condition: 'Sunny' },
        { day: 'Tue', temp: 28, condition: 'Rain' },
        { day: 'Wed', temp: 25, condition: 'Storm' },
        { day: 'Thu', temp: 27, condition: 'Sunny' },
        { day: 'Fri', temp: 30, condition: 'Sunny' }
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
