const express = require('express');
const router = express.Router();

const {
  createToken,
  getAllTokens,
  getTodayQueue,
  updateTokenStatus,
  deleteToken
} = require('../controllers/tokenController');

const { protect, requireRole, optionalAuth } = require('../middleware/auth');

// Issue new token - allow unauthenticated (walk-ins) or authenticated customers
router.post('/tokens', optionalAuth, createToken);

// View all tokens - admin only
router.get('/tokens', protect, requireRole('admin'), getAllTokens);

// View today's active queue (for display screen) - public
router.get('/queue', getTodayQueue);

// Update status / service bay - admin only
router.patch('/tokens/:id/status', protect, requireRole('admin'), updateTokenStatus);

// Delete / cancel token - admin only
router.delete('/tokens/:id', protect, requireRole('admin'), deleteToken);

module.exports = router;
