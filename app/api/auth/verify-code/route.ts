import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import VerificationCode from '@/lib/models/VerificationCode';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Vui lòng nhập email và mã xác nhận' }, { status: 400 });
    }

    const verification = await VerificationCode.findOne({ email, code });
    if (!verification) {
      return NextResponse.json({ error: 'Mã xác nhận không đúng' }, { status: 400 });
    }

    if (verification.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Mã xác nhận đã hết hạn' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Mã xác nhận hợp lệ' });
  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
