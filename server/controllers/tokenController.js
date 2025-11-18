const Token = require('../models/Token');
const Shop = require('../models/Shop');

const getTodayString = () => {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
};

// POST /api/tokens
exports.createToken = async (req, res) => {
  try {
    const { customerName, vehicleNumber, shopId } = req.body;

    if (!shopId) {
      return res.status(400).json({ message: 'Shop ID is required' });
    }

    // Verify shop exists
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    const today = getTodayString();
    const maxAttempts = 5;
    let attempt = 0;

    while (attempt < maxAttempts) {
      attempt += 1;
      try {
        // Get last token for this shop today to increment
        const lastToken = await Token.findOne({ shop: shopId, date: today })
          .sort({ tokenNumber: -1 })
          .lean();

        const nextTokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1;

        const token = new Token({
          date: today,
          tokenNumber: nextTokenNumber,
          shop: shopId,
          customerName: customerName || (req.user && req.user.email) || 'Guest',
          vehicleNumber,
          createdBy: req.user ? req.user.id : null
        });

        await token.save();
        const populatedToken = await Token.findById(token._id).populate('shop', 'name address');
        return res.status(201).json(populatedToken);
      } catch (err) {
        if (err && err.code === 11000 && attempt < maxAttempts) {
          // Another request created the same token number concurrently – retry
          continue;
        }
        throw err;
      }
    }

    return res.status(500).json({ message: 'Failed to create unique token after multiple attempts' });
  } catch (err) {
    console.error("Error creating token:", err);
    res.status(500).json({ message: "Server error creating token" });
  }
};


// GET /api/tokens (all tokens for admin's shop, optionally filtered)
exports.getAllTokens = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    // Admin can only see tokens for their shop
    if (req.user && req.user.role === 'admin' && req.user.shop) {
      filter.shop = req.user.shop;
    } else if (req.user && req.user.role === 'admin') {
      return res.status(403).json({ message: 'Admin user does not have a shop assigned' });
    } else {
      return res.status(403).json({ message: 'Only admins can view all tokens' });
    }

    if (status) filter.status = status;

    const tokens = await Token.find(filter)
      .populate('shop', 'name address')
      .populate('createdBy', 'name email')
      .sort({ createdAt: 1 });
    res.json(tokens);
  } catch (err) {
    console.error("Error fetching tokens:", err);
    res.status(500).json({ message: "Server error fetching tokens" });
  }
};


// GET /api/queue?shopId=xxx  → today's active queue for a specific shop
exports.getTodayQueue = async (req, res) => {
  try {
    const { shopId } = req.query;
    
    if (!shopId) {
      return res.status(400).json({ message: 'Shop ID is required' });
    }

    const today = getTodayString();

    const tokens = await Token.find({
      shop: shopId,
      date: today,
      status: { $in: ['WAITING', 'IN_SERVICE'] }
    })
      .populate('shop', 'name address')
      .sort({ tokenNumber: 1 });

    res.json(tokens);
  } catch (err) {
    console.error("Error fetching queue:", err);
    res.status(500).json({ message: "Server error fetching queue" });
  }
};


// PATCH /api/tokens/:id/status
exports.updateTokenStatus = async (req, res) => {
  try {
    const { status, serviceBay } = req.body;
    const { id } = req.params;

    const token = await Token.findById(id).populate('shop');
    if (!token) return res.status(404).json({ message: 'Token not found' });

    // Admin can only update tokens for their shop
    if (req.user && req.user.role === 'admin') {
      if (!req.user.shop || token.shop._id.toString() !== req.user.shop.toString()) {
        return res.status(403).json({ message: 'You can only update tokens for your own shop' });
      }
    }

    if (status) {
      token.status = status;

      if (status === 'IN_SERVICE' && !token.startedAt)
        token.startedAt = new Date();
      if (status === 'COMPLETED' && !token.completedAt)
        token.completedAt = new Date();
    }

    if (serviceBay !== undefined) token.serviceBay = serviceBay;

    await token.save();
    const updatedToken = await Token.findById(token._id).populate('shop', 'name address');
    res.json(updatedToken);
  } catch (err) {
    console.error("Error updating token status:", err);
    res.status(500).json({ message: "Server error updating token" });
  }
};


// DELETE /api/tokens/:id
exports.deleteToken = async (req, res) => {
  try {
    const token = await Token.findByIdAndDelete(req.params.id);
    if (!token) return res.status(404).json({ message: 'Token not found' });

    res.json({ message: 'Token deleted successfully' });
  } catch (err) {
    console.error("Error deleting token:", err);
    res.status(500).json({ message: "Server error deleting token" });
  }
};
