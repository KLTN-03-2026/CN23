import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import VerificationCode from '@/lib/models/VerificationCode';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: 'Vui lòng nhập đầy đủ thông tin' }, { status: 400 });
    }

    const verification = await VerificationCode.findOne({ email, code });
    if (!verification) {
      return NextResponse.json({ error: 'Mã xác nhận không đúng' }, { status: 400 });
    }

    if (verification.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Mã xác nhận đã hết hạn' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'Người dùng không tồn tại' }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Delete the verification code after successful reset
    await VerificationCode.deleteMany({ email });

    return NextResponse.json({ message: 'Mật khẩu đã được đặt lại thành công' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
