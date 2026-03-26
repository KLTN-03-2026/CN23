import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Table from '@/lib/models/Table';

export async function GET() {
  try {
    await dbConnect();
    const tables = await Table.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ tables });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const table = await Table.create(body);
    return NextResponse.json({ table }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create table' }, { status: 500 });
  }
}
