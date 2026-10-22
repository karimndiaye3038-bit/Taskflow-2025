// Crée le premier compte ADMIN :  npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

(async () => {
  await connectDB();
  const email = (process.env.ADMIN_EMAIL || 'admin@taskflow.com').toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('ℹ️  Admin déjà existant :', email);
  } else {
    await User.create({
      name: process.env.ADMIN_NAME || 'Super Admin',
      email,
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin123', 10),
      role: 'ADMIN',
    });
    console.log('✅ Admin créé :', email);
  }
  await mongoose.disconnect();
})();
