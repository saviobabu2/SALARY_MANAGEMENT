const mongoose=require('mongoose');
require('dotenv').config();


const dbConnect = () => {
  mongoose.connect(process.env.MONGO_URL);
  const db = mongoose.connection;
  db.once('connected', () => {
      console.log('✅ MongoDB Connected');
  });
  db.on('error', (err) => {
      console.log('❌ MongoDB connection error:', err);
  });
};

module.exports = { dbConnect };