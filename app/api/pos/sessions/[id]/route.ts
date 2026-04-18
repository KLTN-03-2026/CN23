import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Session from '@/lib/models/Session';
import Table from '@/lib/models/Table';
import Transaction from '@/lib/models/Transaction';
import User from '@/lib/models/User';
import WalletTransaction from '@/lib/models/WalletTransaction';
import { getPointsFromAmount, getRankFromPoints } from '@/lib/rank';

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

        // Calculate points
        const pointsEarned = getPointsFromAmount(body.totalAmount);

        // Handle wallet payment
        if (body.paymentMethod === 'wallet' && body.customerId) {
          const customer = await User.findById(body.customerId);
          if (!customer) {
            return NextResponse.json({ message: 'Không tìm thấy khách hàng' }, { status: 404 });
          }

          const currentBalance = customer.walletBalance || 0;
          if (currentBalance < body.totalAmount) {
            // Revert table and session status
            await Table.findByIdAndUpdate(updatedSession.tableId, { status: 'playing' });
            await Session.findByIdAndUpdate(id, { status: 'active', endTime: null });
            return NextResponse.json({ 
              message: `Số dư ví không đủ. Cần ${body.totalAmount.toLocaleString()}đ, hiện có ${currentBalance.toLocaleString()}đ` 
            }, { status: 400 });
          }

          // Deduct wallet balance
          const balanceBefore = currentBalance;
          const balanceAfter = currentBalance - body.totalAmount;
          
          customer.walletBalance = balanceAfter;
          await customer.save();

          // Create wallet transaction
          await WalletTransaction.create({
            userId: customer._id,
            type: 'payment',
            amount: body.totalAmount,
            balanceBefore,
            balanceAfter,
            description: `Thanh toán ${table.name} - ${body.totalAmount.toLocaleString('vi-VN')}đ`,
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
          items: items,
          pointsEarned,
        });

        // Update user points, hours, and rank if customerId is provided
        if (body.customerId) {
          const hoursPlayed = body.durationInHours ? Number(body.durationInHours.toFixed(1)) : 0;
          
          const user = await User.findById(body.customerId);
          if (user) {
            const newPoints = (user.points || 0) + pointsEarned;
            const newRank = getRankFromPoints(newPoints);
            
            user.points = newPoints;
            user.totalHoursPlayed = (user.totalHoursPlayed || 0) + hoursPlayed;
            user.rank = newRank;
            
            // Also update membershipType based on rank for backward compatibility
            switch (newRank) {
              case 'Diamond': user.membershipType = 'Thẻ VIP Kim Cương'; break;
              case 'Gold': user.membershipType = 'Thẻ VIP Vàng'; break;
              case 'Silver': user.membershipType = 'Thẻ VIP Bạc'; break;
              default: user.membershipType = 'Thành viên Tiêu chuẩn'; break;
            }
            
            await user.save();
          }
        }
      }
    }

    return NextResponse.json({ session: updatedSession }, { status: 200 });
  } catch (error) {
    console.error('Failed to update session:', error);
    return NextResponse.json({ message: 'Failed to update session', error }, { status: 500 });
  }
}
