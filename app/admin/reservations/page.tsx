'use client';

import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle } from 'lucide-react';

interface Reservation {
  _id: string;
  customerName: string;
  phone: string;
  time: string;
  tableType: string;
  tableId?: string;
  status: string;
}

interface Table {
  _id: string;
  name: string;
  type: string;
  status: string;
}

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTableForRes, setSelectedTableForRes] = useState<Record<string, string>>({});

  const fetchData = async () => {
    try {
      const [resData, tablesData] = await Promise.all([
        fetch('/api/reservations').then(res => res.json()),
        fetch('/api/tables').then(res => res.json())
      ]);
      
      setReservations(resData.reservations || []);
      setTables(tablesData.tables || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 5 seconds to get new reservations from chatbot
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const body: any = { status };
      if (status === 'confirmed') {
        const tableId = selectedTableForRes[id];
        if (!tableId) {
          alert('Vui lòng chọn bàn trước khi xác nhận');
          return;
        }
        body.tableId = tableId;
      }

      await fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      fetchData();
    } catch (error) {
      console.error('Failed to update reservation status:', error);
    }
  };

  const getTableName = (tableId: string) => {
    const table = tables.find(t => t._id === tableId);
    return table ? table.name : 'Không xác định';
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Quản lý Đặt bàn</h1>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng..."
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 py-2 pl-10 pr-4 text-sm text-zinc-200 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>
        <select className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-zinc-200 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400">
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="completed">Đã hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">Khách hàng</th>
                <th className="px-6 py-4 font-medium">Số điện thoại</th>
                <th className="px-6 py-4 font-medium">Thời gian</th>
                <th className="px-6 py-4 font-medium">Loại bàn</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : reservations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    Chưa có lịch đặt bàn nào
                  </td>
                </tr>
              ) : (
                reservations.map((res) => (
                  <tr key={res._id} className="transition-colors hover:bg-zinc-800/50">
                    <td className="px-6 py-4 font-medium text-zinc-200">{res.customerName}</td>
                    <td className="px-6 py-4">{res.phone}</td>
                    <td className="px-6 py-4 font-medium text-amber-400">{res.time}</td>
                    <td className="px-6 py-4">
                      {res.tableType}
                      {res.tableId && (
                        <span className="ml-2 rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                          {getTableName(res.tableId)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        res.status === 'pending' ? 'bg-amber-400/10 text-amber-400' :
                        res.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500' :
                        res.status === 'completed' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-rose-500/10 text-rose-500'
                      }`}>
                        {res.status === 'pending' ? 'Chờ xác nhận' :
                         res.status === 'confirmed' ? 'Đã xác nhận' : 
                         res.status === 'completed' ? 'Đã hoàn thành' : 'Đã hủy'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {res.status === 'pending' && (
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            <select 
                              className={`rounded border px-2 py-1 text-xs focus:outline-none ${
                                !selectedTableForRes[res._id] 
                                  ? 'border-rose-500/50 bg-rose-500/10 text-rose-200 focus:border-rose-500' 
                                  : 'border-zinc-700 bg-zinc-800 text-zinc-200 focus:border-amber-400'
                              }`}
                              value={selectedTableForRes[res._id] || ''}
                              onChange={(e) => setSelectedTableForRes({...selectedTableForRes, [res._id]: e.target.value})}
                            >
                              <option value="">-- Chọn bàn trống --</option>
                              {tables
                                .filter(t => t.status === 'empty')
                                .map(t => (
                                  <option key={t._id} value={t._id}>{t.name} ({t.type})</option>
                                ))
                              }
                            </select>
                            <button 
                              onClick={() => updateStatus(res._id, 'confirmed')}
                              className={`rounded p-1 transition-colors ${
                                selectedTableForRes[res._id] 
                                  ? 'text-emerald-500 hover:bg-emerald-500/20' 
                                  : 'text-zinc-600 cursor-not-allowed'
                              }`}
                              title="Xác nhận"
                              disabled={!selectedTableForRes[res._id]}
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => updateStatus(res._id, 'cancelled')}
                              className="rounded p-1 text-zinc-400 hover:bg-rose-500/20 hover:text-rose-500" 
                              title="Hủy"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </div>
                          {!selectedTableForRes[res._id] && (
                            <span className="text-[10px] text-rose-400 italic">Vui lòng chọn bàn để xác nhận</span>
                          )}
                        </div>
                      )}
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
