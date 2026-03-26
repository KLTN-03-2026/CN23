import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Vui lòng nhập email/tên đăng nhập và mật khẩu' }, { status: 400 });
    }

    // Auto-create admin user for testing purposes if it doesn't exist
    if (email === 'admin' && password === '123456') {
      let adminUser = await User.findOne({ email: 'admin@luxebida.com' });
      if (!adminUser) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);
        try {
          adminUser = await User.create({
            name: 'admin',
            email: 'admin@luxebida.com',
            phone: '0000000000',
            password: hashedPassword,
            role: 'admin'
          });
        } catch (err: any) {
          // Ignore duplicate key error if it happens concurrently
          if (err.code !== 11000) throw err;
          adminUser = await User.findOne({ email: 'admin@luxebida.com' });
        }
      }
    }

    // Check if the input is an email or a username (name)
    const user = await User.findOne({ 
      $or: [
        { email: email },
        { name: email }
      ]
    });
    
    if (!user) {
      return NextResponse.json({ error: 'Tài khoản hoặc mật khẩu không đúng' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Tài khoản hoặc mật khẩu không đúng' }, { status: 401 });
    }

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    const response = NextResponse.json({ 
      message: 'Đăng nhập thành công', 
      user: { 
        id: user._id,
        name: user.name, 
        email: user.email, 
        role: user.role,
        phone: user.phone,
        points: user.points,
        membershipType: user.membershipType,
        membershipExpireDate: user.membershipExpireDate
      } 
    });
    response.cookies.set('token', token, { 
      httpOnly: true, 
      secure: true, 
      sameSite: 'none', 
      maxAge: 7 * 24 * 60 * 60 
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Lỗi máy chủ' }, { status: 500 });
  }
}
