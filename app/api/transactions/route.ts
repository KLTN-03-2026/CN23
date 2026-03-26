import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    
    let query = {};
    if (customerId) {
      query = { customerId };
    }
    
    const transactions = await Transaction.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, transactions }, { status: 200 });
  } catch (error: any) {
    console.error('Transaction fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
