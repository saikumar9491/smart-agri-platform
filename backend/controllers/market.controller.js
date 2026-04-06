import MarketPrice from '../models/MarketPrice.js';

export const getMarketPrices = async (req, res) => {
  try {
    const prices = await MarketPrice.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: prices
    });
  } catch (error) {
    console.error('Error fetching market prices:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const addMarketPrice = async (req, res) => {
  try {
    const { crop, variety, price, change, trend, location, state } = req.body;
    
    if (!crop || !variety || !price || !location || !state) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const newPrice = await MarketPrice.create({
      crop,
      variety,
      price,
      change: change || '0%',
      trend: trend || 'stable',
      location,
      state
    });

    res.status(201).json({
      success: true,
      data: newPrice
    });
  } catch (error) {
    console.error('Error adding market price:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteMarketPrice = async (req, res) => {
  try {
    const price = await MarketPrice.findById(req.params.id);
    
    if (!price) {
      return res.status(404).json({ success: false, message: 'Market record not found' });
    }

    await price.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Market record removed'
    });
  } catch (error) {
    console.error('Error deleting market price:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
export const updateMarketPrice = async (req, res) => {
  try {
    const price = await MarketPrice.findById(req.params.id);
    if (!price) {
      return res.status(404).json({ success: false, message: 'Market record not found' });
    }

    const { crop, variety, price: priceVal, change, trend, location, state } = req.body;
    
    price.crop = crop || price.crop;
    price.variety = variety || price.variety;
    price.price = priceVal || price.price;
    price.change = change || price.change;
    price.trend = trend || price.trend;
    price.location = location || price.location;
    price.state = state || price.state;

    await price.save();

    res.status(200).json({
      success: true,
      data: price
    });
  } catch (error) {
    console.error('Error updating market price:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
