export const getIrrigationAdvice = (req, res) => {
  try {
    const userLocation = req.user?.location || 'your region';
    const isDry = Math.random() > 0.4; // Simulate real-time variation

    const defaultZones = {
       'Zone A': { 
         crop: 'Wheat', 
         moisture: isDry ? 28 : 34, 
         status: isDry ? 'Critical' : 'Good', 
         nextWatering: isDry ? 'Today, 5:00 PM' : 'Tomorrow, 6:00 AM', 
         needed: isDry ? '15L per m²' : 'None',
         weeklySchedule: [
           { day: 'Mon', status: 'Optimal', needsWater: false },
           { day: 'Tue', status: 'Moderate', needsWater: false },
           { day: 'Wed', status: 'Irrigate 6AM', needsWater: true },
           { day: 'Thu', status: 'Optimal', needsWater: false },
           { day: 'Fri', status: 'Optimal', needsWater: false },
           { day: 'Sat', status: 'Irrigate 5PM', needsWater: true },
           { day: 'Sun', status: 'Optimal', needsWater: false },
         ]
       },
       'Zone B': { 
         crop: 'Corn', 
         moisture: 68, 
         status: 'Optimal', 
         nextWatering: 'Tomorrow, 6:00 AM', 
         needed: 'None',
         weeklySchedule: [
           { day: 'Mon', status: 'Optimal', needsWater: false },
           { day: 'Tue', status: 'Irrigate 6AM', needsWater: true },
           { day: 'Wed', status: 'Optimal', needsWater: false },
           { day: 'Thu', status: 'Optimal', needsWater: false },
           { day: 'Fri', status: 'Irrigate 6AM', needsWater: true },
           { day: 'Sat', status: 'Optimal', needsWater: false },
           { day: 'Sun', status: 'Optimal', needsWater: false },
         ]
       },
       'Zone C': { 
         crop: 'Soybeans', 
         moisture: 45, 
         status: 'Good', 
         nextWatering: 'In 2 Days', 
         needed: '5L per m²',
         weeklySchedule: [
           { day: 'Mon', status: 'Irrigate 6AM', needsWater: true },
           { day: 'Tue', status: 'Optimal', needsWater: false },
           { day: 'Wed', status: 'Optimal', needsWater: false },
           { day: 'Thu', status: 'Moderate', needsWater: false },
           { day: 'Fri', status: 'Optimal', needsWater: false },
           { day: 'Sat', status: 'Optimal', needsWater: false },
           { day: 'Sun', status: 'Irrigate 6AM', needsWater: true },
         ]
       },
       'WeatherImpact': {
          rainProbability: isDry ? 5 : 22,
          evaporation: isDry ? 'High' : 'Moderate',
          summary: isDry 
            ? `Low precipitation and high evaporation rates detected near ${userLocation}. You should prioritize irrigation for Zone A.`
            : `Moderate humidity in ${userLocation} reduces evaporation. Zone A moisture is stable but monitor tonight.`
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
