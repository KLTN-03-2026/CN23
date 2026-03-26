import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Session from '@/lib/models/Session';
import Table from '@/lib/models/Table';
import Reservation from '@/lib/models/Reservation';

export async function GET() {
  try {
    await dbConnect();
    const activeSessions = await Session.find({ status: 'active' });
    return NextResponse.json({ sessions: activeSessions }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch sessions', error }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { tableId } = await req.json();
    
    // Create new session
    const newSession = await Session.create({
      tableId,
      startTime: new Date(),
      status: 'active',
      orders: []
    });

    // Update table status
    await Table.findByIdAndUpdate(tableId, { status: 'playing' });

    // Mark any confirmed reservation for this table as completed
    await Reservation.updateMany(
      { tableId, status: 'confirmed' },
      { $set: { status: 'completed' } }
    );

    return NextResponse.json({ session: newSession }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create session', error }, { status: 500 });
  }
}
