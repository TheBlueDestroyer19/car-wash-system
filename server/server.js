const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const tokenRoutes = require('./routes/tokenRoutes');
const authRoutes = require('./routes/authRoutes');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
connectDB();

// Simple health check
app.get('/', (req, res) => {
  res.send('Car Wash Token & Queue API is running');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', tokenRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
