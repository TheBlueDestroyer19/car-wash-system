const Token = require('../models/Token');

const getTodayString = () => {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
};

// POST /api/tokens
exports.createToken = async (req, res) => {
  try {
    const { customerName, vehicleNumber } = req.body;
    const today = getTodayString();

    // Get last token for today to increment
    const lastToken = await Token.findOne({ date: today })
      .sort({ tokenNumber: -1 })
      .lean();

    const nextTokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1;

    const token = new Token({
      date: today,
      tokenNumber: nextTokenNumber,
      customerName: customerName || (req.user && req.user.email) || 'Guest',
      vehicleNumber,
      createdBy: req.user ? req.user.id : null
    });

    await token.save();
    res.status(201).json(token);
  } catch (err) {
    console.error('Error creating token:', err);
    res.status(500).json({ message: 'Server error creating token' });
  }
};

// GET /api/tokens (optionally filter by status)
exports.getAllTokens = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    const tokens = await Token.find(filter).sort({ createdAt: 1 });
    res.json(tokens);
  } catch (err) {
    console.error('Error fetching tokens:', err);
    res.status(500).json({ message: 'Server error fetching tokens' });
  }
};

// GET /api/queue  -> today's active queue (Waiting + In Service)
exports.getTodayQueue = async (req, res) => {
  try {
    const today = getTodayString();

    const tokens = await Token.find({
      date: today,
      status: { $in: ['WAITING', 'IN_SERVICE'] }
    }).sort({ tokenNumber: 1 });

    res.json(tokens);
  } catch (err) {
    console.error('Error fetching queue:', err);
    res.status(500).json({ message: 'Server error fetching queue' });
  }
};

// PATCH /api/tokens/:id/status
exports.updateTokenStatus = async (req, res) => {
  try {
    const { status, serviceBay } = req.body;
    const { id } = req.params;

    const token = await Token.findById(id);

    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }

    if (status) {
      token.status = status;

      if (status === 'IN_SERVICE' && !token.startedAt) {
        token.startedAt = new Date();
      }

      if (status === 'COMPLETED' && !token.completedAt) {
        token.completedAt = new Date();
      }
    }

    if (serviceBay !== undefined) {
      token.serviceBay = serviceBay;
    }

    await token.save();
    res.json(token);
  } catch (err) {
    console.error('Error updating token status:', err);
    res.status(500).json({ message: 'Server error updating token' });
  }
};

// DELETE /api/tokens/:id  (hard delete)
exports.deleteToken = async (req, res) => {
  try {
    const { id } = req.params;

    const token = await Token.findByIdAndDelete(id);

    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }

    res.json({ message: 'Token deleted successfully' });
  } catch (err) {
    console.error('Error deleting token:', err);
    res.status(500).json({ message: 'Server error deleting token' });
  }
};
