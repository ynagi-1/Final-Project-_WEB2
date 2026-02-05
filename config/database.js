const mongoose = require('mongoose');

// Disable strict query deprecation warnings where appropriate
if (typeof mongoose.set === 'function') {
  mongoose.set('strictQuery', false);
}

const maskUri = (uri) => {
  try {
    return uri.replace(/:\/\/(.*@)/, '://***@');
  } catch (e) {
    return uri;
  }
};

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set. Please add it to your .env file.');
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  const options = {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    maxPoolSize: 10,
    family: 4
  };

  try {
    console.log('Connecting to MongoDB with URI:', maskUri(uri));
    const conn = await mongoose.connect(uri, options);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log('Mongoose connection options:', options);

    await createIndexes();
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    console.error(error);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const User = require('../models/User');
    const Lot = require('../models/Lot');
    const Category = require('../models/Category');

    await User.createIndexes();
    await Lot.createIndexes();
    await Category.createIndexes();
    
    console.log('Database indexes created');
  } catch (error) {
    console.error('Error creating indexes:', error.message);
  }
};

module.exports = connectDB;