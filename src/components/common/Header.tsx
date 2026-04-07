import { useAuth } from '../../hooks';
import { Bell, LogOut } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 flex items-center justify-between px-5 border-b border-slate-100 sticky top-0 z-50 bg-white/[0.92] backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-lg"
          style={{ boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}
        >
          🌱
        </div>
        <h1 className="text-base font-black text-slate-800 tracking-tight">아이케어 AI</h1>
      </div>
      <div className="flex items-center gap-1">
        <button className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all relative">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center" style={{ border: '2px solid white' }}>
            3
          </span>
        </button>
        {user && (
          <button
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
            onClick={logout}
            title="로그아웃"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </header>
  );
}
