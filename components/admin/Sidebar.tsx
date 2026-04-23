'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Table, Coffee, Settings, LogOut, CircleDot, Calculator, CalendarCheck, Receipt, Users, BarChart3 } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { name: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
    { name: 'Thanh toán', href: '/admin/pos', icon: Calculator },
    { name: 'Quản lý Đặt bàn', href: '/admin/reservations', icon: CalendarCheck },
    { name: 'Quản lý Giao dịch', href: '/admin/transactions', icon: Receipt },
    { name: 'Báo cáo doanh thu', href: '/admin/reports', icon: BarChart3 },
    { name: 'Quản lý Khách hàng', href: '/admin/users', icon: Users },
    { name: 'Quản lý Bàn', href: '/admin/tables', icon: Table },
    { name: 'Quản lý Thực đơn', href: '/admin/menu', icon: Coffee },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-zinc-800 bg-zinc-950">
      <div className="flex h-16 items-center gap-2 border-b border-zinc-800 px-6">
        <CircleDot className="h-6 w-6 text-amber-400" />
        <span className="text-xl font-bold uppercase tracking-wider text-amber-400">Luxe Admin</span>
      </div>
      <nav className="flex flex-col gap-2 p-4">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-amber-400/10 text-amber-400'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }`}
            >
              <link.icon className="h-5 w-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-0 w-full border-t border-zinc-800 p-4">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-rose-500 transition-colors hover:bg-rose-500/10"
        >
          <LogOut className="h-5 w-5" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
