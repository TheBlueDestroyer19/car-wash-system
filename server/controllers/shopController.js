const Shop = require('../models/Shop');
const Token = require('../models/Token');

// GET /api/shops - Get all shops with waiting count
exports.getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find().populate('manager', 'name email');
    
    // Get waiting count for each shop
    const today = new Date().toISOString().slice(0, 10);
    const shopsWithCount = await Promise.all(
      shops.map(async (shop) => {
        const waitingCount = await Token.countDocuments({
          shop: shop._id,
          date: today,
          status: { $in: ['WAITING', 'IN_SERVICE'] }
        });
        const activeToken = await Token.findOne({
          shop: shop._id,
          date: today,
          status: 'IN_SERVICE'
        })
          .sort({ startedAt: 1, tokenNumber: 1 })
          .select('tokenNumber')
          .lean();
        return {
          _id: shop._id,
          name: shop.name,
          address: shop.address,
          manager: shop.manager,
          waitingCount,
          currentInServiceToken: activeToken ? activeToken.tokenNumber : null,
          createdAt: shop.createdAt
        };
      })
    );

    res.json(shopsWithCount);
  } catch (err) {
    console.error('Error fetching shops:', err);
    res.status(500).json({ message: 'Server error fetching shops' });
  }
};

// GET /api/shops/:id - Get single shop
exports.getShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('manager', 'name email');
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    res.json(shop);
  } catch (err) {
    console.error('Error fetching shop:', err);
    res.status(500).json({ message: 'Server error fetching shop' });
  }
};

