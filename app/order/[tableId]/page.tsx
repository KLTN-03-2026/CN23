'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Coffee, Plus, Minus, ShoppingCart, Send, Check, AlertCircle, Utensils } from 'lucide-react';

interface MenuItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export default function QROrderPage() {
  const { tableId } = useParams();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableName, setTableName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [tableError, setTableError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, tableRes] = await Promise.all([
          fetch('/api/menu'),
          fetch(`/api/tables`)
        ]);
        
        const menuData = await menuRes.json();
        setMenuItems(menuData.menuItems || []);

        const tableData = await tableRes.json();
        const table = (tableData.tables || []).find((t: any) => t._id === tableId);
        if (table) {
          setTableName(table.name);
          if (table.status !== 'playing') {
            setTableError('Bàn chưa được mở. Vui lòng liên hệ nhân viên.');
          }
        } else {
          setTableError('Không tìm thấy bàn.');
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setTableError('Không thể tải dữ liệu. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tableId]);

  const categories = ['Tất cả', ...Array.from(new Set(menuItems.map(item => item.category)))];
  const filteredItems = activeCategory === 'Tất cả' ? menuItems : menuItems.filter(item => item.category === activeCategory);

  const addToCart = (item: MenuItem) => {
    setResult(null);
    const existing = cart.find(c => c.menuItemId === item._id);
    if (existing) {
      setCart(cart.map(c => c.menuItemId === item._id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { menuItemId: item._id, name: item.name, price: item.price, quantity: 1 }]);
    }
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCart(cart.map(c => {
      if (c.menuItemId === menuItemId) {
        const newQ = c.quantity + delta;
        return newQ > 0 ? { ...c, quantity: newQ } : null;
      }
      return c;
    }).filter(Boolean) as CartItem[]);
  };

  const totalAmount = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const totalItems = cart.reduce((sum, c) => sum + c.quantity, 0);

  const handleSubmit = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch('/api/pos/order-from-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId,
          items: cart.map(c => ({ menuItemId: c.menuItemId, quantity: c.quantity })),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult({ type: 'success', message: data.message || 'Đã gửi đơn hàng thành công!' });
        setCart([]);
      } else {
        setResult({ type: 'error', message: data.error || 'Có lỗi xảy ra' });
      }
    } catch (error) {
      setResult({ type: 'error', message: 'Lỗi kết nối. Vui lòng thử lại.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent"></div>
      </div>
    );
  }

  if (tableError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 text-center">
        <AlertCircle className="mb-4 h-16 w-16 text-red-400" />
        <h1 className="mb-2 text-2xl font-bold text-white">Lỗi</h1>
        <p className="text-zinc-400">{tableError}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-lg">
        <div className="mx-auto max-w-lg px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10">
              <Utensils className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Gọi món - {tableName}</h1>
              <p className="text-xs text-zinc-500">Chọn món và gửi đơn hàng</p>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mx-auto max-w-lg overflow-x-auto px-4 pb-3">
          <div className="flex gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-amber-400 text-zinc-950'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Toast */}
      {result && (
        <div className="mx-auto max-w-lg px-4 pt-4">
          <div className={`flex items-center gap-3 rounded-xl p-4 ${
            result.type === 'success' 
              ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border border-red-500/30 bg-red-500/10 text-red-400'
          }`}>
            {result.type === 'success' ? <Check className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
            <p className="text-sm">{result.message}</p>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="mx-auto max-w-lg px-4 pt-4">
        <div className="grid grid-cols-1 gap-3">
          {filteredItems.map(item => {
            const cartItem = cart.find(c => c.menuItemId === item._id);
            return (
              <div
                key={item._id}
                className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                  cartItem
                    ? 'border-amber-400/40 bg-amber-400/5'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-800 text-amber-400">
                    <Coffee className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{item.name}</p>
                    <p className="text-sm font-semibold text-amber-400">{item.price.toLocaleString('vi-VN')}đ</p>
                  </div>
                </div>

                {cartItem ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item._id, -1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 transition-colors hover:bg-zinc-700"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-white">{cartItem.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-zinc-950 transition-colors hover:bg-amber-300"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(item)}
                    className="flex h-10 items-center gap-1.5 rounded-lg bg-zinc-800 px-3 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-400 hover:text-zinc-950"
                  >
                    <Plus className="h-4 w-4" /> Thêm
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Cart Footer */}
      {cart.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-lg">
          <div className="mx-auto max-w-lg px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-400">
                <ShoppingCart className="h-4 w-4" />
                <span className="text-sm">{totalItems} món</span>
              </div>
              <span className="text-lg font-bold text-amber-400">{totalAmount.toLocaleString('vi-VN')}đ</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3.5 text-base font-bold text-zinc-950 transition-all hover:bg-amber-300 disabled:opacity-50"
            >
              {submitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent"></div>
              ) : (
                <Send className="h-5 w-5" />
              )}
              {submitting ? 'Đang gửi...' : 'Gửi đơn hàng'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
