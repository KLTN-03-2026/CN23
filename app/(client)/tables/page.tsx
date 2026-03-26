'use client';

import { useState, useEffect } from 'react';
import { CircleDot } from 'lucide-react';
import BookingModal from '@/components/BookingModal';

export default function TablesPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const [tablesRes, sessionsRes, reservationsRes] = await Promise.all([
          fetch('/api/tables'),
          fetch('/api/pos/sessions'),
          fetch('/api/reservations')
        ]);

        const tablesData = await tablesRes.json();
        const sessionsData = await sessionsRes.json();
        const reservationsData = await reservationsRes.json();

        const activeReservations = reservationsData.reservations?.filter((r: any) => ['pending', 'confirmed'].includes(r.status)) || [];
        const sessionsMap: Record<string, any> = {};
        (sessionsData.sessions || []).forEach((s: any) => {
          sessionsMap[s.tableId] = s;
        });

        const realTables = (tablesData.tables || []).map((t: any) => {
          let status = t.status;
          let time = null;
          let customer = null;

          if (status === 'playing') {
            const session = sessionsMap[t._id];
            if (session) {
              const startTime = new Date(session.startTime);
              const diffMs = new Date().getTime() - startTime.getTime();
              const hours = Math.floor(diffMs / (1000 * 60 * 60));
              const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
              time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
              customer = 'Khách tại bàn';
            }
          } else if (status === 'reserved') {
            // Find the confirmed reservation for this table
            const res = activeReservations.find((r: any) => r.tableId === t._id && r.status === 'confirmed');
            if (res) {
              customer = res.customerName;
              time = res.time;
            } else {
              customer = 'Khách đặt trước';
              time = 'Sắp tới';
            }
          } else if (status === 'empty') {
            // Check if there is a pending reservation for this table
            const pendingRes = activeReservations.find((r: any) => r.tableId === t._id && r.status === 'pending');
            if (pendingRes) {
              status = 'reserved'; // Show as reserved on client map if pending
              customer = pendingRes.customerName;
              time = pendingRes.time + ' (Chờ XN)';
            }
          }

          return {
            id: t._id,
            name: t.name,
            type: t.type,
            status,
            time,
            customer
          };
        });

        // For chatbot reservations without a specific tableId, map them to empty tables
        activeReservations.filter((r: any) => !r.tableId).forEach((res: any) => {
          let targetType = res.tableType;
          if (targetType.toLowerCase().includes('thường')) targetType = 'Bàn Thường';
          else if (targetType.toLowerCase().includes('super')) targetType = 'Phòng Super VIP';
          else if (targetType.toLowerCase().includes('vip')) targetType = 'Bàn VIP';

          const emptyTableIndex = realTables.findIndex((t: any) => t.type === targetType && t.status === 'empty');
          
          if (emptyTableIndex !== -1) {
            realTables[emptyTableIndex] = {
              ...realTables[emptyTableIndex],
              status: 'reserved',
              customer: res.customerName,
              time: res.time + (res.status === 'pending' ? ' (Chờ XN)' : '')
            };
          }
        });

        setTables(realTables);
      } catch (error) {
        console.error('Error fetching tables:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
    const interval = setInterval(fetchTables, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleTableClick = (table: any) => {
    if (table.status === 'empty') {
      setSelectedTable(table);
      setIsBookingModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold uppercase tracking-wider text-white">Sơ đồ bàn trực tuyến</h1>
          <p className="text-zinc-400">Theo dõi trạng thái bàn theo thời gian thực</p>
        </div>
        
        <div className="flex flex-wrap gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-2">
          <div className="flex items-center gap-2 px-3 py-1">
            <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
            <span className="text-sm text-zinc-300">Trống</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1">
            <span className="h-3 w-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
            <span className="text-sm text-zinc-300">Đang chơi</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1">
            <span className="h-3 w-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"></span>
            <span className="text-sm text-zinc-300">Đã đặt</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1">
            <span className="h-3 w-3 rounded-full bg-zinc-500"></span>
            <span className="text-sm text-zinc-300">Bảo trì</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((table) => {
          let statusColor = '';
          let statusText = '';
          let borderColor = '';
          let glowEffect = '';

          switch (table.status) {
            case 'empty':
              statusColor = 'text-emerald-500';
              statusText = 'Trống';
              borderColor = 'border-emerald-500/30';
              glowEffect = 'hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:border-emerald-500/50';
              break;
            case 'playing':
              statusColor = 'text-rose-500';
              statusText = 'Đang chơi';
              borderColor = 'border-rose-500/50';
              glowEffect = 'shadow-[0_0_15px_rgba(244,63,94,0.1)] cursor-pointer hover:border-rose-400';
              break;
            case 'reserved':
              statusColor = 'text-amber-400';
              statusText = 'Đã đặt';
              borderColor = 'border-amber-400/50';
              glowEffect = 'shadow-[0_0_15px_rgba(251,191,36,0.1)]';
              break;
            case 'maintenance':
              statusColor = 'text-zinc-500';
              statusText = 'Bảo trì';
              borderColor = 'border-zinc-800';
              glowEffect = 'opacity-50';
              break;
          }

          return (
            <div 
              key={table.id} 
              onClick={() => handleTableClick(table)}
              className={`relative flex flex-col overflow-hidden rounded-2xl border bg-zinc-900/40 p-5 transition-all ${borderColor} ${glowEffect}`}
            >
              {/* Type Badge */}
              <div className="absolute right-0 top-0 rounded-bl-xl bg-zinc-800 px-3 py-1 text-xs font-bold text-zinc-400">
                {table.type}
              </div>

              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full border bg-zinc-950 ${borderColor}`}>
                  <CircleDot className={`h-6 w-6 ${statusColor}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-100">{table.name}</h3>
                  <p className={`text-sm font-medium ${statusColor}`}>{statusText}</p>
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-2 rounded-lg bg-zinc-950/50 p-3">
                {table.status === 'playing' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Khách hàng:</span>
                      <span className="font-medium text-zinc-200">{table.customer}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Thời gian:</span>
                      <span className="font-mono font-bold text-rose-400">{table.time}</span>
                    </div>
                    <div className="mt-2 flex h-[32px] items-center justify-center">
                      <span className="text-xs font-medium text-zinc-500">Đang chơi</span>
                    </div>
                  </>
                )}
                {table.status === 'reserved' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Khách đặt:</span>
                      <span className="font-medium text-zinc-200">{table.customer}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Giờ đến:</span>
                      <span className="font-mono font-bold text-amber-400">{table.time}</span>
                    </div>
                  </>
                )}
                {table.status === 'empty' && (
                  <div className="flex h-[44px] items-center justify-center">
                    <button className="w-full rounded bg-emerald-500/10 py-1.5 text-sm font-bold text-emerald-400 transition-colors hover:bg-emerald-500/20">
                      Mở bàn ngay
                    </button>
                  </div>
                )}
                {table.status === 'maintenance' && (
                  <div className="flex h-[44px] items-center justify-center">
                    <span className="text-sm text-zinc-500">Đang sửa chữa</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        tableData={selectedTable}
      />
    </div>
  );
}
