// Expanded mock data representing live market prices across ALL major Indian states
const mockPrices = [
  // Maharashtra
  { crop: 'Wheat', variety: 'Lokwan', price: '₹2,100', change: '+2.5%', trend: 'up', location: 'Nashik APMC', state: 'Maharashtra' },
  { crop: 'Onion', variety: 'Red', price: '₹1,500', change: '-5.2%', trend: 'down', location: 'Lasalgaon', state: 'Maharashtra' },
  { crop: 'Soybean', variety: 'Yellow', price: '₹4,800', change: '0%', trend: 'stable', location: 'Latur APMC', state: 'Maharashtra' },
  { crop: 'Cotton', variety: 'Long Staple', price: '₹7,200', change: '+1.8%', trend: 'up', location: 'Jalgaon', state: 'Maharashtra' },
  { crop: 'Grapes', variety: 'Thompson Seedless', price: '₹4,500', change: '+8.4%', trend: 'up', location: 'Nashik APMC', state: 'Maharashtra' },
  { crop: 'Tomato', variety: 'Hybrid', price: '₹800', change: '-12.0%', trend: 'down', location: 'Pune APMC', state: 'Maharashtra' },
  
  // Punjab
  { crop: 'Rice', variety: 'Basmati', price: '₹3,500', change: '+4.2%', trend: 'up', location: 'Ludhiana APMC', state: 'Punjab' },
  { crop: 'Wheat', variety: 'PBW-343', price: '₹2,275', change: '+1.0%', trend: 'up', location: 'Amritsar APMC', state: 'Punjab' },
  
  // Haryana
  { crop: 'Wheat', variety: 'Sharbati', price: '₹2,300', change: '+1.5%', trend: 'up', location: 'Karnal APMC', state: 'Haryana' },
  { crop: 'Mustard', variety: 'Black', price: '₹5,100', change: '-1.0%', trend: 'down', location: 'Hisar APMC', state: 'Haryana' },
  
  // Gujarat
  { crop: 'Groundnut', variety: 'Bold', price: '₹5,500', change: '+3.0%', trend: 'up', location: 'Rajkot APMC', state: 'Gujarat' },
  { crop: 'Cotton', variety: 'Shankar-6', price: '₹7,400', change: '+2.1%', trend: 'up', location: 'Ahmedabad APMC', state: 'Gujarat' },
  { crop: 'Cumin', variety: 'Jeera', price: '₹28,000', change: '-2.5%', trend: 'down', location: 'Unjha APMC', state: 'Gujarat' },
  
  // Madhya Pradesh
  { crop: 'Soybean', variety: 'Yellow', price: '₹4,700', change: '-0.5%', trend: 'down', location: 'Indore APMC', state: 'Madhya Pradesh' },
  { crop: 'Wheat', variety: 'Sharbati', price: '₹2,450', change: '+5.0%', trend: 'up', location: 'Sehore APMC', state: 'Madhya Pradesh' },
  { crop: 'Garlic', variety: 'White', price: '₹8,000', change: '+10.0%', trend: 'up', location: 'Mandsaur APMC', state: 'Madhya Pradesh' },

  // Karnataka
  { crop: 'Coffee', variety: 'Arabica', price: '₹14,500', change: '+1.2%', trend: 'up', location: 'Chikkamagaluru', state: 'Karnataka' },
  { crop: 'Tomato', variety: 'Local', price: '₹950', change: '-5.0%', trend: 'down', location: 'Kolar APMC', state: 'Karnataka' },
  { crop: 'Ragi', variety: 'Local', price: '₹3,200', change: '+2.0%', trend: 'up', location: 'Mandya APMC', state: 'Karnataka' },

  // Tamil Nadu
  { crop: 'Turmeric', variety: 'Salem', price: '₹12,500', change: '+0.5%', trend: 'stable', location: 'Erode APMC', state: 'Tamil Nadu' },
  { crop: 'Rice', variety: 'Ponni', price: '₹2,800', change: '+1.5%', trend: 'up', location: 'Thanjavur APMC', state: 'Tamil Nadu' },
  { crop: 'Banana', variety: 'Cavendish', price: '₹1,200', change: '-3.5%', trend: 'down', location: 'Theni APMC', state: 'Tamil Nadu' },

  // Andhra Pradesh
  { crop: 'Chilli', variety: 'Guntur Sannam', price: '₹18,000', change: '+2.0%', trend: 'up', location: 'Guntur APMC', state: 'Andhra Pradesh' },
  { crop: 'Cotton', variety: 'DCH-32', price: '₹7,100', change: '+0.8%', trend: 'up', location: 'Adoni APMC', state: 'Andhra Pradesh' },

  // Telangana
  { crop: 'Rice', variety: 'Sona Masoori', price: '₹2,600', change: '+1.8%', trend: 'up', location: 'Nizamabad APMC', state: 'Telangana' },
  { crop: 'Turmeric', variety: 'Rajapuri', price: '₹11,800', change: '-1.2%', trend: 'down', location: 'Warangal APMC', state: 'Telangana' },

  // Rajasthan
  { crop: 'Mustard', variety: 'Rajasthan Yellow', price: '₹5,300', change: '+2.5%', trend: 'up', location: 'Alwar APMC', state: 'Rajasthan' },
  { crop: 'Cumin', variety: 'Marwari', price: '₹29,500', change: '+3.1%', trend: 'up', location: 'Jodhpur APMC', state: 'Rajasthan' },
  { crop: 'Guar', variety: 'GG-4', price: '₹5,800', change: '-0.8%', trend: 'down', location: 'Bikaner APMC', state: 'Rajasthan' },

  // Uttar Pradesh
  { crop: 'Wheat', variety: 'UP-2338', price: '₹2,200', change: '+1.2%', trend: 'up', location: 'Agra APMC', state: 'Uttar Pradesh' },
  { crop: 'Sugarcane', variety: 'CO-0238', price: '₹3,150', change: '0%', trend: 'stable', location: 'Lucknow APMC', state: 'Uttar Pradesh' },
  { crop: 'Potato', variety: 'Kufri Jyoti', price: '₹1,100', change: '-8.5%', trend: 'down', location: 'Kanpur APMC', state: 'Uttar Pradesh' },

  // Bihar
  { crop: 'Rice', variety: 'Swarna', price: '₹2,400', change: '+0.5%', trend: 'up', location: 'Patna APMC', state: 'Bihar' },
  { crop: 'Maize', variety: 'Local', price: '₹1,850', change: '-2.0%', trend: 'down', location: 'Muzaffarpur APMC', state: 'Bihar' },
  { crop: 'Litchi', variety: 'Shahi', price: '₹6,500', change: '+5.0%', trend: 'up', location: 'Muzaffarpur APMC', state: 'Bihar' },

  // West Bengal
  { crop: 'Rice', variety: 'Gobindobhog', price: '₹3,800', change: '+2.0%', trend: 'up', location: 'Burdwan APMC', state: 'West Bengal' },
  { crop: 'Jute', variety: 'TD-5', price: '₹4,500', change: '+1.5%', trend: 'up', location: 'Kolkata APMC', state: 'West Bengal' },
  { crop: 'Potato', variety: 'Jyoti', price: '₹900', change: '-10.0%', trend: 'down', location: 'Hooghly APMC', state: 'West Bengal' },

  // Odisha
  { crop: 'Rice', variety: 'Lalat', price: '₹2,350', change: '+1.0%', trend: 'up', location: 'Cuttack APMC', state: 'Odisha' },
  { crop: 'Turmeric', variety: 'Lakadong', price: '₹13,200', change: '+4.0%', trend: 'up', location: 'Kandhamal APMC', state: 'Odisha' },

  // Assam
  { crop: 'Tea', variety: 'CTC', price: '₹22,000', change: '+1.8%', trend: 'up', location: 'Guwahati Auction', state: 'Assam' },
  { crop: 'Rice', variety: 'Joha', price: '₹4,200', change: '+3.0%', trend: 'up', location: 'Nagaon APMC', state: 'Assam' },

  // Kerala
  { crop: 'Coconut', variety: 'West Coast Tall', price: '₹8,500', change: '+2.5%', trend: 'up', location: 'Kochi APMC', state: 'Kerala' },
  { crop: 'Pepper', variety: 'Malabar Black', price: '₹42,000', change: '-3.0%', trend: 'down', location: 'Kottayam', state: 'Kerala' },
  { crop: 'Rubber', variety: 'RSS-4', price: '₹16,800', change: '+1.0%', trend: 'up', location: 'Kottayam APMC', state: 'Kerala' },

  // Jharkhand
  { crop: 'Rice', variety: 'Local', price: '₹2,100', change: '+0.3%', trend: 'stable', location: 'Ranchi APMC', state: 'Jharkhand' },
  { crop: 'Maize', variety: 'Hybrid', price: '₹1,900', change: '-1.5%', trend: 'down', location: 'Dumka APMC', state: 'Jharkhand' },

  // Chhattisgarh
  { crop: 'Rice', variety: 'Dubraj', price: '₹3,500', change: '+2.2%', trend: 'up', location: 'Raipur APMC', state: 'Chhattisgarh' },
  { crop: 'Soybean', variety: 'JS-335', price: '₹4,600', change: '-0.5%', trend: 'down', location: 'Bilaspur APMC', state: 'Chhattisgarh' },

  // Uttarakhand
  { crop: 'Basmati', variety: 'Dehradun', price: '₹4,800', change: '+5.0%', trend: 'up', location: 'Dehradun APMC', state: 'Uttarakhand' },
  { crop: 'Apple', variety: 'Red Delicious', price: '₹7,000', change: '+3.5%', trend: 'up', location: 'Almora', state: 'Uttarakhand' },

  // Himachal Pradesh
  { crop: 'Apple', variety: 'Royal Gala', price: '₹8,500', change: '+4.2%', trend: 'up', location: 'Shimla APMC', state: 'Himachal Pradesh' },
  { crop: 'Potato', variety: 'Kufri Chandramukhi', price: '₹1,400', change: '-2.0%', trend: 'down', location: 'Kullu APMC', state: 'Himachal Pradesh' },

  // Jammu & Kashmir
  { crop: 'Apple', variety: 'Kashmiri', price: '₹9,200', change: '+6.0%', trend: 'up', location: 'Sopore APMC', state: 'Jammu & Kashmir' },
  { crop: 'Saffron', variety: 'Lacha', price: '₹2,50,000', change: '+0.5%', trend: 'stable', location: 'Pampore', state: 'Jammu & Kashmir' },
  { crop: 'Walnut', variety: 'Kagzi', price: '₹12,000', change: '+2.0%', trend: 'up', location: 'Srinagar APMC', state: 'Jammu & Kashmir' },

  // Goa
  { crop: 'Cashew', variety: 'W240', price: '₹14,000', change: '+1.5%', trend: 'up', location: 'Mapusa', state: 'Goa' },
  { crop: 'Coconut', variety: 'Goa Tall', price: '₹8,000', change: '0%', trend: 'stable', location: 'Panaji APMC', state: 'Goa' },
];

export const getMarketPrices = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: mockPrices
    });
  } catch (error) {
    console.error('Error fetching market prices:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
