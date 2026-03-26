'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gamepad2, User, Lock, Eye, EyeOff, ArrowRight, CircleDot } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Đăng nhập thất bại');

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
    <div className="bg-[#0F0F0F] text-slate-100 font-sans min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(242, 204, 13, 0.05) 0%, transparent 60%)' }}>
      {/* Floating Gold Particles */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-[#f2cc0d] shadow-[0_0_10px_2px_#f2cc0d]"></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 rounded-full bg-[#f2cc0d] shadow-[0_0_8px_1.5px_#f2cc0d]"></div>
        <div className="absolute bottom-1/4 left-1/3 w-2.5 h-2.5 rounded-full bg-[#f2cc0d] shadow-[0_0_12px_2.5px_#f2cc0d]"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 rounded-full bg-[#f2cc0d] shadow-[0_0_6px_1px_#f2cc0d]"></div>
      </div>

      {/* Top Navigation */}
      <header className="w-full flex items-center justify-between px-6 md:px-10 py-4 border-b border-white/10 relative z-10 bg-[#141414]/60 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
          <CircleDot className="h-6 w-6" />
          <span className="text-xl font-bold uppercase tracking-wider">Luxe Bida</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-medium text-slate-300 hover:text-[#f2cc0d] transition-colors">Trang chủ</Link>
          <Link href="/#pricing" className="text-sm font-medium text-slate-300 hover:text-[#f2cc0d] transition-colors">Bảng giá</Link>
          <div className="w-px h-5 bg-white/10 mx-2"></div>
          <Link href="/login" className="text-sm font-medium text-[#f2cc0d] hover:text-[#f2cc0d]/80 transition-colors">Đăng nhập</Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="bg-[#141414]/60 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
            {/* Logo & Header */}
            <div className="flex flex-col items-center mb-8">
                <div className="w-20 h-20 mb-6 relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-[#f2cc0d]/20 rounded-full blur-xl"></div>
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center relative z-10 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    <CircleDot className="text-[#0F0F0F] w-8 h-8" />
                  </div>
                </div>
              <h1 className="text-2xl font-bold text-center text-slate-100 mb-2">Chào mừng trở lại</h1>
              <p className="text-slate-400 text-sm text-center">Đăng nhập để tiếp tục trải nghiệm Luxe Bida</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email/Phone Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300" htmlFor="email">Email hoặc Số điện thoại</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="text-slate-400 w-5 h-5" />
                  </div>
                  <input 
                    className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00f0ff] focus:border-[#00f0ff] transition-all sm:text-sm" 
                    id="email" 
                    name="email" 
                    placeholder="Nhập email hoặc số điện thoại" 
                    required 
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-300" htmlFor="password">Mật khẩu</label>
                  <Link className="text-xs font-medium text-[#f2cc0d] hover:text-[#f2cc0d]/80 transition-colors" href="/forgot-password">Quên mật khẩu?</Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-slate-400 w-5 h-5" />
                  </div>
                  <input 
                    className="block w-full pl-10 pr-10 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00f0ff] focus:border-[#00f0ff] transition-all sm:text-sm" 
                    id="password" 
                    name="password" 
                    placeholder="Nhập mật khẩu" 
                    required 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-slate-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input className="h-4 w-4 text-[#f2cc0d] focus:ring-[#f2cc0d] border-white/10 rounded bg-white/5" id="remember-me" name="remember-me" type="checkbox" />
                <label className="ml-2 block text-sm text-slate-300" htmlFor="remember-me">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              {/* Submit Button */}
              <div>
                <button 
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-[0_0_15px_rgba(242,204,13,0.3)] text-sm font-bold text-[#0F0F0F] bg-[#f2cc0d] hover:bg-[#ffe54c] hover:shadow-[0_0_25px_rgba(242,204,13,0.5)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f2cc0d] focus:ring-offset-[#0F0F0F] transition-all duration-300 relative overflow-hidden group disabled:opacity-50" 
                  type="submit"
                  disabled={isLoading}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                  </span>
                </button>
              </div>
            </form>

            {/* Divider */}
            {/* Social Login removed as requested */}

            {/* Sign Up Link */}
            <div className="mt-8 text-center text-sm text-slate-400">
              Chưa có tài khoản? 
              <Link className="font-bold text-[#f2cc0d] hover:text-[#ffe54c] transition-colors ml-1" href="/register">Đăng ký ngay</Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-500 relative z-10">
        <p>© 2024 Luxe Bida. All rights reserved.</p>
      </footer>
    </div>
  );
}
