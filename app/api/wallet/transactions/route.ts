import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WalletTransaction from '@/lib/models/WalletTransaction';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    await dbConnect();
    const transactions = await WalletTransaction.find({ userId: decoded.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('performedBy', 'name');

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Wallet transactions error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
