const express = require('express');
const router = express.Router();
const { getAllShops, getShop } = require('../controllers/shopController');

// Get all shops - public
router.get('/', getAllShops);

// Get single shop - public
router.get('/:id', getShop);

module.exports = router;

