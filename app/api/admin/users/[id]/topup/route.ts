import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import WalletTransaction from '@/lib/models/WalletTransaction';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Chỉ admin mới có quyền nạp tiền' }, { status: 403 });
    }

    const { id } = await params;
    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Số tiền nạp phải lớn hơn 0' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    const balanceBefore = user.walletBalance || 0;
    const balanceAfter = balanceBefore + amount;

    // Update user wallet balance
    user.walletBalance = balanceAfter;
    await user.save();

    // Create wallet transaction record
    await WalletTransaction.create({
      userId: user._id,
      type: 'topup',
      amount,
      balanceBefore,
      balanceAfter,
      description: `Admin nạp ${amount.toLocaleString('vi-VN')}đ vào ví`,
      performedBy: decoded.id,
    });

    return NextResponse.json({
      success: true,
      message: `Đã nạp ${amount.toLocaleString('vi-VN')}đ cho ${user.name}`,
      walletBalance: balanceAfter,
    });
  } catch (error) {
    console.error('Topup error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
