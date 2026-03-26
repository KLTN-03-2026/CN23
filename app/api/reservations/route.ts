import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Reservation from '@/lib/models/Reservation';

export async function GET() {
  try {
    await dbConnect();
    const reservations = await Reservation.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ reservations });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const reservation = await Reservation.create(body);
    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}
