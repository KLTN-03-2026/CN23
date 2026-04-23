'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, Star, Clock, CreditCard, Wallet, QrCode, RefreshCw, Calendar } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const COLORS = ['#fbbf24', '#10b981', '#6366f1', '#f43f5e'];

const paymentMethodLabels: Record<string, string> = {
  cash: 'Tiền mặt',
  qr: 'Mã QR',
  card: 'Thẻ tín dụng',
  wallet: 'Ví nội bộ',
};

export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        if (data.success) setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-400 border-t-transparent"></div>
      </div>
    );
  }

  // Prepare payment method pie chart data
  const paymentPieData = Object.entries(stats.paymentMethodStats || {}).map(([key, value]) => ({
    name: paymentMethodLabels[key] || key,
    value: value as number,
  })).filter(d => d.value > 0);

  const revenueCards = [
    { label: 'Tổng doanh thu', value: stats.totalRevenue, icon: DollarSign, color: 'emerald', sub: 'Tất cả thời gian' },
    { label: 'Doanh thu hôm nay', value: stats.todayRevenue, icon: Calendar, color: 'amber', sub: 'Hôm nay' },
    { label: 'Doanh thu POS', value: stats.posRevenue, icon: CreditCard, color: 'blue', sub: 'Thanh toán giờ + F&B' },
    { label: 'Doanh thu Gói TV', value: stats.orderRevenue, icon: Star, color: 'purple', sub: 'Bán gói thành viên' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Báo cáo & Thống kê</h1>
          <p className="text-sm text-zinc-400">Phân tích doanh thu và hoạt động kinh doanh</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          <RefreshCw className="h-4 w-4" /> Làm mới
        </button>
      </div>

      {/* Revenue Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {revenueCards.map((card, i) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-400">{card.label}</p>
                <h3 className="mt-1.5 text-2xl font-bold text-white">
                  {card.value.toLocaleString('vi-VN')}đ
                </h3>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${card.color}-500/10 text-${card.color}-500`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-xs text-zinc-500">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Revenue */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="mb-1 text-lg font-bold text-white">Doanh thu theo ngày</h3>
          <p className="mb-6 text-xs text-zinc-500">Thống kê tuần hiện tại</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip
                  contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#a1a1aa' }}
                  formatter={(v: any) => [`${v.toLocaleString('vi-VN')}đ`, 'Doanh thu']}
                />
                <Bar dataKey="revenue" fill="#fbbf24" radius={[4, 4, 0, 0]} maxBarSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="mb-1 text-lg font-bold text-white">Xu hướng doanh thu</h3>
          <p className="mb-6 text-xs text-zinc-500">12 tháng gần nhất (Triệu VNĐ)</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#a1a1aa' }}
                  formatter={(v: any) => [`${Number(v).toFixed(2)} Triệu VNĐ`, 'Doanh thu']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#gradientRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Pie */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="mb-1 text-lg font-bold text-white">Phương thức thanh toán</h3>
          <p className="mb-4 text-xs text-zinc-500">Tỷ lệ theo giá trị giao dịch</p>
          {paymentPieData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="h-[200px] w-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                      {paymentPieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(v: any) => [`${Number(v).toLocaleString('vi-VN')}đ`]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-3">
                {paymentPieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                    <span className="text-zinc-300">{d.name}</span>
                    <span className="ml-auto font-bold text-zinc-100">{Number(d.value).toLocaleString('vi-VN')}đ</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="py-12 text-center text-zinc-500">Chưa có dữ liệu giao dịch</p>
          )}
        </div>

        {/* Quick Stats */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="mb-4 text-lg font-bold text-white">Thống kê nhanh</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 text-center">
              <Users className="mx-auto mb-2 h-6 w-6 text-amber-400" />
              <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
              <p className="text-xs text-zinc-500">Tổng khách hàng</p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 text-center">
              <TrendingUp className="mx-auto mb-2 h-6 w-6 text-emerald-400" />
              <p className="text-2xl font-bold text-white">{stats.totalTransactions}</p>
              <p className="text-xs text-zinc-500">Tổng giao dịch</p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 text-center">
              <Clock className="mx-auto mb-2 h-6 w-6 text-blue-400" />
              <p className="text-2xl font-bold text-white">{stats.totalReservations}</p>
              <p className="text-xs text-zinc-500">Tổng đặt bàn</p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 text-center">
              <Star className="mx-auto mb-2 h-6 w-6 text-purple-400" />
              <p className="text-2xl font-bold text-white">{stats.newCustomers}</p>
              <p className="text-xs text-zinc-500">Khách mới (7 ngày)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Customers */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="mb-4 text-lg font-bold text-white">Top 5 khách hàng thân thiết</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-800/50 text-xs uppercase text-zinc-400">
              <tr>
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">Tên</th>
                <th className="px-6 py-3">SĐT</th>
                <th className="px-6 py-3">Hạng</th>
                <th className="px-6 py-3">Điểm</th>
                <th className="px-6 py-3">Giờ chơi</th>
                <th className="px-6 py-3">Số dư ví</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {(stats.topCustomers || []).map((c: any, i: number) => (
                <tr key={c._id} className="hover:bg-zinc-800/20">
                  <td className="px-6 py-4">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      i === 0 ? 'bg-amber-400/20 text-amber-400' :
                      i === 1 ? 'bg-zinc-300/20 text-zinc-300' :
                      i === 2 ? 'bg-orange-400/20 text-orange-400' :
                      'bg-zinc-700 text-zinc-400'
                    }`}>{i + 1}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-white">{c.name}</td>
                  <td className="px-6 py-4 text-zinc-400">{c.phone}</td>
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
                  <td className="px-6 py-4 font-medium text-emerald-400">{(c.walletBalance || 0).toLocaleString('vi-VN')}đ</td>
                </tr>
              ))}
              {(!stats.topCustomers || stats.topCustomers.length === 0) && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-zinc-500">Chưa có dữ liệu khách hàng</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
