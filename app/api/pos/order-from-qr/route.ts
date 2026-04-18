import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Table from '@/lib/models/Table';
import Session from '@/lib/models/Session';
import MenuItem from '@/lib/models/MenuItem';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { tableId, items } = await req.json();

    if (!tableId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Vui lòng chọn ít nhất 1 món' }, { status: 400 });
    }

    // Find table
    const table = await Table.findById(tableId);
    if (!table) {
      return NextResponse.json({ error: 'Không tìm thấy bàn' }, { status: 404 });
    }

    if (table.status !== 'playing') {
      return NextResponse.json({ error: `Bàn ${table.name} hiện không hoạt động. Vui lòng liên hệ nhân viên.` }, { status: 400 });
    }

    // Find active session
    const session = await Session.findOne({ tableId: table._id, status: 'active' });
    if (!session) {
      return NextResponse.json({ error: 'Không tìm thấy phiên chơi cho bàn này.' }, { status: 404 });
    }

    // Process each item
    const addedItems = [];
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) continue;

      const quantity = item.quantity || 1;
      const existingIndex = session.orders.findIndex((o: any) => o._id === menuItem._id.toString());

      if (existingIndex >= 0) {
        session.orders[existingIndex].quantity += quantity;
      } else {
        session.orders.push({
          _id: menuItem._id.toString(),
          name: menuItem.name,
          price: menuItem.price,
          quantity,
        });
      }

      addedItems.push({ name: menuItem.name, quantity, price: menuItem.price });
    }

    await session.save();

    return NextResponse.json({
      success: true,
      message: `Đã gửi ${addedItems.length} món đến ${table.name}`,
      addedItems,
      tableName: table.name,
    });
  } catch (error) {
    console.error('QR order error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
