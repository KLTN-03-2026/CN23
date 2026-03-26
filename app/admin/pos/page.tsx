'use client';

import { useState, useEffect } from 'react';
import { CircleDot, Clock, Coffee, Plus, Minus, Receipt, X } from 'lucide-react';
import PaymentModal from '@/components/PaymentModal';

interface Table {
  _id: string;
  name: string;
  type: string;
  pricePerHour: number;
  status: string;
}

interface MenuItem {
  _id: string;
  name: string;
  price: number;
}

interface Order {
  _id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Session {
  _id: string;
  tableId: string;
  startTime: string;
  orders: Order[];
}

export default function POS() {
  const [tables, setTables] = useState<Table[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [sessions, setSessions] = useState<Record<string, Session>>({});
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedTableForPayment, setSelectedTableForPayment] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [tablesRes, menuRes, sessionsRes] = await Promise.all([
        fetch('/api/tables'),
        fetch('/api/menu'),
        fetch('/api/pos/sessions')
      ]);

      const tablesData = await tablesRes.json();
      const menuData = await menuRes.json();
      const sessionsData = await sessionsRes.json();

      setTables(tablesData.tables || []);
      setMenuItems(menuData.menuItems || []);

      const sessionsMap: Record<string, Session> = {};
      (sessionsData.sessions || []).forEach((s: Session) => {
        sessionsMap[s.tableId] = s;
      });
      setSessions(sessionsMap);
    } catch (error) {
      console.error('Failed to fetch POS data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenTable = async (tableId: string) => {
    try {
      const res = await fetch('/api/pos/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId })
      });
      const data = await res.json();
      
      setTables(tables.map(t => t._id === tableId ? { ...t, status: 'playing' } : t));
      setSessions({
        ...sessions,
        [tableId]: data.session
      });
    } catch (error) {
      console.error('Failed to open table:', error);
    }
  };

  const updateSessionOrders = async (tableId: string, newOrders: Order[]) => {
    const session = sessions[tableId];
    if (!session) return;

    try {
      const res = await fetch(`/api/pos/sessions/${session._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: newOrders })
      });
      const data = await res.json();
      
      setSessions({
        ...sessions,
        [tableId]: data.session
      });
    } catch (error) {
      console.error('Failed to update orders:', error);
    }
  };

  const handleAddOrder = (tableId: string, item: MenuItem) => {
    const session = sessions[tableId];
    if (!session) return;

    const existingOrder = session.orders.find(o => o._id === item._id);
    let newOrders;
    
    if (existingOrder) {
      newOrders = session.orders.map(o => 
        o._id === item._id ? { ...o, quantity: o.quantity + 1 } : o
      );
    } else {
      newOrders = [...session.orders, { _id: item._id, name: item.name, price: item.price, quantity: 1 }];
    }

    updateSessionOrders(tableId, newOrders);
  };

  const handleUpdateQuantity = (tableId: string, itemId: string, delta: number) => {
    const session = sessions[tableId];
    if (!session) return;

    const newOrders = session.orders.map(o => {
      if (o._id === itemId) {
        const newQ = o.quantity + delta;
        return newQ > 0 ? { ...o, quantity: newQ } : null;
      }
      return o;
    }).filter(Boolean) as Order[];

    updateSessionOrders(tableId, newOrders);
  };

  const getDurationHours = (startTime: Date) => {
    const diffMs = currentTime.getTime() - startTime.getTime();
    return diffMs / (1000 * 60 * 60);
  };

  const formatDuration = (startTime: Date) => {
    const diffMs = currentTime.getTime() - startTime.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const selectedTable = tables.find(t => t._id === selectedTableId);
  const currentSession = selectedTableId ? sessions[selectedTableId] : null;

  if (isLoading) {
    return <div className="flex h-full items-center justify-center text-zinc-500">Đang tải dữ liệu POS...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-88px)] gap-6">
      <div className="flex-1 overflow-y-auto pr-2">
        <h1 className="mb-6 text-2xl font-bold text-zinc-100">Thanh toán</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tables.map(table => {
            const isPlaying = table.status === 'playing';
            const isReserved = table.status === 'reserved';
            const session = sessions[table._id];
            
            return (
              <div 
                key={table._id}
                onClick={() => setSelectedTableId(table._id)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  isPlaying 
                    ? 'border-rose-500/50 bg-rose-500/5 hover:border-rose-500' 
                    : isReserved
                    ? 'border-amber-400/50 bg-amber-400/5 hover:border-amber-400'
                    : 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500'
                } ${selectedTableId === table._id ? 'ring-2 ring-amber-400' : ''}`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-bold text-zinc-100">{table.name}</h3>
                  <span className={`h-2.5 w-2.5 rounded-full ${isPlaying ? 'bg-rose-500' : isReserved ? 'bg-amber-400' : 'bg-emerald-500'}`}></span>
                </div>
                
                {isPlaying ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-sm font-mono font-bold text-rose-400">
                      <Clock className="h-4 w-4" />
                      {session ? formatDuration(new Date(session.startTime)) : '00:00:00'}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTableForPayment(table);
                        setIsPaymentModalOpen(true);
                      }}
                      className="w-full rounded bg-rose-500 py-2 text-sm font-bold text-white hover:bg-rose-600"
                    >
                      Thanh toán
                    </button>
                  </div>
                ) : isReserved ? (
                  <div className="text-sm font-medium text-amber-400">Đã đặt</div>
                ) : (
                  <div className="text-sm font-medium text-emerald-500">Trống</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedTable && (
        <div className="w-96 shrink-0 rounded-xl border border-zinc-800 bg-zinc-900/50 flex flex-col overflow-hidden">
          <div className="border-b border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-100">{selectedTable.name}</h2>
              <button onClick={() => setSelectedTableId(null)} className="text-zinc-400 hover:text-zinc-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-zinc-400">{selectedTable.type}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {selectedTable.status === 'empty' || selectedTable.status === 'reserved' ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <CircleDot className={`mb-4 h-16 w-16 ${selectedTable.status === 'reserved' ? 'text-amber-400/50' : 'text-emerald-500/50'}`} />
                <p className="mb-6 text-zinc-400">
                  {selectedTable.status === 'reserved' ? 'Bàn đã được đặt trước.' : 'Bàn đang trống, sẵn sàng phục vụ.'}
                </p>
                <button 
                  onClick={() => handleOpenTable(selectedTable._id)}
                  className={`w-full rounded-lg py-3 font-bold text-zinc-950 ${selectedTable.status === 'reserved' ? 'bg-amber-400 hover:bg-amber-300' : 'bg-emerald-500 hover:bg-emerald-400'}`}
                >
                  Mở bàn ngay
                </button>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/5 p-4 text-center">
                  <p className="mb-1 text-sm text-zinc-400">Thời gian chơi</p>
                  <div className="text-3xl font-mono font-bold text-rose-500">
                    {currentSession ? formatDuration(new Date(currentSession.startTime)) : '00:00:00'}
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    Bắt đầu: {currentSession ? new Date(currentSession.startTime).toLocaleTimeString() : 'Không rõ'}
                  </p>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-zinc-100">Dịch vụ F&B</h3>
                  <button 
                    onClick={() => setShowMenu(true)}
                    className="flex items-center gap-1 rounded bg-amber-400/10 px-2 py-1 text-xs font-bold text-amber-400 hover:bg-amber-400/20"
                  >
                    <Plus className="h-3 w-3" /> Thêm món
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3">
                  {!currentSession || currentSession.orders.length === 0 ? (
                    <p className="text-center text-sm text-zinc-500 italic">Chưa gọi món nào</p>
                  ) : (
                    currentSession.orders.map((order) => (
                      <div key={order._id} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
                        <div>
                          <p className="text-sm font-medium text-zinc-200">{order.name}</p>
                          <p className="text-xs text-zinc-500">{order.price.toLocaleString()}đ</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleUpdateQuantity(selectedTable._id, order._id, -1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-zinc-100"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-4 text-center text-sm font-bold text-zinc-200">{order.quantity}</span>
                          <button 
                            onClick={() => handleUpdateQuantity(selectedTable._id, order._id, 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-zinc-100"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {currentSession && (
                  <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Tiền giờ tạm tính</span>
                      <span className="font-medium text-zinc-200">
                        {Math.round(getDurationHours(new Date(currentSession.startTime)) * selectedTable.pricePerHour).toLocaleString()}đ
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Tiền dịch vụ (F&B)</span>
                      <span className="font-medium text-zinc-200">
                        {currentSession.orders?.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0).toLocaleString() || '0'}đ
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-800 pt-2">
                      <span className="font-bold text-zinc-100">Tổng tạm tính</span>
                      <span className="font-bold text-amber-400">
                        {(
                          Math.round(getDurationHours(new Date(currentSession.startTime)) * selectedTable.pricePerHour) +
                          (currentSession.orders?.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) || 0)
                        ).toLocaleString()}đ
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <button 
                    onClick={() => {
                      setSelectedTableForPayment(selectedTable);
                      setIsPaymentModalOpen(true);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-500 py-3 font-bold text-white hover:bg-rose-600"
                  >
                    <Receipt className="h-5 w-5" />
                    Thanh toán & Đóng bàn
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showMenu && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-100">Thêm món - {selectedTable.name}</h2>
              <button onClick={() => setShowMenu(false)} className="text-zinc-400 hover:text-zinc-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-2">
              {menuItems.map(item => (
                <div key={item._id} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:border-amber-400/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-amber-400">
                      <Coffee className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-200">{item.name}</p>
                      <p className="text-sm text-amber-400">{item.price.toLocaleString()}đ</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      handleAddOrder(selectedTable._id, item);
                      setShowMenu(false);
                    }}
                    className="rounded-lg bg-amber-400/10 px-3 py-1.5 text-sm font-bold text-amber-400 hover:bg-amber-400 hover:text-zinc-950"
                  >
                    Thêm
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        tableData={selectedTableForPayment}
        sessionData={selectedTableForPayment ? sessions[selectedTableForPayment._id] : null}
        onCheckoutSuccess={(tableId) => {
          setTables(tables.map(t => t._id === tableId ? { ...t, status: 'empty' } : t));
          const newSessions = { ...sessions };
          delete newSessions[tableId];
          setSessions(newSessions);
          if (selectedTableId === tableId) setSelectedTableId(null);
          setIsPaymentModalOpen(false);
        }}
      />
    </div>
  );
}
