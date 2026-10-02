const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bachelor-kitchen';

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
    return true;
  } catch (error) {
    console.warn('MongoDB connection failed; continuing in demo mode:', error.message);
    return false;
  }
};

module.exports = connectDB;
