const Token = require('../models/Token');

// GET /api/orders - Get all orders (tokens) for the logged-in user
exports.getUserOrders = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const tokens = await Token.find({ createdBy: req.user.id })
      .populate('shop', 'name address')
      .sort({ createdAt: -1 }); // Most recent first

    res.json(tokens);
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

