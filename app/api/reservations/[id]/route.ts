import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Reservation from '@/lib/models/Reservation';
import Table from '@/lib/models/Table';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const reservation = await Reservation.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!reservation) return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });

    // If confirmed and has a tableId, update the table status to reserved
    if (body.status === 'confirmed' && reservation.tableId) {
      await Table.findByIdAndUpdate(reservation.tableId, { status: 'reserved' });
    } else if (body.status === 'cancelled' && reservation.tableId) {
      // If cancelled, maybe revert to empty if it was reserved?
      // Only do this if the table is currently reserved
      const table = await Table.findById(reservation.tableId);
      if (table && table.status === 'reserved') {
        await Table.findByIdAndUpdate(reservation.tableId, { status: 'empty' });
      }
    }

    return NextResponse.json({ reservation });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update reservation' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const reservation = await Reservation.findByIdAndDelete(id);
    if (!reservation) return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete reservation' }, { status: 500 });
  }
}
