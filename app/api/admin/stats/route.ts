import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Transaction from '@/lib/models/Transaction';
import Table from '@/lib/models/Table';
import User from '@/lib/models/User';

export async function GET() {
  try {
    await dbConnect();

    // Calculate total revenue from successful orders (memberships)
    const successOrders = await Order.find({ status: 'success' });
    const orderRevenue = successOrders.reduce((sum, order) => sum + order.amount, 0);

    // Calculate total revenue from successful POS transactions
    const successTransactions = await Transaction.find({ status: 'success' });
    const posRevenue = successTransactions.reduce((sum, tx) => sum + tx.totalAmount, 0);

    const totalRevenue = orderRevenue + posRevenue;

    // Get active tables and total tables
    const totalTables = await Table.countDocuments();
    const activeTables = await Table.countDocuments({ status: 'playing' });

    // Get new customers (users created in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newCustomers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // Group by month for the chart
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      name: `T${i + 1}`,
      revenue: 0,
    }));

    // Group by day of week for the chart
    const weeklyData = [
      { name: 'T2', revenue: 0 },
      { name: 'T3', revenue: 0 },
      { name: 'T4', revenue: 0 },
      { name: 'T5', revenue: 0 },
      { name: 'T6', revenue: 0 },
      { name: 'T7', revenue: 0 },
      { name: 'CN', revenue: 0 },
    ];

    const processRevenue = (items: any[], isPos: boolean) => {
      items.forEach(item => {
        const date = new Date(item.createdAt);
        const amount = isPos ? item.totalAmount : item.amount;
        
        // Monthly
        const month = date.getMonth();
        monthlyData[month].revenue += amount / 1000000; // Convert to millions for chart

        // Weekly (assuming Sunday is 0, Monday is 1... Saturday is 6)
        const day = date.getDay();
        // Map JS getDay() (0=Sun, 1=Mon, ...) to T2-CN (1=Mon=T2, ..., 0=Sun=CN)
        const weeklyIndex = day === 0 ? 6 : day - 1;
        weeklyData[weeklyIndex].revenue += amount;
      });
    };

    processRevenue(successOrders, false);
    processRevenue(successTransactions, true);

    return NextResponse.json({ 
      success: true, 
      totalRevenue, 
      monthlyData, 
      weeklyData,
      activeTables,
      totalTables,
      newCustomers
    }, { status: 200 });
  } catch (error: any) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
