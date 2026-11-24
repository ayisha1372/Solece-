
import 'dotenv/config';
import dns from 'node:dns';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';

// Fix Windows DNS resolution for MongoDB Atlas
dns.setServers(['8.8.8.8']);

const {
  ADMIN_USERNAME: u,
  ADMIN_EMAIL: e,
  ADMIN_PASSWORD: p
} = process.env;

if (!u || !e || !p || p.length < 10) {
  console.error('Set ADMIN_USERNAME, ADMIN_EMAIL and a 10+ char ADMIN_PASSWORD in .env');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGO_URI);

  await Admin.findOneAndUpdate(
    { username: u },
    {
      username: u,
      email: e.toLowerCase(),
      passwordHash: await bcrypt.hash(p, 12)
    },
    { upsert: true }
  );

  console.log('Admin ready:', u);
} catch (error) {
  console.error('Admin seed failed:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
