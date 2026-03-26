'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

type AuthView = 'login' | 'register' | 'forgot_password' | 'verify_code' | 'reset_password';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [view, setView] = useState<AuthView>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [demoCode, setDemoCode] = useState(''); // For demo purposes

  const resetStates = () => {
    setError('');
    setSuccessMsg('');
    setIsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStates();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Đăng nhập thất bại');

      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStates();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Đăng ký thất bại');

      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStates();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra');

      setSuccessMsg(data.message);
      if (data.demoCode) setDemoCode(data.demoCode); // Show code for demo
      setTimeout(() => {
        setView('verify_code');
        resetStates();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStates();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Mã xác nhận không hợp lệ');

      setView('reset_password');
      resetStates();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStates();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword: password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra');

      setSuccessMsg('Mật khẩu đã được đặt lại thành công!');
      setTimeout(() => {
        setView('login');
        setPassword('');
        resetStates();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#15090c] p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md overflow-hidden bg-transparent"
        >
          {/* Close button - Optional, but good for UX even if not in screenshot */}
          <button
            onClick={onClose}
            className="absolute top-0 right-0 p-2 text-zinc-500 hover:text-white transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="py-8">
            {/* Header */}
            <div className="mb-8">
              {view === 'forgot_password' && (
                <button
                  onClick={() => { setView('login'); resetStates(); }}
                  className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại đăng nhập
                </button>
              )}
              <h2 className="text-4xl font-black text-white mb-3 tracking-tight">
                {view === 'login' && 'Chào mừng trở lại!'}
                {view === 'register' && 'Đăng Ký Tài Khoản'}
                {view === 'forgot_password' && 'Quên mật khẩu?'}
                {view === 'verify_code' && 'Nhập mã xác nhận'}
                {view === 'reset_password' && 'Đặt lại mật khẩu'}
              </h2>
              <p className="text-zinc-400 text-[15px]">
                {view === 'login' && 'Vui lòng đăng nhập vào tài khoản của bạn.'}
                {view === 'register' && 'Tạo tài khoản để bắt đầu hành trình của bạn.'}
                {view === 'forgot_password' && 'Nhập email của bạn để nhận mã xác nhận.'}
                {view === 'verify_code' && `Mã đã được gửi đến ${email}`}
                {view === 'reset_password' && 'Nhập mật khẩu mới cho tài khoản của bạn'}
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-lg text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {successMsg}
              </div>
            )}
            {demoCode && view === 'forgot_password' && (
              <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm rounded-lg text-center">
                (Demo) Mã xác nhận của bạn là: <span className="font-bold text-amber-300">{demoCode}</span>
              </div>
            )}

            {/* Forms */}
            {view === 'login' && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[15px] text-zinc-200">Email hoặc Tên đăng nhập</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 bg-[#2a161b] border border-[#3a262b] rounded-xl text-white focus:outline-none focus:border-[#b91c1c] transition-all placeholder:text-zinc-500"
                    placeholder="Nhập email hoặc tên đăng nhập"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[15px] text-zinc-200">Mật khẩu</label>
                    <button
                      type="button"
                      onClick={() => { setView('forgot_password'); resetStates(); }}
                      className="text-[15px] text-[#e8b024] hover:text-[#f0c34f] transition-colors"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 bg-[#2a161b] border border-[#3a262b] rounded-xl text-white focus:outline-none focus:border-[#b91c1c] transition-all placeholder:text-zinc-500"
                    placeholder="Nhập mật khẩu"
                  />
                </div>
                
                <div className="flex items-center gap-3 pt-1">
                  <input type="checkbox" id="remember" className="w-5 h-5 rounded border-zinc-700 bg-[#2a161b] text-[#b91c1c] focus:ring-[#b91c1c] focus:ring-offset-[#15090c]" />
                  <label htmlFor="remember" className="text-[15px] text-zinc-300">Ghi nhớ đăng nhập</label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 mt-4 bg-[#b91c1c] hover:bg-[#991b1b] text-white font-bold text-lg rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
                  {!isLoading && <ArrowRight className="w-5 h-5" />}
                </button>

                <div className="relative py-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#3a262b]"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-[#15090c] px-4 text-[15px] text-zinc-500">Hoặc đăng nhập với</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button type="button" className="flex items-center justify-center gap-2 py-3.5 bg-[#2a161b] hover:bg-[#3a262b] border border-[#3a262b] rounded-xl text-white font-medium transition-colors">
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                    Facebook
                  </button>
                  <button type="button" className="flex items-center justify-center gap-2 py-3.5 bg-[#2a161b] hover:bg-[#3a262b] border border-[#3a262b] rounded-xl text-white font-medium transition-colors">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" /></svg>
                    Google
                  </button>
                </div>

                <p className="text-center text-zinc-400 text-[15px] mt-8">
                  Chưa có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => { setView('register'); resetStates(); }}
                    className="text-[#e8b024] hover:text-[#f0c34f] font-bold transition-colors"
                  >
                    Đăng ký ngay
                  </button>
                </p>
              </form>
            )}

            {view === 'register' && (
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[15px] text-zinc-200">Họ và tên</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3.5 bg-[#2a161b] border border-[#3a262b] rounded-xl text-white focus:outline-none focus:border-[#b91c1c] transition-all placeholder:text-zinc-500"
                    placeholder="Nhập họ và tên đầy đủ"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[15px] text-zinc-200">Số điện thoại</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3.5 bg-[#2a161b] border border-[#3a262b] rounded-xl text-white focus:outline-none focus:border-[#b91c1c] transition-all placeholder:text-zinc-500"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[15px] text-zinc-200">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 bg-[#2a161b] border border-[#3a262b] rounded-xl text-white focus:outline-none focus:border-[#b91c1c] transition-all placeholder:text-zinc-500"
                    placeholder="Nhập địa chỉ email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[15px] text-zinc-200">Mật khẩu</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 bg-[#2a161b] border border-[#3a262b] rounded-xl text-white focus:outline-none focus:border-[#b91c1c] transition-all placeholder:text-zinc-500"
                    placeholder="Tạo mật khẩu (ít nhất 8 ký tự)"
                  />
                </div>
                
                <div className="flex items-start gap-3 pt-2">
                  <input type="checkbox" required id="terms" className="mt-1 w-5 h-5 rounded border-zinc-700 bg-[#2a161b] text-[#b91c1c] focus:ring-[#b91c1c] focus:ring-offset-[#15090c]" />
                  <label htmlFor="terms" className="text-[15px] text-zinc-400 leading-relaxed">
                    Tôi đồng ý với các <span className="text-[#e8b024]">Điều khoản dịch vụ</span> và <span className="text-[#e8b024]">Chính sách bảo mật</span> của Luxe Bida.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 mt-6 bg-[#b91c1c] hover:bg-[#991b1b] text-white font-bold text-lg rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Đang xử lý...' : 'Đăng Ký Ngay'}
                  {!isLoading && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>
            )}

            {view === 'forgot_password' && (
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[15px] text-zinc-200">Email đăng ký</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-[#2a161b] border border-[#3a262b] rounded-xl text-white focus:outline-none focus:border-[#b91c1c] transition-all placeholder:text-zinc-500"
                      placeholder="Nhập email của bạn"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-[#b91c1c] hover:bg-[#991b1b] text-white font-bold text-lg rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
                  {!isLoading && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>
            )}

            {view === 'verify_code' && (
              <form onSubmit={handleVerifyCode} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[15px] text-zinc-200">Mã xác nhận (6 số)</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-4 bg-[#2a161b] border border-[#3a262b] rounded-xl text-white text-center text-3xl tracking-[0.5em] focus:outline-none focus:border-[#b91c1c] transition-all placeholder:text-zinc-500"
                    placeholder="------"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || code.length !== 6}
                  className="w-full py-4 bg-[#b91c1c] hover:bg-[#991b1b] text-white font-bold text-lg rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Đang xác thực...' : 'Xác thực'}
                  {!isLoading && <ArrowRight className="w-5 h-5" />}
                </button>
                <button
                  type="button"
                  onClick={() => { setView('forgot_password'); resetStates(); }}
                  className="w-full py-3 bg-transparent hover:bg-white/5 text-zinc-300 font-medium rounded-xl transition-colors"
                >
                  Gửi lại mã
                </button>
              </form>
            )}

            {view === 'reset_password' && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[15px] text-zinc-200">Mật khẩu mới</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 bg-[#2a161b] border border-[#3a262b] rounded-xl text-white focus:outline-none focus:border-[#b91c1c] transition-all placeholder:text-zinc-500"
                    placeholder="Tạo mật khẩu mới"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || password.length < 6}
                  className="w-full py-4 bg-[#b91c1c] hover:bg-[#991b1b] text-white font-bold text-lg rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                  {!isLoading && <CheckCircle2 className="w-5 h-5" />}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
