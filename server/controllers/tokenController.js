const Token = require('../models/Token');

// POST /api/tokens
exports.createToken = async (req, res) => {
  try {
    const { customerName, vehicleNumber } = req.body;

    // Count active tokens (for dynamic numbering)
    const activeTokens = await Token.find({
      status: { $in: ["WAITING", "IN_SERVICE"] }
    }).sort({ createdAt: 1 });

    const nextTokenNumber = activeTokens.length + 1;

    const token = new Token({
      tokenNumber: nextTokenNumber, // temporary; queue recalculates later
      customerName: customerName || (req.user && req.user.email) || 'Guest',
      vehicleNumber,
      createdBy: req.user ? req.user.id : null
    });

    await token.save();
    res.status(201).json(token);
  } catch (err) {
    console.error("Error creating token:", err);
    res.status(500).json({ message: "Server error creating token" });
  }
};


// GET /api/tokens (all tokens, optionally filtered)
exports.getAllTokens = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) filter.status = status;

    const tokens = await Token.find(filter).sort({ createdAt: 1 });
    res.json(tokens);
  } catch (err) {
    console.error("Error fetching tokens:", err);
    res.status(500).json({ message: "Server error fetching tokens" });
  }
};


// GET /api/queue  → backlog + today's tokens
exports.getTodayQueue = async (req, res) => {
  try {
    // 1. Get all active tokens regardless of date
    const activeTokens = await Token.find({
      status: { $in: ["WAITING", "IN_SERVICE"] }
    }).sort({ createdAt: 1 });

    // 2. Assign new dynamic token numbers
    const queueWithNumbers = activeTokens.map((token, index) => {
      return {
        ...token.toObject(),
        tokenNumber: index + 1
      };
    });

    res.json(queueWithNumbers);
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

    const token = await Token.findById(id);
    if (!token) return res.status(404).json({ message: 'Token not found' });

    if (status) {
      token.status = status;

      if (status === 'IN_SERVICE' && !token.startedAt)
        token.startedAt = new Date();
      if (status === 'COMPLETED' && !token.completedAt)
        token.completedAt = new Date();
    }

    if (serviceBay !== undefined) token.serviceBay = serviceBay;

    await token.save();
    res.json(token);
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
