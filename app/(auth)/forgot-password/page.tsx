'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircleDot, LockKeyhole, Mail, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Gửi yêu cầu thất bại');

      // For demo purposes, we just show success. 
      // In production, we'd redirect to verify-code page.
      alert('Mã xác nhận đã được gửi đến email của bạn!');
      router.push('/verify-code');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#221f10] text-slate-100 font-sans min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Static Background to represent subtle golden floating particles */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] bg-[#f2cc0d]/5 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[600px] h-[600px] bg-[#f2cc0d]/10 rounded-full blur-[150px]"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[400px] h-[400px] bg-[#f2cc0d]/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Top Navigation Area */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <Link href="/" className="flex items-center gap-2 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
          <CircleDot className="h-6 w-6" />
          <span className="text-xl font-bold uppercase tracking-wider">Luxe Bida</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Glassmorphism Card */}
        <div className="w-full max-w-[460px] relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#f2cc0d]/10 via-[#f2cc0d]/5 to-[#f2cc0d]/10 rounded-[1.5rem] blur-xl opacity-50"></div>
          <div className="relative bg-[#221f10]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 sm:p-10 shadow-2xl">
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-[#f2cc0d]/20 to-[#f2cc0d]/5 rounded-full flex items-center justify-center border border-[#f2cc0d]/20 text-[#f2cc0d] mb-6 shadow-[0_0_20px_rgba(242,204,13,0.15)]">
                <LockKeyhole className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold text-slate-100 mb-3 tracking-tight">Khôi phục mật khẩu</h1>
              <p className="text-slate-400 text-sm leading-relaxed px-4">
                Nhập email của bạn để khôi phục mật khẩu
              </p>
            </div>
            {/* Form */}
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-6">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="email">Địa chỉ Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-[#f2cc0d] transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input 
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#f2cc0d] focus:ring-1 focus:ring-[#f2cc0d] focus:shadow-[0_0_15px_rgba(242,204,13,0.3)] transition-all duration-300 block" 
                    id="email" 
                    name="email" 
                    placeholder="name@example.com" 
                    required 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              {/* Button */}
              <button 
                className="mt-2 w-full bg-[#f2cc0d] hover:bg-[#ffe54c] text-[#221f10] font-bold text-[15px] py-4 rounded-xl shadow-[0_4px_14px_0_rgba(242,204,13,0.3)] hover:shadow-[0_6px_20px_rgba(242,204,13,0.4)] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group" 
                type="submit"
                disabled={isLoading}
              >
                <span>{isLoading ? 'Đang gửi...' : 'Gửi mã xác nhận'}</span>
                {!isLoading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
            {/* Footer Link */}
            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <Link className="inline-flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-[#f2cc0d] transition-colors font-medium" href="/login">
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại đăng nhập</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
