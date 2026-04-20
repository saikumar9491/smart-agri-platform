import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import Spotlight from '../models/Spotlight.js';
import MarketPrice from '../models/MarketPrice.js';
import GlobalSetting from '../models/GlobalSetting.js';

// Optimized Dashboard Aggregator
export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const locationName = req.user?.location || 'Maharashtra, IN';

    // 1. Parallel Fetching for Database Records
    console.time('Dashboard-DB-Queries');
    const [posts, notifications, spotlights, globalSettingsData, localPrices] = await Promise.all([
      Post.find().populate('userId', 'name profilePic').populate('likes', 'name profilePic').sort({ createdAt: -1 }).limit(10),
      Notification.find({ $or: [{ target: 'all' }, { recipientId: userId }] }).sort({ createdAt: -1 }).limit(10),
      Spotlight.find({ active: true }).sort({ createdAt: -1 }),
      GlobalSetting.find(),
      MarketPrice.find().sort({ createdAt: -1 }).limit(5)
    ]);
    console.timeEnd('Dashboard-DB-Queries');

    // 2. Format Settings
    const settings = globalSettingsData.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});

    // 3. Format Posts (Aggregated Logic)
    const formattedPosts = posts.map(p => ({
      id: p._id,
      author: p.userId ? (p.userId.name || 'Anonymous Farmer') : 'Unknown Farmer', 
      authorPic: p.userId ? p.userId.profilePic : null,
      time: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recent',
      title: p.title || 'Untitled Discussion',
      content: p.content || '',
      likes: Array.isArray(p.likes) ? p.likes.length : 0,
      replies: Array.isArray(p.comments) ? p.comments.length : 0,
      tags: p.tags || []
    }));

    // 4. Simulated Weather Logic (Re-used)
    const baseTemp = 28;
    const weatherData = {
      current: {
        temp: Math.round(baseTemp + (Math.random() * 4 - 2)),
        condition: Math.random() > 0.7 ? 'Partly Cloudy' : 'Sunny',
        location: locationName,
        feelsLike: Math.round(baseTemp + 4),
        humidity: 45,
        windSpeed: Math.round(10 + Math.random() * 10)
      },
      forecast: [
        { day: 'Mon', temp: baseTemp + 1, condition: 'Sunny' },
        { day: 'Tue', temp: baseTemp, condition: 'Sunny' },
        { day: 'Wed', temp: baseTemp - 2, condition: 'Partly Cloudy' }
      ]
    };

    // 5. Simulated Irrigation Logic (Re-used)
    const isDry = Math.random() > 0.4;
    const irrigationData = {
       'Zone A': { crop: 'Wheat', moisture: isDry ? 28 : 34, status: isDry ? 'Critical' : 'Good' },
       'Zone B': { crop: 'Corn', moisture: 68, status: 'Optimal' },
       'WeatherImpact': { rainProbability: isDry ? 5 : 22, summary: `Conditions near ${locationName} are ${isDry ? 'dry' : 'stable'}.` }
    };

    // 6. Market Prices (Aggregated Logic)
    // For the dashboard overview, we often prefer the fast local data or demo data
    // to avoid blocking the user with the gov API handshake.
    let marketPrices = [];
    if (localPrices && localPrices.length > 0) {
      marketPrices = localPrices.map(p => ({
        crop: p.crop,
        location: p.location,
        price: p.price,
        trend: p.trend,
        change: p.change
      }));
    } else {
      // Demo fallback
      marketPrices = [
        { crop: 'Wheat', location: 'Phagwara Mandi', price: '2,125', trend: 'up', change: '+2.4%' },
        { crop: 'Paddy', location: 'Phagwara APMC', price: '1,960', trend: 'stable', change: '0.0%' }
      ];
    }

    // 7. Combine & Respond
    res.status(200).json({
      success: true,
      data: {
        weather: weatherData,
        irrigation: irrigationData,
        community: formattedPosts,
        market: marketPrices,
        agriCamUrl: settings.agriCamUrl || '',
        notifications,
        spotlights,
        tiles: {
          crop_guide: settings.tile_crop_guide,
          disease_ml: settings.tile_disease_ml,
          irrigation: settings.tile_irrigation,
          market_prices: settings.tile_market_prices,
          marketplace: settings.tile_marketplace
        }
      }
    });

  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ success: false, message: 'Optimization Error' });
  }
};
