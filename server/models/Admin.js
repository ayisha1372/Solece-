import mongoose from 'mongoose';
export default mongoose.model('Admin', new mongoose.Schema({
  username: { type: String, unique: true }, email: { type: String, unique: true },
  passwordHash: String, createdAt: { type: Date, default: Date.now },
}));
