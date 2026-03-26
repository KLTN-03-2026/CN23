'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, QrCode, CreditCard, Banknote, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageData: {
    name: string;
    durationMonths: number;
    price: number;
  } | null;
}

export default function CheckoutModal({ isOpen, onClose, packageData }: CheckoutModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'cash' | 'card'>('qr');
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  const [orderId, setOrderId] = useState<string | null>(null);

  if (!isOpen || !packageData) return null;

  const handleApplyDiscount = () => {
    if (discountCode.toUpperCase() === 'LUXE50') {
      setDiscountApplied(true);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsProcessing(true);
    setOrderStatus('pending');

    try {
      // Step 4: Processing - Create Order
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          customerName: user.name,
          packageName: packageData.name,
          durationMonths: packageData.durationMonths,
          amount: grandTotal,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setOrderId(data.order._id);

      // Simulate payment gateway redirect/processing time
      setTimeout(async () => {
        try {
          // Step 5: Confirmation & Activation (Webhook simulation)
          const payRes = await fetch(`/api/orders/${data.order._id}/pay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'success' }),
          });

          if (!payRes.ok) throw new Error('Payment failed');

          setOrderStatus('success');
          setTimeout(() => {
            setOrderStatus('idle');
            onClose();
            router.push('/dashboard'); // Redirect to dashboard to see updated membership
          }, 3000);
        } catch (error) {
          setOrderStatus('failed');
        }
      }, 2000);

    } catch (error) {
      console.error('Checkout error:', error);
      setOrderStatus('failed');
      setIsProcessing(false);
    }
  };

  const discountAmount = discountApplied ? 50000 : 0;
  const grandTotal = packageData.price - discountAmount;
  const pointsEarned = Math.floor(grandTotal / 10000);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      {orderStatus === 'success' ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-500/30 bg-zinc-950 p-10 shadow-[0_0_50px_rgba(16,185,129,0.2)] text-center max-w-md">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Thanh toán thành công!</h2>
          <p className="text-zinc-400 mb-4">Gói <span className="text-amber-400 font-bold">{packageData.name}</span> đã được kích hoạt cho tài khoản của bạn.</p>
          <div className="rounded-lg bg-zinc-900 p-4 w-full border border-zinc-800">
            <p className="text-sm text-zinc-400 flex justify-between">Mã đơn hàng: <span className="text-white font-mono">{orderId?.substring(0, 8)}</span></p>
            <p className="text-sm text-zinc-400 flex justify-between mt-2">Điểm Lì Xì nhận được: <span className="text-amber-400 font-bold">+{pointsEarned}</span></p>
          </div>
        </div>
      ) : orderStatus === 'failed' ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-500/30 bg-zinc-950 p-10 shadow-[0_0_50px_rgba(244,63,94,0.2)] text-center max-w-md">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/20">
            <AlertCircle className="h-10 w-10 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Thanh toán thất bại!</h2>
          <p className="text-zinc-400 mb-6">Đã có lỗi xảy ra trong quá trình xử lý giao dịch. Vui lòng thử lại.</p>
          <button 
            onClick={() => { setOrderStatus('idle'); setIsProcessing(false); }}
            className="rounded-lg bg-zinc-800 px-6 py-3 text-sm font-bold text-white hover:bg-zinc-700 w-full"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <div className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111] shadow-2xl md:flex-row">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-zinc-800/50 p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Left Column: Order Details */}
          <div className="flex flex-1 flex-col overflow-y-auto border-r border-white/10 bg-[#1A1A1A] p-6 md:w-1/2">
            <h2 className="mb-6 text-2xl font-bold text-white">Chi tiết đơn hàng</h2>
            
            <div className="mb-6 rounded-xl border border-amber-400/30 bg-amber-400/5 p-6 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-400/10 blur-2xl"></div>
              <h3 className="text-xl font-bold text-amber-400 mb-2">{packageData.name}</h3>
              <p className="text-zinc-400 mb-4">Thời hạn: {packageData.durationMonths} tháng</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">{packageData.price.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="mb-4 font-bold text-white">Thông tin khách hàng</h3>
              {user ? (
                <div className="rounded-xl border border-white/5 bg-black/20 p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-500">Họ tên:</span>
                    <span className="text-sm font-medium text-white">{user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-500">Email:</span>
                    <span className="text-sm font-medium text-white">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-500">Điểm hiện tại:</span>
                    <span className="text-sm font-medium text-amber-400">{user.points || 0} điểm</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-800/20 p-6 text-center">
                  <p className="text-sm text-zinc-400 mb-4">Bạn cần đăng nhập để tiếp tục thanh toán</p>
                  <button 
                    onClick={() => router.push('/login')}
                    className="rounded-lg bg-amber-400 px-6 py-2 text-sm font-bold text-zinc-950 hover:bg-amber-300"
                  >
                    Đăng nhập ngay
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Payment */}
          <div className="flex flex-col overflow-y-auto bg-[#111] p-6 md:w-1/2">
            <h2 className="mb-6 text-xl font-bold text-white">Thanh toán</h2>

            {/* Subtotal & Discount */}
            <div className="mb-6 space-y-3 border-b border-white/10 pb-6">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Tạm tính</span>
                <span className="font-medium text-white">{packageData.price.toLocaleString('vi-VN')}đ</span>
              </div>
              
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="Mã giảm giá (VD: LUXE50)"
                  disabled={discountApplied}
                  className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
                />
                <button 
                  onClick={handleApplyDiscount}
                  disabled={!discountCode || discountApplied}
                  className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 whitespace-nowrap"
                >
                  Áp dụng
                </button>
              </div>
              
              {discountApplied && (
                <div className="flex justify-between text-sm text-emerald-400 pt-2">
                  <span>Giảm giá</span>
                  <span className="font-bold">- {discountAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="mb-8 flex items-end justify-between">
              <div>
                <span className="block text-lg font-bold text-zinc-300">TỔNG CỘNG</span>
                <span className="text-xs text-amber-400">Nhận {pointsEarned} Điểm Lì Xì</span>
              </div>
              <span className="text-4xl font-black tracking-tight text-amber-400">
                {grandTotal.toLocaleString('vi-VN')}đ
              </span>
            </div>

            {/* Payment Methods */}
            <div className="mb-auto">
              <label className="mb-3 block text-sm font-medium text-zinc-400">Phương thức thanh toán</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPaymentMethod('qr')}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-all ${
                    paymentMethod === 'qr' 
                      ? 'border-[#c81e31] bg-[#c81e31]/10 text-[#c81e31]' 
                      : 'border-white/10 bg-black/20 text-zinc-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  <QrCode className="h-6 w-6" />
                  <span className="text-xs font-medium text-center">Quét mã QR</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-all ${
                    paymentMethod === 'cash' 
                      ? 'border-[#c81e31] bg-[#c81e31]/10 text-[#c81e31]' 
                      : 'border-white/10 bg-black/20 text-zinc-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  <Banknote className="h-6 w-6" />
                  <span className="text-xs font-medium text-center">Tiền mặt</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-all ${
                    paymentMethod === 'card' 
                      ? 'border-[#c81e31] bg-[#c81e31]/10 text-[#c81e31]' 
                      : 'border-white/10 bg-black/20 text-zinc-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  <CreditCard className="h-6 w-6" />
                  <span className="text-xs font-medium text-center">Thẻ tín dụng / Ghi nợ</span>
                </button>
              </div>

              {/* Credit Card Expandable Form */}
              {paymentMethod === 'card' && (
                <div className="mt-4 rounded-xl border border-[#c81e31] bg-[#1a0f12] p-5 overflow-hidden transition-all">
                  <div className="mb-4 flex items-center gap-2 text-xs text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    <span>Thông tin thẻ được mã hóa an toàn</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-full">
                      <label className="mb-1 block text-sm text-gray-300">Số thẻ</label>
                      <input 
                        type="text" 
                        placeholder="0000 0000 0000 0000" 
                        className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-white focus:border-[#c81e31] focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="mb-1 block text-sm text-gray-300">Ngày hết hạn</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY" 
                        className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-white focus:border-[#c81e31] focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="mb-1 block text-sm text-gray-300">Mã bảo mật (CVV)</label>
                      <input 
                        type="text" 
                        placeholder="123" 
                        className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-white focus:border-[#c81e31] focus:outline-none"
                      />
                    </div>
                    
                    <div className="col-span-full">
                      <label className="mb-1 block text-sm text-gray-300">Tên in trên thẻ</label>
                      <input 
                        type="text" 
                        placeholder="NGUYEN VAN A" 
                        className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-white focus:border-[#c81e31] focus:outline-none uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Pending State Displays */}
              {orderStatus === 'pending' && paymentMethod === 'qr' && (
                <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/5 p-6">
                  <div className="mb-4 rounded-lg bg-white p-2">
                    <Image 
                      src="https://img.upanh.tv/2025/03/13/z6398935400902_32f2c8d289945037060372ee0204724a.jpg" 
                      alt="QR Code" 
                      width={200} 
                      height={200}
                      className="w-48 h-48 object-contain" 
                      unoptimized
                    />
                  </div>
                  <p className="text-sm font-bold text-amber-400 mb-1 animate-pulse">Đang chờ thanh toán...</p>
                  <p className="text-xs text-zinc-400 text-center">Vui lòng quét mã QR bằng ứng dụng ngân hàng của bạn. Hệ thống sẽ tự động xác nhận.</p>
                </div>
              )}

              {orderStatus === 'pending' && paymentMethod === 'cash' && (
                <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/5 p-6 animate-pulse">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-400/20">
                    <Banknote className="h-10 w-10 text-amber-400" />
                  </div>
                  <p className="text-sm font-bold text-amber-400 mb-1">Đang chờ thanh toán...</p>
                  <p className="text-xs text-zinc-400 text-center">Vui lòng thanh toán bằng tiền mặt tại quầy thu ngân để hoàn tất giao dịch.</p>
                </div>
              )}

              {orderStatus === 'pending' && paymentMethod === 'card' && (
                <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/5 p-6 animate-pulse">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-400/20">
                    <CreditCard className="h-10 w-10 text-amber-400" />
                  </div>
                  <p className="text-sm font-bold text-amber-400 mb-1">Đang xử lý thẻ...</p>
                  <p className="text-xs text-zinc-400 text-center">Hệ thống đang kết nối với cổng thanh toán. Vui lòng không đóng cửa sổ này.</p>
                </div>
              )}
            </div>

            {/* Action Button */}
            {orderStatus !== 'pending' && (
              <button
                onClick={handleCheckout}
                disabled={isProcessing || !user}
                className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#c81e31] py-4 text-lg font-bold text-white transition-all hover:bg-red-700 disabled:opacity-50"
              >
                Thanh toán {grandTotal.toLocaleString('vi-VN')}đ
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
