const express = require('express');
const router = express.Router();
const { getUserOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// Get user's orders - requires authentication
router.get('/', protect, getUserOrders);

module.exports = router;

