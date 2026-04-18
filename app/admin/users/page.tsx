'use client';

import { useState, useEffect } from 'react';
import { Search, User, Star, Clock, RefreshCw, Wallet, X, ArrowUpCircle, TrendingUp } from 'lucide-react';
import { getRankLabel } from '@/lib/rank';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterMembership, setFilterMembership] = useState('all');

  // Topup modal state
  const [topupUser, setTopupUser] = useState<any>(null);
  const [topupAmount, setTopupAmount] = useState('');
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupResult, setTopupResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        setFilteredUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;

    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter(user => 
        (user.name && user.name.toLowerCase().includes(lowerCaseSearch)) ||
        (user.phone && user.phone.toLowerCase().includes(lowerCaseSearch)) ||
        (user.email && user.email.toLowerCase().includes(lowerCaseSearch))
      );
    }

    if (filterRole !== 'all') {
      result = result.filter(user => user.role === filterRole);
    }

    if (filterMembership !== 'all') {
      result = result.filter(user => user.membershipType === filterMembership);
    }

    setFilteredUsers(result);
  }, [searchTerm, filterRole, filterMembership, users]);

  const handleTopup = async () => {
    if (!topupUser || !topupAmount) return;
    const amount = parseInt(topupAmount.replace(/\D/g, ''));
    if (!amount || amount <= 0) {
      setTopupResult({ type: 'error', message: 'Số tiền không hợp lệ' });
      return;
    }

    setTopupLoading(true);
    setTopupResult(null);

    try {
      const res = await fetch(`/api/admin/users/${topupUser._id}/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();

      if (res.ok) {
        setTopupResult({ type: 'success', message: data.message });
        // Update user in list
        setUsers(users.map(u => u._id === topupUser._id ? { ...u, walletBalance: data.walletBalance } : u));
        setTopupAmount('');
        setTimeout(() => {
          setTopupUser(null);
          setTopupResult(null);
        }, 2000);
      } else {
        setTopupResult({ type: 'error', message: data.error || 'Có lỗi xảy ra' });
      }
    } catch (error) {
      setTopupResult({ type: 'error', message: 'Lỗi kết nối' });
    } finally {
      setTopupLoading(false);
    }
  };

  const quickAmounts = [50000, 100000, 200000, 500000, 1000000];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white">Quản lý Khách hàng</h1>
        <div className="flex items-center gap-2">
          <button onClick={fetchUsers} className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700">
            <RefreshCw className="h-4 w-4" /> Làm mới
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Tìm kiếm tên, số điện thoại, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-10 pr-4 text-sm text-white focus:border-amber-400 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="user">Khách hàng</option>
              <option value="admin">Quản trị viên</option>
            </select>
            <select
              value={filterMembership}
              onChange={(e) => setFilterMembership(e.target.value)}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
            >
              <option value="all">Tất cả hạng thẻ</option>
              <option value="Thành viên Tiêu chuẩn">Thành viên Tiêu chuẩn</option>
              <option value="Thẻ VIP Bạc">Thẻ VIP Bạc</option>
              <option value="Thẻ VIP Vàng">Thẻ VIP Vàng</option>
              <option value="Thẻ VIP Kim Cương">Thẻ VIP Kim Cương</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-800/50 text-xs uppercase text-zinc-300">
              <tr>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Liên hệ</th>
                <th className="px-6 py-4">Hạng thẻ</th>
                <th className="px-6 py-4">Điểm</th>
                <th className="px-6 py-4">Số dư ví</th>
                <th className="px-6 py-4">Giờ chơi</th>
                <th className="px-6 py-4">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-t-transparent"></div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-zinc-500">Không có khách hàng nào</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-zinc-800/20">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-amber-400">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{user.name}</div>
                          <div className="text-xs text-zinc-500">{user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">{user.phone}</div>
                      <div className="text-xs text-zinc-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-block w-max px-2 py-1 text-xs rounded-md ${
                          user.rank === 'Diamond' ? 'bg-purple-500/20 text-purple-400' :
                          user.rank === 'Gold' ? 'bg-amber-500/20 text-amber-400' :
                          user.rank === 'Silver' ? 'bg-slate-300/20 text-slate-300' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          {user.rank ? getRankLabel(user.rank) : 'Đồng'}
                        </span>
                        <span className="text-xs text-zinc-600">{user.membershipType || 'Thành viên Tiêu chuẩn'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-amber-400 font-medium">
                        <Star className="h-3 w-3" /> {user.points || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-emerald-400 font-medium">
                        <Wallet className="h-3 w-3" /> {(user.walletBalance || 0).toLocaleString('vi-VN')}đ
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-zinc-300">
                        <Clock className="h-3 w-3" /> {user.totalHoursPlayed || 0}h
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => { setTopupUser(user); setTopupAmount(''); setTopupResult(null); }}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-400 transition-all hover:bg-emerald-500/20 hover:shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                        >
                          <ArrowUpCircle className="h-3.5 w-3.5" /> Nạp tiền
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Topup Modal */}
      {topupUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Wallet className="h-5 w-5 text-emerald-400" /> Nạp tiền ví
              </h2>
              <button onClick={() => setTopupUser(null)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Customer Info */}
            <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-amber-400">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-white">{topupUser.name}</p>
                  <p className="text-sm text-zinc-400">{topupUser.phone} — {topupUser.email}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-zinc-800 pt-3">
                <span className="text-sm text-zinc-400">Số dư hiện tại</span>
                <span className="text-lg font-bold text-emerald-400">{(topupUser.walletBalance || 0).toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-zinc-300">Số tiền nạp (VNĐ)</label>
              <input
                type="text"
                value={topupAmount}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setTopupAmount(val ? parseInt(val).toLocaleString('vi-VN') : '');
                }}
                placeholder="Nhập số tiền..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-lg font-bold text-white text-center focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="mb-6 flex flex-wrap gap-2">
              {quickAmounts.map(amt => (
                <button
                  key={amt}
                  onClick={() => setTopupAmount(amt.toLocaleString('vi-VN'))}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-emerald-400 hover:text-emerald-400"
                >
                  {amt.toLocaleString('vi-VN')}đ
                </button>
              ))}
            </div>

            {/* Result Message */}
            {topupResult && (
              <div className={`mb-4 rounded-lg p-3 text-sm ${
                topupResult.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
              }`}>
                {topupResult.message}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleTopup}
              disabled={topupLoading || !topupAmount}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 text-base font-bold text-white transition-all hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
            >
              {topupLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <ArrowUpCircle className="h-5 w-5" />
              )}
              {topupLoading ? 'Đang xử lý...' : 'Xác nhận nạp tiền'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
