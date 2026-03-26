import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MenuItem from '@/lib/models/MenuItem';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const menuItem = await MenuItem.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!menuItem) return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    return NextResponse.json({ menuItem });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const menuItem = await MenuItem.findByIdAndDelete(id);
    if (!menuItem) return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
  }
}
