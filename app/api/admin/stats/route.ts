import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Transaction from '@/lib/models/Transaction';
import Table from '@/lib/models/Table';
import User from '@/lib/models/User';
import Reservation from '@/lib/models/Reservation';

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

    // Total users and reservations
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalReservations = await Reservation.countDocuments();
    const totalTransactions = successTransactions.length + successOrders.length;

    // Today's revenue
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayOrders = successOrders.filter(o => new Date(o.createdAt) >= todayStart);
    const todayTransactions = successTransactions.filter(t => new Date(t.createdAt) >= todayStart);
    const todayRevenue = todayOrders.reduce((s, o) => s + o.amount, 0) + todayTransactions.reduce((s, t) => s + t.totalAmount, 0);

    // Top customers by points
    const topCustomers = await User.find({ role: 'user' })
      .sort({ points: -1 })
      .limit(5)
      .select('name phone points rank totalHoursPlayed walletBalance');

    // Revenue by payment method
    const paymentMethodStats: Record<string, number> = {};
    successTransactions.forEach((tx: any) => {
      const method = tx.paymentMethod || 'cash';
      paymentMethodStats[method] = (paymentMethodStats[method] || 0) + tx.totalAmount;
    });
    successOrders.forEach((o: any) => {
      const method = o.paymentMethod || 'qr';
      paymentMethodStats[method] = (paymentMethodStats[method] || 0) + o.amount;
    });

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
        const weeklyIndex = day === 0 ? 6 : day - 1;
        weeklyData[weeklyIndex].revenue += amount;
      });
    };

    processRevenue(successOrders, false);
    processRevenue(successTransactions, true);

    return NextResponse.json({ 
      success: true, 
      totalRevenue, 
      orderRevenue,
      posRevenue,
      todayRevenue,
      monthlyData, 
      weeklyData,
      activeTables,
      totalTables,
      totalUsers,
      newCustomers,
      totalReservations,
      totalTransactions,
      topCustomers,
      paymentMethodStats,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
