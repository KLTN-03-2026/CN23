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
              <p className="text-sm font-medium text-zinc-400">Lượt tương tác AI</p>
              <h3 className="mt-2 text-3xl font-bold text-zinc-100">145</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-blue-500">+22%</span>
            <span className="ml-2 text-zinc-500">so với hôm qua</span>
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

      {/* User List */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="text-lg font-bold text-zinc-100 mb-6">Danh sách người dùng</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-zinc-400">
            <thead className="text-xs uppercase bg-zinc-800 text-zinc-300">
              <tr>
                <th className="px-6 py-3">Tên</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Số điện thoại</th>
                <th className="px-6 py-3">Vai trò</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                  <td className="px-6 py-4 font-medium text-zinc-100">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">{user.phone}</td>
                  <td className="px-6 py-4">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
