import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const { action } = body; // 'success', 'fail', 'refund'

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (action === 'success') {
      order.status = 'success';
      await order.save();

      // Update user role and points
      const user = await User.findById(order.userId);
      if (user) {
        user.points = (user.points || 0) + order.pointsEarned;
        
        // Update membership expiration
        const now = new Date();
        const currentExp = user.membershipExpireDate ? new Date(user.membershipExpireDate) : now;
        const newExp = new Date(Math.max(now.getTime(), currentExp.getTime()));
        newExp.setMonth(newExp.getMonth() + order.durationMonths);
        
        user.membershipExpireDate = newExp;
        user.membershipType = order.packageName;
        await user.save();
      }
    } else if (action === 'fail') {
      order.status = 'failed';
      await order.save();
    } else if (action === 'refund') {
      order.status = 'refunded';
      await order.save();
    }

    return NextResponse.json({ success: true, order }, { status: 200 });
  } catch (error: any) {
    console.error('Order update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
