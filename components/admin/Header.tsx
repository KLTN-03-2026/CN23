import { Bell, Search, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="h-10 w-64 rounded-full border border-zinc-800 bg-zinc-900 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500"></span>
        </button>
        <div className="flex items-center gap-3 border-l border-zinc-800 pl-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-zinc-950">
            <User className="h-5 w-5" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-zinc-200">Admin</p>
            <p className="text-xs text-zinc-500">Quản lý</p>
          </div>
        </div>
      </div>
    </header>
  );
}
