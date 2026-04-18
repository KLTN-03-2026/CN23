// Script to seed admin account
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || '';

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const UserSchema = new mongoose.Schema({
      name: String,
      email: { type: String, unique: true },
      phone: String,
      password: String,
      role: String,
      points: { type: Number, default: 0 },
      totalHoursPlayed: { type: Number, default: 0 },
      membershipType: { type: String, default: 'Thành viên Tiêu chuẩn' },
      membershipExpireDate: Date,
      walletBalance: { type: Number, default: 0 },
      rank: { type: String, default: 'Bronze' },
    }, { timestamps: true });

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Delete old admin if exists
    await User.deleteMany({ name: 'admin' });
    
    const hashedPassword = await bcrypt.hash('123456', 10);
    const admin = await User.create({
      name: 'admin',
      email: 'admin@luxebida.com',
      phone: '0123456789',
      password: hashedPassword,
      role: 'admin',
      walletBalance: 0,
      rank: 'Bronze',
    });

    console.log('Admin account created:', admin.email);
    
    // Also create a test customer if none exists
    const existingCustomer = await User.findOne({ role: 'user' });
    if (!existingCustomer) {
      const customerPassword = await bcrypt.hash('123456', 10);
      const customer = await User.create({
        name: 'Nguyễn Văn A',
        email: 'khach@test.com',
        phone: '0987654321',
        password: customerPassword,
        role: 'user',
        walletBalance: 0,
        rank: 'Bronze',
        points: 0,
      });
      console.log('Test customer created:', customer.email);
    } else {
      console.log('Test customer already exists:', existingCustomer.email);
    }

    await mongoose.disconnect();
    console.log('Done!');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seedAdmin();
