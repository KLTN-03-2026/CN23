import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Phone, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableData: any;
}

export default function BookingModal({ isOpen, onClose, tableData }: BookingModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user, isOpen]);

  if (!isOpen || !tableData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !date || !time) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          phone,
          time: `${time} ngày ${date}`,
          tableType: tableData.type,
          tableId: tableData.id || tableData._id,
          status: 'pending'
        })
      });

      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 2000);
      } else {
        setError('Có lỗi xảy ra, vui lòng thử lại');
      }
    } catch (err) {
      setError('Lỗi kết nối');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-500/30 bg-zinc-950 p-10 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Đặt bàn thành công!</h2>
          <p className="mt-2 text-center text-zinc-400">Yêu cầu của bạn đã được gửi.<br/>Nhân viên sẽ liên hệ xác nhận sớm nhất.</p>
        </div>
      ) : (
        <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#111] p-6 shadow-2xl">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-zinc-800/50 p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          <h2 className="mb-2 text-2xl font-bold text-white">Đặt bàn</h2>
          <p className="mb-6 text-sm text-zinc-400">
            Bạn đang đặt <span className="font-bold text-amber-400">{tableData.name}</span> ({tableData.type})
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Họ và tên</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên của bạn"
                  className="w-full rounded-lg border border-white/10 bg-black/50 py-2.5 pl-10 pr-4 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Số điện thoại</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="w-full rounded-lg border border-white/10 bg-black/50 py-2.5 pl-10 pr-4 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">Ngày</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/50 py-2.5 pl-10 pr-4 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">Giờ</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input 
                    type="time" 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/50 py-2.5 pl-10 pr-4 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-rose-500">{error}</p>}

            <button 
              type="submit"
              disabled={isSubmitting}
              className="mt-4 w-full rounded-lg bg-amber-400 py-3 font-bold text-zinc-950 transition-colors hover:bg-amber-300 disabled:opacity-50"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt bàn'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
