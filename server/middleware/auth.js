const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
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
    req.user = { id: decoded.id, role: decoded.role, email: decoded.email };
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
exports.optionalAuth = (req, res, next) => {
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
    req.user = { id: decoded.id, role: decoded.role, email: decoded.email };
  } catch (err) {
    // Invalid token, but continue without user (for walk-in customers)
    req.user = null;
  }
  next();
};