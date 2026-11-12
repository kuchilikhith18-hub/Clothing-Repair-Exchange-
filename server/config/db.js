const mongoose = require('mongoose');
const dns = require('dns');

// Use reliable public DNS resolvers to prevent querySrv ECONNREFUSED on local/ISP DNS
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (dnsErr) {
  console.warn('DNS server override warning:', dnsErr.message);
}

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      process.env.MONGODB_URL ||
      'mongodb://localhost:27017/clothing-repair-exchange';

    const conn = await mongoose.connect(mongoUri, {
      dbName: 'clothing-repair-exchange',
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
