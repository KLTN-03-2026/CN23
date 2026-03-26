import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'Vui lòng nhập đầy đủ thông tin' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email đã được sử dụng' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = email === 'admin@gmail.com' || name.toLowerCase() === 'admin' ? 'admin' : 'user';

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
    });

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    const response = NextResponse.json({ 
      message: 'Đăng ký thành công', 
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
    console.error('Register error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });
    return NextResponse.json({ 
      error: 'Lỗi máy chủ', 
      details: error.message 
    }, { status: 500 });
  }
}
