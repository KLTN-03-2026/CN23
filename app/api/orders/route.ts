import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { userId, customerName, packageName, durationMonths, amount, paymentMethod } = body;

    if (!userId || !customerName || !packageName || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create a pending order
    const order = await Order.create({
      userId,
      customerName,
      packageName,
      durationMonths,
      amount,
      paymentMethod,
      status: 'pending',
      pointsEarned: Math.floor(amount / 10000), // 1 point per 10,000 VND
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let query = {};
    if (userId) {
      query = { userId };
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error: any) {
    console.error('Order fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
