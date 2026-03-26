import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Table from '@/lib/models/Table';
import Session from '@/lib/models/Session';
import MenuItem from '@/lib/models/MenuItem';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { tableName, itemName, quantity } = await req.json();

    if (!tableName || !itemName || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find table by name (case insensitive)
    const table = await Table.findOne({ name: { $regex: new RegExp(`^${tableName}$`, 'i') } });
    if (!table) {
      return NextResponse.json({ error: `Không tìm thấy bàn: ${tableName}` }, { status: 404 });
    }

    if (table.status !== 'playing') {
      return NextResponse.json({ error: `Bàn ${tableName} hiện không có khách chơi.` }, { status: 400 });
    }

    // Find active session for the table
    const session = await Session.findOne({ tableId: table._id, status: 'active' });
    if (!session) {
      return NextResponse.json({ error: `Không tìm thấy phiên chơi cho bàn ${tableName}.` }, { status: 404 });
    }

    // Find menu item by name (case insensitive, partial match)
    const menuItem = await MenuItem.findOne({ name: { $regex: new RegExp(itemName, 'i') } });
    if (!menuItem) {
      return NextResponse.json({ error: `Không tìm thấy món: ${itemName} trong thực đơn.` }, { status: 404 });
    }

    // Add order to session
    const existingOrderIndex = session.orders.findIndex((o: any) => o._id === menuItem._id.toString());
    
    if (existingOrderIndex >= 0) {
      session.orders[existingOrderIndex].quantity += quantity;
    } else {
      session.orders.push({
        _id: menuItem._id.toString(),
        name: menuItem.name,
        price: menuItem.price,
        quantity: quantity
      });
    }

    await session.save();

    return NextResponse.json({ 
      success: true, 
      message: `Đã thêm ${quantity} ${menuItem.name} vào ${table.name}.`,
      order: {
        tableName: table.name,
        itemName: menuItem.name,
        quantity,
        price: menuItem.price
      }
    });

  } catch (error) {
    console.error('Bot order error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
