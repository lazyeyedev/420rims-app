require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('../models/User');

const ADMIN_EMAIL    = 'admin@420rims.com';
const ADMIN_PASSWORD = 'Admin@420Rims2026';
const ADMIN_NAME     = '420Rims Admin';

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log('Admin user already exists — skipping.');
      process.exit(0);
    }

    await User.create({
      name:     ADMIN_NAME,
      email:    ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role:     'admin',
    });

    console.log('Admin user created successfully.');
    console.log(`  Email:    ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log('  Change the password immediately after first login.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
