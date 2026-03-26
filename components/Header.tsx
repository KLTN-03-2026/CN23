'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CircleDot, UserCircle, LogOut, ChevronDown, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user, logout, loading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
          <CircleDot className="h-6 w-6" />
          <span className="text-xl font-bold uppercase tracking-wider">Luxe Bida</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-zinc-300 hover:text-amber-400 transition-colors">Trang chủ</Link>
          <Link href="/tables" className="text-sm font-medium text-zinc-300 hover:text-amber-400 transition-colors">Sơ đồ bàn</Link>
          <Link href="/#pricing" className="text-sm font-medium text-zinc-300 hover:text-amber-400 transition-colors">Bảng giá</Link>
          <Link href="/#menu" className="text-sm font-medium text-zinc-300 hover:text-amber-400 transition-colors">Thực đơn</Link>
        </nav>
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent"></div>
          ) : user ? (
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 transition-colors hover:border-amber-400/50 hover:bg-zinc-800"
              >
                <UserCircle className="h-5 w-5 text-amber-400" />
                <span className="text-sm font-medium text-zinc-200">{user.name}</span>
                <ChevronDown className="h-4 w-4 text-zinc-400" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-zinc-800 bg-zinc-950 py-2 shadow-xl">
                  <div className="border-b border-zinc-800 px-4 py-2">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                  </div>
                  
                  <div className="py-1">
                    {user.role === 'admin' ? (
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-amber-400">
                        <LayoutDashboard className="h-4 w-4" />
                        Trang quản trị
                      </Link>
                    ) : (
                      <>
                        <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-amber-400">
                          <LayoutDashboard className="h-4 w-4" />
                          Bảng điều khiển
                        </Link>
                        <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-amber-400">
                          <User className="h-4 w-4" />
                          Trang cá nhân
                        </Link>
                      </>
                    )}
                  </div>
                  
                  <div className="border-t border-zinc-800 py-1">
                    <button 
                      onClick={logout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-zinc-900 hover:text-red-300"
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                href="/login"
                className="hidden md:flex items-center justify-center rounded-lg border border-amber-400/50 px-4 py-2 text-sm font-bold text-amber-400 transition-all hover:bg-zinc-800 hover:shadow-[0_0_15px_rgba(251,191,36,0.2)]"
              >
                Đăng nhập
              </Link>
              <Link 
                href="/register"
                className="hidden md:flex items-center justify-center rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-zinc-950 transition-all hover:bg-amber-300 hover:shadow-[0_0_15px_rgba(251,191,36,0.5)]"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
