const mongoose = require('mongoose');

const dropLegacyTokenIndex = async () => {
  try {
    const Token = require('../models/Token');
    if (!Token.collection) return;

    const indexes = await Token.collection.indexes();
    const legacyIndex = indexes.find((idx) => idx.name === 'date_1_tokenNumber_1');
    if (legacyIndex) {
      await Token.collection.dropIndex('date_1_tokenNumber_1');
      console.log('Dropped legacy token index date_1_tokenNumber_1');
    }
    await Token.syncIndexes();
  } catch (err) {
    if (err.codeName === 'NamespaceNotFound') {
      return;
    }
    console.error('Error ensuring token indexes:', err.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await dropLegacyTokenIndex();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
