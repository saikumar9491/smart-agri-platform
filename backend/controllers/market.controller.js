// Expanded mock data representing live market prices across India
const mockPrices = [
  // Maharashtra
  { crop: 'Wheat', variety: 'Lokwan', price: '₹2,100', change: '+2.5%', trend: 'up', location: 'Nashik APMC', state: 'Maharashtra' },
  { crop: 'Onion', variety: 'Red', price: '₹1,500', change: '-5.2%', trend: 'down', location: 'Lasalgaon', state: 'Maharashtra' },
  { crop: 'Soybean', variety: 'Yellow', price: '₹4,800', change: '0%', trend: 'stable', location: 'Latur APMC', state: 'Maharashtra' },
  { crop: 'Cotton', variety: 'Long Staple', price: '₹7,200', change: '+1.8%', trend: 'up', location: 'Jalgaon', state: 'Maharashtra' },
  { crop: 'Grapes', variety: 'Thompson Seedless', price: '₹4,500', change: '+8.4%', trend: 'up', location: 'Nashik APMC', state: 'Maharashtra' },
  { crop: 'Tomato', variety: 'Hybrid', price: '₹800', change: '-12.0%', trend: 'down', location: 'Pune APMC', state: 'Maharashtra' },
  
  // Punjab & Haryana
  { crop: 'Wheat', variety: 'Sharbati', price: '₹2,300', change: '+1.5%', trend: 'up', location: 'Karnal APMC', state: 'Haryana' },
  { crop: 'Rice', variety: 'Basmati', price: '₹3,500', change: '+4.2%', trend: 'up', location: 'Ludhiana APMC', state: 'Punjab' },
  { crop: 'Mustard', variety: 'Black', price: '₹5,100', change: '-1.0%', trend: 'down', location: 'Hisar APMC', state: 'Haryana' },
  
  // Gujarat
  { crop: 'Groundnut', variety: 'Bold', price: '₹5,500', change: '+3.0%', trend: 'up', location: 'Rajkot APMC', state: 'Gujarat' },
  { crop: 'Cotton', variety: 'Shankar-6', price: '₹7,400', change: '+2.1%', trend: 'up', location: 'Ahmedabad APMC', state: 'Gujarat' },
  { crop: 'Cumin', variety: 'Jeera', price: '₹28,000', change: '-2.5%', trend: 'down', location: 'Unjha APMC', state: 'Gujarat' },
  
  // Madhya Pradesh
  { crop: 'Soybean', variety: 'Yellow', price: '₹4,700', change: '-0.5%', trend: 'down', location: 'Indore APMC', state: 'Madhya Pradesh' },
  { crop: 'Wheat', variety: 'Sharbati', price: '₹2,450', change: '+5.0%', trend: 'up', location: 'Sehore APMC', state: 'Madhya Pradesh' },
  { crop: 'Garlic', variety: 'White', price: '₹8,000', change: '+10.0%', trend: 'up', location: 'Mandsaur APMC', state: 'Madhya Pradesh' },

  // South India (Karnataka, Tamil Nadu, Andhra)
  { crop: 'Coffee', variety: 'Arabica', price: '₹14,500', change: '+1.2%', trend: 'up', location: 'Chikkamagaluru', state: 'Karnataka' },
  { crop: 'Tomato', variety: 'Local', price: '₹950', change: '-5.0%', trend: 'down', location: 'Kolar APMC', state: 'Karnataka' },
  { crop: 'Chilli', variety: 'Guntur Sannam', price: '₹18,000', change: '+2.0%', trend: 'up', location: 'Guntur APMC', state: 'Andhra Pradesh' },
  { crop: 'Turmeric', variety: 'Salem', price: '₹12,500', change: '+0.5%', trend: 'stable', location: 'Erode APMC', state: 'Tamil Nadu' }
];

export const getMarketPrices = (req, res) => {
  try {
    // In a real application, this would fetch from a database or an external API
    res.status(200).json({
      success: true,
      data: mockPrices
    });
  } catch (error) {
    console.error('Error fetching market prices:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
