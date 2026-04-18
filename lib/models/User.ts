import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  points: { type: Number, default: 0 },
  totalHoursPlayed: { type: Number, default: 0 },
  membershipType: { type: String, default: 'Thành viên Tiêu chuẩn' },
  membershipExpireDate: { type: Date },
  walletBalance: { type: Number, default: 0 },
  rank: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Diamond'], default: 'Bronze' },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
