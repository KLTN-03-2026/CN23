import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import VerificationCode from '@/lib/models/VerificationCode';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Vui lòng nhập email' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'Email không tồn tại trong hệ thống' }, { status: 404 });
    }

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Delete existing codes for this email
    await VerificationCode.deleteMany({ email });

    // Save new code
    await VerificationCode.create({ email, code, expiresAt });

    // In a real application, you would send an email using nodemailer here.
    // For this demo, we will just log it and return it in the response (or pretend to send it).
    console.log(`[DEMO] Verification code for ${email} is: ${code}`);

    return NextResponse.json({ message: 'Mã xác nhận đã được gửi đến email của bạn', demoCode: code });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
