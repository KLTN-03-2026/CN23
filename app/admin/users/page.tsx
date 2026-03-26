'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, User, Star, Clock, RefreshCw } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all'); // 'all', 'admin', 'user'
  const [filterMembership, setFilterMembership] = useState('all'); // 'all', 'Thành viên Tiêu chuẩn', 'Thẻ VIP Bạc', 'Thẻ VIP Vàng', 'Thẻ VIP Kim Cương'

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

    // Apply search filter
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter(user => 
        (user.name && user.name.toLowerCase().includes(lowerCaseSearch)) ||
        (user.phone && user.phone.toLowerCase().includes(lowerCaseSearch)) ||
        (user.email && user.email.toLowerCase().includes(lowerCaseSearch))
      );
    }

    // Apply role filter
    if (filterRole !== 'all') {
      result = result.filter(user => user.role === filterRole);
    }

    // Apply membership filter
    if (filterMembership !== 'all') {
      result = result.filter(user => user.membershipType === filterMembership);
    }

    setFilteredUsers(result);
  }, [searchTerm, filterRole, filterMembership, users]);

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
                <th className="px-6 py-4">Giờ chơi</th>
                <th className="px-6 py-4">Ngày tham gia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-t-transparent"></div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-zinc-500">Không có khách hàng nào</td>
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
                      <span className={`inline-block px-2 py-1 text-xs rounded-md ${
                        user.membershipType === 'Thành viên Tiêu chuẩn' ? 'bg-zinc-800 text-zinc-300' :
                        user.membershipType === 'Thẻ VIP Bạc' ? 'bg-slate-300/20 text-slate-300' :
                        user.membershipType === 'Thẻ VIP Vàng' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {user.membershipType || 'Thành viên Tiêu chuẩn'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-amber-400 font-medium">
                        <Star className="h-3 w-3" /> {user.points || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-zinc-300">
                        <Clock className="h-3 w-3" /> {user.totalHoursPlayed || 0}h
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
