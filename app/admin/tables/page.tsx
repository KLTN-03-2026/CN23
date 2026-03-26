'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';

interface Table {
  _id: string;
  name: string;
  type: string;
  pricePerHour: number;
  status: string;
}

export default function AdminTables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [filteredTables, setFilteredTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState({ name: '', type: 'Lỗ (Pool)', pricePerHour: 80000, status: 'empty' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/tables');
      const data = await res.json();
      setTables(data.tables || []);
      setFilteredTables(data.tables || []);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    let result = tables;

    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter(table => 
        table.name.toLowerCase().includes(lowerCaseSearch)
      );
    }

    if (filterType) {
      result = result.filter(table => table.type === filterType);
    }

    setFilteredTables(result);
  }, [searchTerm, filterType, tables]);

  const handleOpenModal = (table?: Table) => {
    if (table) {
      setEditingTable(table);
      setFormData({ name: table.name, type: table.type, pricePerHour: table.pricePerHour, status: table.status });
    } else {
      setEditingTable(null);
      setFormData({ name: '', type: 'Lỗ (Pool)', pricePerHour: 80000, status: 'empty' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTable) {
        await fetch(`/api/tables/${editingTable._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('/api/tables', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      setIsModalOpen(false);
      fetchTables();
    } catch (error) {
      console.error('Failed to save table:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bàn này?')) {
      try {
        await fetch(`/api/tables/${id}`, { method: 'DELETE' });
        fetchTables();
      } catch (error) {
        console.error('Failed to delete table:', error);
      }
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'empty': return 'Trống';
      case 'playing': return 'Đang chơi';
      case 'reserved': return 'Đã đặt';
      case 'maintenance': return 'Bảo trì';
      default: return status;
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Quản lý Bàn</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-zinc-950 transition-colors hover:bg-emerald-400"
        >
          <Plus className="h-4 w-4" />
          Thêm bàn mới
        </button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Tìm kiếm bàn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 py-2 pl-10 pr-4 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <select 
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="">Tất cả loại bàn</option>
          <option value="Lỗ (Pool)">Lỗ (Pool)</option>
          <option value="Phăng (Carom)">Phăng (Carom)</option>
          <option value="3 Băng">3 Băng</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">Tên bàn</th>
                <th className="px-6 py-4 font-medium">Loại bàn</th>
                <th className="px-6 py-4 font-medium">Giá/Giờ</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredTables.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    Chưa có bàn nào. Hãy thêm bàn mới.
                  </td>
                </tr>
              ) : (
                filteredTables.map((table) => (
                  <tr key={table._id} className="transition-colors hover:bg-zinc-800/50">
                    <td className="px-6 py-4 font-medium text-zinc-200">{table.name}</td>
                    <td className="px-6 py-4">{table.type}</td>
                    <td className="px-6 py-4">{table.pricePerHour.toLocaleString()}đ</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        table.status === 'empty' ? 'bg-emerald-500/10 text-emerald-500' :
                        table.status === 'playing' ? 'bg-rose-500/10 text-rose-500' :
                        table.status === 'reserved' ? 'bg-amber-400/10 text-amber-400' :
                        'bg-zinc-500/10 text-zinc-500'
                      }`}>
                        {getStatusText(table.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(table)}
                          className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-amber-400"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(table._id)}
                          className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-rose-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-100">
                {editingTable ? 'Cập nhật bàn' : 'Thêm bàn mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-400">Tên bàn</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 py-2 px-4 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-400">Loại bàn</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 py-2 px-4 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Lỗ (Pool)">Lỗ (Pool)</option>
                  <option value="Phăng (Carom)">Phăng (Carom)</option>
                  <option value="3 Băng">3 Băng</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-400">Giá/Giờ (VNĐ)</label>
                <input
                  type="number"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData({ ...formData, pricePerHour: Number(e.target.value) })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 py-2 px-4 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-400">Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 py-2 px-4 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="empty">Trống</option>
                  <option value="playing">Đang chơi</option>
                  <option value="reserved">Đã đặt</option>
                  <option value="maintenance">Bảo trì</option>
                </select>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-bold text-zinc-300 hover:bg-zinc-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-zinc-950 hover:bg-emerald-400"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
