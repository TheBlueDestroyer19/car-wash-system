const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Register (for customers) - to create admin pass `role=admin` and `adminSecret` matching ADMIN_SECRET
router.post('/register', register);

// Login
router.post('/login', login);

// Get current user
router.get('/me', protect, me);

module.exports = router;
