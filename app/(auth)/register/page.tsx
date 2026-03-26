'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Smartphone, Mail, Lock, LockKeyhole, ArrowRight, CircleDot } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.error || 'Đăng ký thất bại');
      }

      login(data.user);

      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#102222] text-slate-100 font-sans min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 flex justify-center items-center overflow-hidden">
        <div className="absolute w-[800px] h-[800px] bg-[#0df2f2]/20 rounded-full blur-[120px] -top-64 -right-64"></div>
        <div className="absolute w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[100px] -bottom-48 -left-48"></div>
      </div>

      {/* Header / Nav */}
      <div className="relative z-10 w-full flex-col flex h-auto min-h-screen">
        <div className="flex h-full grow flex-col">
          <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-5">
            <div className="flex flex-col w-full max-w-[1200px] flex-1">
              <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#0df2f2]/20 px-4 md:px-10 py-4 mb-8">
                <Link href="/" className="flex items-center gap-2 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                  <CircleDot className="h-6 w-6" />
                  <span className="text-xl font-bold uppercase tracking-wider">Luxe Bida</span>
                </Link>
                <div className="hidden md:flex flex-1 justify-end gap-8">
                  <div className="flex items-center gap-8">
                    <Link className="text-slate-300 hover:text-[#0df2f2] transition-colors text-sm font-medium leading-normal" href="/">Trang chủ</Link>
                    <Link className="text-slate-300 hover:text-[#0df2f2] transition-colors text-sm font-medium leading-normal" href="/services">Dịch vụ</Link>
                    <Link className="text-slate-300 hover:text-[#0df2f2] transition-colors text-sm font-medium leading-normal" href="/booking">Đặt bàn</Link>
                    <Link className="text-slate-300 hover:text-[#0df2f2] transition-colors text-sm font-medium leading-normal" href="/news">Tin tức</Link>
                    <Link className="text-slate-300 hover:text-[#0df2f2] transition-colors text-sm font-medium leading-normal" href="/contact">Liên hệ</Link>
                  </div>
                  <div className="flex gap-3">
                    <Link href="/login" className="flex items-center justify-center rounded-lg h-10 px-5 border border-[#0df2f2]/50 text-[#0df2f2] hover:bg-[#0df2f2]/10 transition-colors text-sm font-bold">
                      Đăng nhập
                    </Link>
                    <Link href="/register" className="flex items-center justify-center rounded-lg h-10 px-5 bg-[#0df2f2] text-[#102222] text-sm font-bold shadow-[0_0_15px_rgba(13,242,242,0.4)]">
                      Đăng ký
                    </Link>
                  </div>
                </div>
              </header>

              {/* Main Content */}
              <main className="flex-1 flex items-center justify-center py-10 px-4">
                <div className="w-full max-w-[540px]">
                  {/* Glassmorphism Container */}
                  <div className="relative bg-[#152e2e]/60 backdrop-blur-xl border border-[#0df2f2]/20 rounded-2xl p-8 shadow-2xl overflow-hidden">
                    {/* Decorative header */}
                    <div className="text-center mb-8 relative z-10">
                      <h1 className="text-3xl font-black leading-tight tracking-tight mb-2 text-white">Đăng Ký Thành Viên</h1>
                      <p className="text-[#0df2f2]/80 text-sm font-medium">Tham gia ngay để trải nghiệm đẳng cấp bida thượng lưu</p>
                    </div>

                    {error && (
                      <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleRegister} className="flex flex-col gap-5 relative z-10">
                      <label className="flex flex-col w-full group">
                        <span className="text-slate-300 text-sm font-medium leading-normal pb-1.5 flex items-center gap-2">
                          <User className="w-4 h-4 text-[#0df2f2]/70" /> Họ và tên
                        </span>
                        <input 
                          className="w-full rounded-lg text-white border border-[#0df2f2]/20 bg-[#102323] focus:border-[#0df2f2] focus:outline-none focus:ring-1 focus:ring-[#0df2f2] h-12 px-4 placeholder:text-slate-500 transition-all duration-300" 
                          placeholder="Nhập họ và tên của bạn" 
                          required 
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <label className="flex flex-col w-full group">
                          <span className="text-slate-300 text-sm font-medium leading-normal pb-1.5 flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-[#0df2f2]/70" /> Số điện thoại
                          </span>
                          <input 
                            className="w-full rounded-lg text-white border border-[#0df2f2]/20 bg-[#102323] focus:border-[#0df2f2] focus:outline-none focus:ring-1 focus:ring-[#0df2f2] h-12 px-4 placeholder:text-slate-500 transition-all duration-300" 
                            placeholder="Nhập số điện thoại" 
                            required 
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </label>
                        <label className="flex flex-col w-full group">
                          <span className="text-slate-300 text-sm font-medium leading-normal pb-1.5 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-[#0df2f2]/70" /> Email
                          </span>
                          <input 
                            className="w-full rounded-lg text-white border border-[#0df2f2]/20 bg-[#102323] focus:border-[#0df2f2] focus:outline-none focus:ring-1 focus:ring-[#0df2f2] h-12 px-4 placeholder:text-slate-500 transition-all duration-300" 
                            placeholder="Nhập địa chỉ email" 
                            required 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <label className="flex flex-col w-full group">
                          <span className="text-slate-300 text-sm font-medium leading-normal pb-1.5 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-[#0df2f2]/70" /> Mật khẩu
                          </span>
                          <input 
                            className="w-full rounded-lg text-white border border-[#0df2f2]/20 bg-[#102323] focus:border-[#0df2f2] focus:outline-none focus:ring-1 focus:ring-[#0df2f2] h-12 px-4 placeholder:text-slate-500 transition-all duration-300" 
                            placeholder="Tạo mật khẩu" 
                            required 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </label>
                        <label className="flex flex-col w-full group">
                          <span className="text-slate-300 text-sm font-medium leading-normal pb-1.5 flex items-center gap-2">
                            <LockKeyhole className="w-4 h-4 text-[#0df2f2]/70" /> Xác nhận mật khẩu
                          </span>
                          <input 
                            className="w-full rounded-lg text-white border border-[#0df2f2]/20 bg-[#102323] focus:border-[#0df2f2] focus:outline-none focus:ring-1 focus:ring-[#0df2f2] h-12 px-4 placeholder:text-slate-500 transition-all duration-300" 
                            placeholder="Nhập lại mật khẩu" 
                            required 
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </label>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="relative flex items-start">
                          <div className="flex h-6 items-center">
                            <input className="h-5 w-5 rounded border-amber-500/50 bg-[#102323] text-amber-500 focus:ring-amber-500 focus:ring-offset-0 transition-colors cursor-pointer" id="terms" name="terms" required type="checkbox" />
                          </div>
                          <div className="ml-3 text-sm leading-6">
                            <label className="text-slate-300 font-medium cursor-pointer" htmlFor="terms">Tôi đồng ý với <Link className="text-amber-500 hover:text-amber-400 underline decoration-amber-500/30 underline-offset-2" href="#">điều khoản và chính sách</Link> của Luxe Bida</label>
                          </div>
                        </div>
                      </div>
                      <button 
                        className="mt-4 flex w-full cursor-pointer items-center justify-center rounded-xl h-14 bg-[#0df2f2] text-[#102222] text-base font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(13,242,242,0.3)] hover:shadow-[0_0_30px_rgba(13,242,242,0.6)] hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group disabled:opacity-50" 
                        type="submit"
                        disabled={isLoading}
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          {isLoading ? 'Đang xử lý...' : 'Tham gia ngay'}
                          {!isLoading && <ArrowRight className="w-5 h-5" />}
                        </span>
                      </button>
                      <div className="text-center mt-4 text-sm text-slate-400">
                        Đã có tài khoản? <Link className="text-[#0df2f2] font-semibold hover:underline underline-offset-4" href="/login">Đăng nhập</Link>
                      </div>
                    </form>
                  </div>
                </div>
              </main>
              <footer className="text-center py-6 text-slate-500 text-sm">
                © 2024 Luxe Bida. Đẳng cấp làm nên thương hiệu.
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
