const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Shop = require('../models/Shop');

const signToken = (user) => {
  const secret = process.env.JWT_SECRET || 'changeme';
  if (!secret || typeof secret !== 'string') {
    throw new Error('JWT_SECRET is not properly configured');
  }
  const shopId = user.shop ? (user.shop._id ? user.shop._id : user.shop) : null;
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email, shop: shopId },
    secret,
    { expiresIn: '7d' }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, adminSecret, shopName, shopAddress } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    // If someone requests admin role, require ADMIN_SECRET and shop details
    if (role === 'admin') {
      if (!process.env.ADMIN_SECRET || adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ message: 'Invalid admin secret' });
      }
      if (!shopName || !shopAddress) {
        return res.status(400).json({ message: 'Shop name and address are required for admin registration' });
      }
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashed, role: role || 'customer' });
    
    // If admin, create shop and link to user
    if (role === 'admin') {
      const shop = new Shop({
        name: shopName,
        address: shopAddress,
        manager: user._id
      });
      await shop.save();
      user.shop = shop._id;
    }
    
    await user.save();

    const token = signToken(user);
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      shop: user.shop
    };
    
    res.status(201).json({ token, user: userResponse });
  } catch (err) {
    console.error('Auth register error:', err);
    res.status(500).json({ message: 'Server error registering user' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email }).populate('shop');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      shop: user.shop ? user.shop._id : null
    };
    res.json({ token, user: userResponse });
  } catch (err) {
    console.error('Auth login error:', err);
    res.status(500).json({ message: 'Server error logging in' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('shop');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Auth me error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
