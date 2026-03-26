import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MenuItem from '@/lib/models/MenuItem';

export async function GET() {
  try {
    await dbConnect();
    const menuItems = await MenuItem.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ menuItems });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const menuItem = await MenuItem.create(body);
    return NextResponse.json({ menuItem }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
  }
}
