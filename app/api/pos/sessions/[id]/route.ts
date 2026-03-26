import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Session from '@/lib/models/Session';
import Table from '@/lib/models/Table';
import Transaction from '@/lib/models/Transaction';
import User from '@/lib/models/User';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const updatedSession = await Session.findByIdAndUpdate(id, body, { new: true });
    
    if (!updatedSession) {
      return NextResponse.json({ message: 'Session not found' }, { status: 404 });
    }

    // If checking out, update table status and create transaction
    if (body.status === 'completed') {
      const table = await Table.findByIdAndUpdate(updatedSession.tableId, { status: 'empty' });
      
      // Create transaction record
      if (table && body.totalAmount !== undefined) {
        const items = [];
        
        // Add table time item
        if (body.tableTimeAmount) {
          items.push({
            name: `Giờ chơi - ${table.name}`,
            price: body.tableTimeAmount,
            quantity: 1,
            type: 'table_time'
          });
        }
        
        // Add food/service items
        if (updatedSession.orders && updatedSession.orders.length > 0) {
          updatedSession.orders.forEach((order: any) => {
            items.push({
              name: order.name,
              price: order.price,
              quantity: order.quantity,
              type: 'food'
            });
          });
        }
        
        await Transaction.create({
          sessionId: updatedSession._id,
          tableId: table._id,
          tableName: table.name,
          customerName: body.customerName || 'Khách lẻ',
          customerId: body.customerId || null,
          totalAmount: body.totalAmount,
          paymentMethod: body.paymentMethod || 'cash',
          status: 'success',
          items: items
        });

        // Update user points and hours if customerId is provided
        if (body.customerId) {
          const pointsEarned = Math.floor(body.totalAmount / 10000); // 1 point per 10,000 VND
          const hoursPlayed = body.durationInHours ? Number(body.durationInHours.toFixed(1)) : 0;
          
          await User.findByIdAndUpdate(body.customerId, {
            $inc: { 
              points: pointsEarned,
              totalHoursPlayed: hoursPlayed
            }
          });
        }
      }
    }

    return NextResponse.json({ session: updatedSession }, { status: 200 });
  } catch (error) {
    console.error('Failed to update session:', error);
    return NextResponse.json({ message: 'Failed to update session', error }, { status: 500 });
  }
}
