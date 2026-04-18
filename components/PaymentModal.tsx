'use client';

import { useState, useEffect } from 'react';
import { X, Clock, Trash2, QrCode, CreditCard, Banknote, Tag, CheckCircle2, Search, User, Wallet } from 'lucide-react';
import Image from 'next/image';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableData?: any;
  sessionData?: any;
  onCheckoutSuccess?: (tableId: string) => void;
}

export default function PaymentModal({ isOpen, onClose, tableData, sessionData, onCheckoutSuccess }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qr' | 'card' | 'wallet'>('cash');
  const [walletError, setWalletError] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [customerPhone, setCustomerPhone] = useState('');
  const [customer, setCustomer] = useState<any>(null);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [customerError, setCustomerError] = useState('');

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (isOpen) {
      setCurrentTime(new Date());
      setCustomer(null);
      setCustomerPhone('');
      setCustomerError('');
      setDiscountCode('');
      setDiscountApplied(false);
      setPaymentMethod('cash');
    }
  }, [isOpen]);

  if (!isOpen || !tableData) return null;

  const safeSessionData = sessionData || {
    _id: 'mock_session',
    startTime: tableData?.updatedAt || new Date(Date.now() - 3600000).toISOString(),
    orders: []
  };

  const handleSearchCustomer = async () => {
    if (!customerPhone) return;
    setIsSearchingCustomer(true);
    setCustomerError('');
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const users = await res.json();
        const foundUser = users.find((u: any) => u.phone === customerPhone);
        if (foundUser) {
          setCustomer(foundUser);
        } else {
          setCustomerError('Không tìm thấy khách hàng');
          setCustomer(null);
        }
      }
    } catch (error) {
      console.error('Failed to search customer:', error);
      setCustomerError('Lỗi tìm kiếm');
    } finally {
      setIsSearchingCustomer(false);
    }
  };

  const handleApplyDiscount = () => {
    if (discountCode.toUpperCase() === 'LUXE50') {
      setDiscountApplied(true);
    }
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      if (safeSessionData._id === 'mock_session') {
        // If it's a mock session, just update the table status to empty directly
        const res = await fetch(`/api/tables/${tableData._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'empty' })
        });
        if (res.ok) {
          setIsSuccess(true);
          setTimeout(() => {
            setIsSuccess(false);
            if (onCheckoutSuccess) {
              onCheckoutSuccess(tableData._id);
            } else {
              onClose();
            }
          }, 2000);
        }
        return;
      }

      const res = await fetch(`/api/pos/sessions/${safeSessionData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          endTime: new Date().toISOString(),
          totalAmount: grandTotal,
          tableTimeAmount: timeTotal,
          paymentMethod: paymentMethod,
          customerName: customer ? customer.name : 'Khách lẻ',
          customerId: customer ? customer._id : null,
          customerPhone: customer ? customer.phone : null,
          durationInHours: durationInHours
        })
      });

      if (res.ok) {
        setIsSuccess(true);
        setWalletError('');
        setTimeout(() => {
          setIsSuccess(false);
          if (onCheckoutSuccess) {
            onCheckoutSuccess(tableData._id);
          } else {
            onClose();
          }
        }, 2000);
      } else {
        const errData = await res.json();
        if (paymentMethod === 'wallet') {
          setWalletError(errData.message || 'Số dư ví không đủ');
        }
        console.error('Checkout failed:', errData.message);
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculations
  const startTime = new Date(safeSessionData.startTime);
  const diffMs = Math.max(0, currentTime.getTime() - startTime.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  const durationStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  const durationInHours = diffMs / (1000 * 60 * 60);
  
  // Apply membership logic: if customer has membership, table fee is 0
  const hasMembership = customer && customer.membershipType && customer.membershipType !== 'Thành viên Tiêu chuẩn';
  const timeTotal = hasMembership ? 0 : Math.round(durationInHours * tableData.pricePerHour);
  
  const fbItems = safeSessionData.orders || [];
  const fbTotal = fbItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
  const subTotal = timeTotal + fbTotal;
  const discountAmount = discountApplied ? 50000 : 0;
  const grandTotal = Math.max(0, subTotal - discountAmount);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-500/30 bg-zinc-950 p-10 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Thanh toán thành công!</h2>
          <p className="mt-2 text-zinc-400">Hóa đơn đã được lưu vào hệ thống.</p>
        </div>
      ) : (
        <div className="relative flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111] shadow-2xl md:flex-row">
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-zinc-800/50 p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Left Column: Invoice Details */}
          <div className="flex flex-1 flex-col overflow-y-auto border-r border-white/10 bg-[#1A1A1A] p-6 md:w-7/12">
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">{tableData.name}</h2>
                <p className="text-sm text-zinc-400">{tableData.type}</p>
              </div>
              <div className="rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5">
                <span className="text-sm font-bold text-amber-400">Đang thanh toán</span>
              </div>
            </div>
            
            {/* Customer Search */}
            <div className="mb-6 rounded-xl border border-white/5 bg-black/20 p-4">
              <h3 className="mb-3 flex items-center gap-2 font-bold text-white">
                <User className="h-5 w-5 text-amber-400" /> Khách hàng
              </h3>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Nhập số điện thoại khách hàng"
                    className="w-full rounded-lg border border-white/10 bg-black/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <button 
                  onClick={handleSearchCustomer}
                  disabled={isSearchingCustomer || !customerPhone}
                  className="rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
                >
                  {isSearchingCustomer ? 'Đang tìm...' : 'Tìm kiếm'}
                </button>
              </div>
              {customerError && <p className="mt-2 text-sm text-rose-500">{customerError}</p>}
              {customer && (
                <div className="mt-3 flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
                  <div>
                    <p className="font-medium text-emerald-400">{customer.name}</p>
                    <p className="text-xs text-emerald-500/80">{customer.phone} - {customer.membershipType}</p>
                  </div>
                  {hasMembership && (
                    <span className="rounded bg-emerald-500/20 px-2 py-1 text-xs font-bold text-emerald-400">
                      Miễn phí tiền bàn
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Billiards Time */}
            <div className="mb-6 rounded-xl border border-white/5 bg-black/20 p-4">
              <h3 className="mb-3 flex items-center gap-2 font-bold text-white">
                <Clock className="h-5 w-5 text-amber-400" /> Tiền giờ chơi
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-zinc-500">Bắt đầu - Hiện tại</p>
                  <p className="font-medium text-zinc-200">{startTime.toLocaleTimeString()} - {currentTime.toLocaleTimeString()}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Tổng thời gian</p>
                  <p className="font-mono font-bold text-rose-500">{durationStr}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Loại bàn & Đơn giá</p>
                  <p className="font-medium text-zinc-200">{tableData.type} - {tableData.pricePerHour.toLocaleString('vi-VN')}đ/giờ</p>
                </div>
                <div>
                  <p className="text-zinc-500">Thành tiền giờ</p>
                  <p className={`font-bold ${hasMembership ? 'text-emerald-400 line-through' : 'text-white'}`}>
                    {Math.round(durationInHours * tableData.pricePerHour).toLocaleString('vi-VN')}đ
                  </p>
                  {hasMembership && <p className="text-xs font-bold text-emerald-400">0đ (Gói thành viên)</p>}
                </div>
              </div>
            </div>

            {/* F&B Services */}
            <div className="flex-1 rounded-xl border border-white/5 bg-black/20 p-4">
              <h3 className="mb-4 font-bold text-white">Dịch vụ F&B</h3>
              
              <div className="space-y-3">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 border-b border-white/10 pb-2 text-xs font-medium text-zinc-500">
                  <div className="col-span-6">Tên món</div>
                  <div className="col-span-2 text-center">Số lượng</div>
                  <div className="col-span-4 text-right">Thành tiền</div>
                </div>

                {/* Items */}
                {fbItems.length === 0 ? (
                  <p className="text-center text-sm text-zinc-500 italic py-4">Chưa gọi món nào</p>
                ) : (
                  fbItems.map((item: any) => (
                    <div key={item._id} className="grid grid-cols-12 items-center gap-2 border-b border-white/5 pb-3 text-sm">
                      <div className="col-span-6 font-medium text-zinc-200">{item.name}</div>
                      <div className="col-span-2 text-center text-white">{item.quantity}</div>
                      <div className="col-span-4 text-right font-medium text-zinc-200">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Panel */}
          <div className="flex flex-col bg-[#111] p-6 md:w-5/12 overflow-y-auto">
            <h2 className="mb-6 text-xl font-bold text-white">Tổng kết thanh toán</h2>

            {/* Subtotal */}
            <div className="mb-6 space-y-3 border-b border-white/10 pb-6">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Tiền giờ chơi</span>
                <span className="font-medium text-white">{timeTotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Tiền dịch vụ F&B</span>
                <span className="font-medium text-white">{fbTotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="font-medium text-zinc-300">Tạm tính</span>
                <span className="font-bold text-white">{subTotal.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            {/* Promotions */}
            <div className="mb-6 border-b border-white/10 pb-6">
              <label className="mb-2 block text-sm font-medium text-zinc-400">Mã giảm giá (Voucher)</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Nhập mã (VD: LUXE50)"
                    disabled={discountApplied}
                    className="w-full rounded-lg border border-white/10 bg-black/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 disabled:opacity-50"
                  />
                </div>
                <button 
                  onClick={handleApplyDiscount}
                  disabled={!discountCode || discountApplied}
                  className="rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
                >
                  Áp dụng
                </button>
              </div>
              {discountApplied && (
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-emerald-400">Đã áp dụng mã giảm giá</span>
                  <span className="font-bold text-emerald-400">- {discountAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="mb-8 flex items-end justify-between">
              <span className="text-lg font-bold text-zinc-300">TỔNG CỘNG</span>
              <span className="text-4xl font-black tracking-tight text-amber-400">
                {grandTotal.toLocaleString('vi-VN')}đ
              </span>
            </div>

            {/* Payment Methods */}
            <div className="mb-auto">
              <label className="mb-3 block text-sm font-medium text-zinc-400">Phương thức thanh toán</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setPaymentMethod('cash'); setWalletError(''); }}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-all ${
                    paymentMethod === 'cash' 
                      ? 'border-amber-400 bg-amber-400/10 text-amber-400' 
                      : 'border-white/10 bg-black/20 text-zinc-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  <Banknote className="h-6 w-6" />
                  <span className="text-xs font-medium">Tiền mặt</span>
                </button>
                <button
                  onClick={() => { setPaymentMethod('qr'); setWalletError(''); }}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-all ${
                    paymentMethod === 'qr' 
                      ? 'border-amber-400 bg-amber-400/10 text-amber-400' 
                      : 'border-white/10 bg-black/20 text-zinc-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  <QrCode className="h-6 w-6" />
                  <span className="text-xs font-medium">Mã QR</span>
                </button>
                <button
                  onClick={() => { setPaymentMethod('card'); setWalletError(''); }}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-all ${
                    paymentMethod === 'card' 
                      ? 'border-amber-400 bg-amber-400/10 text-amber-400' 
                      : 'border-white/10 bg-black/20 text-zinc-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  <CreditCard className="h-6 w-6" />
                  <span className="text-xs font-medium">Thẻ ngân hàng</span>
                </button>
                <button
                  onClick={() => { setPaymentMethod('wallet'); setWalletError(''); }}
                  disabled={!customer}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-all ${
                    paymentMethod === 'wallet' 
                      ? 'border-emerald-400 bg-emerald-400/10 text-emerald-400' 
                      : !customer 
                        ? 'border-white/5 bg-black/10 text-zinc-600 cursor-not-allowed'
                        : 'border-white/10 bg-black/20 text-zinc-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  <Wallet className="h-6 w-6" />
                  <span className="text-xs font-medium">Ví nội bộ</span>
                </button>
              </div>

              {/* Wallet Info */}
              {paymentMethod === 'wallet' && customer && (
                <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Số dư ví</span>
                    <span className={`font-bold ${(customer.walletBalance || 0) >= grandTotal ? 'text-emerald-400' : 'text-red-400'}`}>
                      {(customer.walletBalance || 0).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  {(customer.walletBalance || 0) < grandTotal && (
                    <p className="text-xs text-red-400 mt-1">⚠ Số dư không đủ. Cần thêm {(grandTotal - (customer.walletBalance || 0)).toLocaleString('vi-VN')}đ</p>
                  )}
                  {walletError && <p className="text-xs text-red-400 mt-1">❌ {walletError}</p>}
                </div>
              )}
              {paymentMethod === 'wallet' && !customer && (
                <p className="mt-3 text-xs text-amber-400">⚠ Vui lòng tìm kiếm khách hàng trước khi dùng ví nội bộ</p>
              )}

              {/* QR Code Display */}
              {paymentMethod === 'qr' && (
                <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-white/10 bg-black/30 p-4">
                  <div className="mb-2 rounded-lg bg-white p-2">
                    <Image 
                      src="https://img.upanh.tv/2025/03/13/z6398935400902_32f2c8d289945037060372ee0204724a.jpg" 
                      alt="QR Code" 
                      width={128} 
                      height={128}
                      className="w-32 h-32 object-contain" 
                      unoptimized
                    />
                  </div>
                  <p className="text-xs text-zinc-400">Quét mã VietQR để thanh toán</p>
                </div>
              )}

              {/* Credit Card Expandable Form */}
              {paymentMethod === 'card' && (
                <div className="mt-4 rounded-xl border border-amber-400 bg-black/40 p-5 overflow-hidden transition-all">
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
                        className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="mb-1 block text-sm text-gray-300">Ngày hết hạn</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY" 
                        className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="mb-1 block text-sm text-gray-300">Mã bảo mật (CVV)</label>
                      <input 
                        type="text" 
                        placeholder="123" 
                        className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    
                    <div className="col-span-full">
                      <label className="mb-1 block text-sm text-gray-300">Tên in trên thẻ</label>
                      <input 
                        type="text" 
                        placeholder="NGUYEN VAN A" 
                        className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-white focus:border-amber-400 focus:outline-none uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="mt-6 flex w-full items-center justify-center rounded-xl border border-amber-400 bg-amber-400/20 py-4 text-lg font-bold text-amber-400 transition-all hover:bg-amber-400/30 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-t-transparent"></div>
              ) : (
                `Xác nhận thanh toán ${grandTotal.toLocaleString('vi-VN')}đ`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
