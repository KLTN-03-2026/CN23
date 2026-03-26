'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle2, XCircle, Clock, RefreshCw, DollarSign } from 'lucide-react';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'membership', 'pos'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'success', 'pending', 'failed', 'refunded'

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const [ordersRes, transRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/transactions')
      ]);
      
      const ordersData = await ordersRes.json();
      const transData = await transRes.json();
      
      let combined: any[] = [];
      
      if (ordersData.orders) {
        const mappedOrders = ordersData.orders.map((o: any) => ({
          ...o,
          type: 'membership',
          description: o.packageName
        }));
        combined = [...combined, ...mappedOrders];
      }
      
      if (transData.transactions) {
        const mappedTrans = transData.transactions.map((t: any) => ({
          ...t,
          type: 'pos',
          description: `Thanh toán ${t.tableName}`
        }));
        combined = [...combined, ...mappedTrans];
      }
      
      // Sort by date descending
      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setTransactions(combined);
      setFilteredTransactions(combined);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    let result = transactions;

    // Apply search filter
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter(tx => 
        (tx._id && tx._id.toLowerCase().includes(lowerCaseSearch)) ||
        (tx.customerName && tx.customerName.toLowerCase().includes(lowerCaseSearch)) ||
        (tx.description && tx.description.toLowerCase().includes(lowerCaseSearch))
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      result = result.filter(tx => tx.type === filterType);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(tx => tx.status === filterStatus);
    }

    setFilteredTransactions(result);
  }, [searchTerm, filterType, filterStatus, transactions]);

  const handleManualConfirm = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'success' }),
      });
      if (res.ok) {
        fetchTransactions();
      }
    } catch (error) {
      console.error('Failed to confirm order', error);
    }
  };

  const handleRefund = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refund' }),
      });
      if (res.ok) {
        fetchTransactions();
      }
    } catch (error) {
      console.error('Failed to refund order', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white">Quản lý Giao dịch</h1>
        <div className="flex items-center gap-2">
          <button onClick={fetchTransactions} className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700">
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
              placeholder="Tìm kiếm mã giao dịch, khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-10 pr-4 text-sm text-white focus:border-amber-400 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
            >
              <option value="all">Tất cả loại</option>
              <option value="membership">Gói Hội viên</option>
              <option value="pos">Thu ngân POS</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="success">Thành công</option>
              <option value="pending">Đang chờ</option>
              <option value="failed">Thất bại</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-800/50 text-xs uppercase text-zinc-300">
              <tr>
                <th className="px-6 py-4">Mã GD</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Loại / Nội dung</th>
                <th className="px-6 py-4">Số tiền</th>
                <th className="px-6 py-4">Phương thức</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-t-transparent"></div>
                  </td>
                </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-zinc-500">Không có giao dịch nào</td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-zinc-800/20">
                    <td className="px-6 py-4 font-mono text-xs text-zinc-300">{tx._id.substring(0, 8)}</td>
                    <td className="px-6 py-4 font-medium text-white">{tx.customerName}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 text-xs rounded-md mb-1 ${tx.type === 'membership' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {tx.type === 'membership' ? 'Gói Hội viên' : 'Thu ngân POS'}
                      </span>
                      <div className="text-zinc-300 text-xs">{tx.description}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-white">{(tx.amount || tx.totalAmount).toLocaleString('vi-VN')}đ</td>
                    <td className="px-6 py-4 uppercase">{tx.paymentMethod}</td>
                    <td className="px-6 py-4">
                      {tx.status === 'success' && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400"><CheckCircle2 className="h-3 w-3" /> Thành công</span>}
                      {tx.status === 'pending' && <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400"><Clock className="h-3 w-3" /> Đang chờ</span>}
                      {tx.status === 'failed' && <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-400"><XCircle className="h-3 w-3" /> Thất bại</span>}
                      {tx.status === 'refunded' && <span className="inline-flex items-center gap-1 rounded-full bg-zinc-500/10 px-2.5 py-1 text-xs font-medium text-zinc-400"><DollarSign className="h-3 w-3" /> Đã hoàn tiền</span>}
                    </td>
                    <td className="px-6 py-4 text-xs">{new Date(tx.createdAt).toLocaleString('vi-VN')}</td>
                    <td className="px-6 py-4 text-right">
                      {tx.status === 'pending' && tx.type === 'membership' && (
                        <button onClick={() => handleManualConfirm(tx._id)} className="text-emerald-400 hover:text-emerald-300 font-medium text-xs">
                          Xác nhận
                        </button>
                      )}
                      {tx.status === 'success' && tx.type === 'membership' && (
                        <button onClick={() => handleRefund(tx._id)} className="text-rose-400 hover:text-rose-300 font-medium text-xs">
                          Hoàn tiền
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
    </div>
  );
}
