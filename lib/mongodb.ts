import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '@/lib/models/User';

let MONGODB_URI = process.env.MONGODB_URI || '';

// Tự động sửa lỗi nếu mật khẩu chứa ký tự đặc biệt (như @) chưa được mã hóa
const match = MONGODB_URI.match(/^(mongodb(?:\+srv)?:\/\/[^:]+:)(.*)(@[^@]+)$/);
if (match) {
  try {
    const decodedPassword = decodeURIComponent(match[2]);
    const encodedPassword = encodeURIComponent(decodedPassword);
    MONGODB_URI = match[1] + encodedPassword + match[3];
  } catch (e) {
    console.error('Error parsing MongoDB URI');
  }
}

if (!MONGODB_URI || !MONGODB_URI.startsWith('mongodb')) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env with a valid mongodb:// or mongodb+srv:// scheme');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function seedAdmin() {
  try {
    const adminExists = await User.findOne({ email: 'admin@gmail.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await User.create({
        name: 'admin',
        email: 'admin@gmail.com',
        phone: '0123456789',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin account seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding admin account:', error);
  }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
    // Seed admin after successful connection
    await seedAdmin();
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
