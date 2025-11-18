const jwt = require('jsonwebtoken');
const User = require('../models/User');

const buildUserContext = async (decoded) => {
  let shop = decoded.shop || null;
  if (!shop && decoded.role === 'admin') {
    try {
      const dbUser = await User.findById(decoded.id).select('shop');
      if (dbUser && dbUser.shop) {
        shop = dbUser.shop.toString();
      }
    } catch (err) {
      console.error('Error fetching user shop for token context:', err.message);
    }
  }
  return {
    id: decoded.id,
    role: decoded.role,
    email: decoded.email,
    shop
  };
};

exports.protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'changeme';
    if (!secret || typeof secret !== 'string') {
      console.error('JWT_SECRET is invalid');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    const decoded = jwt.verify(token, secret);
    req.user = await buildUserContext(decoded);
    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

exports.requireRole = (role) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  if (req.user.role !== role) return res.status(403).json({ message: 'Insufficient permissions' });
  next();
};

// Optional auth - sets req.user if token is valid, but doesn't require it
exports.optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // No token provided, continue without user
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'changeme';
    if (!secret || typeof secret !== 'string') {
      console.error('JWT_SECRET is invalid in optionalAuth');
      req.user = null;
      return next();
    }
    const decoded = jwt.verify(token, secret);
    req.user = await buildUserContext(decoded);
  } catch (err) {
    // Invalid token, but continue without user (for walk-in customers)
    req.user = null;
  }
  next();
};