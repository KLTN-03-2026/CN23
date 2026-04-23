'use client';

import { useState, useEffect } from 'react';
import { Users, DollarSign, Table as TableIcon, Activity } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 shadow-xl">
        <p className="mb-1 text-sm font-medium text-zinc-400">{label}</p>
        <p className="text-lg font-bold text-amber-400">
          {payload[0].value.toLocaleString()}đ
        </p>
      </div>
    );
  }
  return null;
};

const MonthlyTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 shadow-xl">
        <p className="mb-1 text-sm font-medium text-zinc-400">{label}</p>
        <p className="text-lg font-bold text-emerald-400">
          {payload[0].value} Triệu VNĐ
        </p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [weeklyChartData, setWeeklyChartData] = useState<any[]>([]);
  const [monthlyChartData, setMonthlyChartData] = useState<any[]>([]);
  const [activeTables, setActiveTables] = useState(0);
  const [totalTables, setTotalTables] = useState(0);
  const [newCustomers, setNewCustomers] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [todayRevenue, setTodayRevenue] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users');
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Failed to fetch users', error);
      }
    };

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setTotalRevenue(data.totalRevenue);
            setWeeklyChartData(data.weeklyData);
            setMonthlyChartData(data.monthlyData);
            setActiveTables(data.activeTables || 0);
            setTotalTables(data.totalTables || 0);
            setNewCustomers(data.newCustomers || 0);
            setTotalTransactions(data.totalTransactions || 0);
            setTopCustomers(data.topCustomers || []);
            setTodayRevenue(data.todayRevenue || 0);
          }
        }
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };

    fetchUsers();
    fetchStats();
  }, []);

  const tableUsagePercent = totalTables > 0 ? Math.round((activeTables / totalTables) * 100) : 0;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-zinc-100">Tổng quan hệ thống</h1>
      
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Tổng doanh thu</p>
              <h3 className="mt-2 text-3xl font-bold text-zinc-100">{totalRevenue.toLocaleString('vi-VN')}đ</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-emerald-500">Cập nhật</span>
            <span className="ml-2 text-zinc-500">từ hệ thống</span>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Bàn đang chơi</p>
              <h3 className="mt-2 text-3xl font-bold text-zinc-100">{activeTables}/{totalTables}</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
              <TableIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-rose-500">{tableUsagePercent}%</span>
            <span className="ml-2 text-zinc-500">công suất</span>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Khách hàng mới (7 ngày)</p>
              <h3 className="mt-2 text-3xl font-bold text-zinc-100">{newCustomers}</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-amber-400">Cập nhật</span>
            <span className="ml-2 text-zinc-500">từ hệ thống</span>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Tổng giao dịch</p>
              <h3 className="mt-2 text-3xl font-bold text-zinc-100">{totalTransactions}</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-blue-500">Hôm nay: {todayRevenue.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-zinc-100">Doanh thu tuần này</h3>
            <p className="text-sm text-zinc-400">Thống kê theo từng ngày trong tuần</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000000}M`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#27272a', opacity: 0.4 }} />
                <Bar dataKey="revenue" fill="#fbbf24" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-zinc-100">Doanh thu năm nay (Triệu VNĐ)</h3>
            <p className="text-sm text-zinc-400">Xu hướng tăng trưởng qua các tháng</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<MonthlyTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Customers */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="text-lg font-bold text-zinc-100 mb-6">Top khách hàng thân thiết</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-zinc-400">
            <thead className="text-xs uppercase bg-zinc-800 text-zinc-300">
              <tr>
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">Tên</th>
                <th className="px-6 py-3">SĐT</th>
                <th className="px-6 py-3">Hạng</th>
                <th className="px-6 py-3">Điểm</th>
                <th className="px-6 py-3">Giờ chơi</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((c: any, i: number) => (
                <tr key={c._id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                  <td className="px-6 py-4">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      i === 0 ? 'bg-amber-400/20 text-amber-400' :
                      i === 1 ? 'bg-zinc-300/20 text-zinc-300' :
                      i === 2 ? 'bg-orange-400/20 text-orange-400' :
                      'bg-zinc-700 text-zinc-400'
                    }`}>{i + 1}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-zinc-100">{c.name}</td>
                  <td className="px-6 py-4">{c.phone}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-md px-2 py-1 text-xs font-medium ${
                      c.rank === 'Diamond' ? 'bg-purple-500/20 text-purple-400' :
                      c.rank === 'Gold' ? 'bg-amber-500/20 text-amber-400' :
                      c.rank === 'Silver' ? 'bg-slate-300/20 text-slate-300' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>{c.rank || 'Đồng'}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-amber-400">{c.points || 0}</td>
                  <td className="px-6 py-4 text-zinc-300">{c.totalHoursPlayed || 0}h</td>
                </tr>
              ))}
              {topCustomers.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-zinc-500">Chưa có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
