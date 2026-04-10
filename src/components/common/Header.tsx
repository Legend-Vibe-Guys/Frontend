import { useState } from 'react';
import { useAuth } from '../../hooks';
import { Bell, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleLogoutConfirm = () => {
    setIsLogoutModalOpen(false);
    setShowToast(true);
    setTimeout(() => {
      logout();
    }, 1500); // 1.5초 후 실제 로그아웃 처리 및 리다이렉트
  };

  return (
    <>
      <header className="h-14 flex items-center justify-between px-5 border-b border-slate-100 sticky top-0 z-50 bg-white/[0.92] backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 bg-gradient-to-br from-[#4D61FF] via-[#7B5CFF] to-[#BD00FF] rounded-xl flex items-center justify-center"
            style={{ boxShadow: '0 4px 12px rgba(123,92,255,0.35)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3"/>
              <path d="M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4"/>
              <path d="M5 21h14"/>
            </svg>
          </div>
          <h1 className="text-[17px] font-black text-slate-900 tracking-tight">키즈노트</h1>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 transition-all relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              3
            </span>
          </button>
          {user && (
            <button
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
              onClick={() => setIsLogoutModalOpen(true)}
              title="로그아웃"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-[340px] bg-white rounded-[28px] shadow-2xl p-6 flex flex-col items-center text-center animate-scale-in">
            <div className="w-14 h-14 bg-red-50 rounded-full flex flex-col items-center justify-center text-red-500 mb-4">
              <AlertCircle size={28} />
            </div>
            <h3 className="text-[18px] font-black text-slate-900 mb-2">정말 로그아웃 할까요?</h3>
            <p className="text-[14px] text-slate-500 mb-8 break-keep leading-relaxed">
              로그아웃 후 다시 접속하시려면<br />구글 계정 인증이 필요합니다.
            </p>
            <div className="flex gap-2 w-full">
              <button 
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold text-[15px] rounded-2xl hover:bg-slate-200 transition-all active:scale-[0.98]"
              >
                취소
              </button>
              <button 
                onClick={handleLogoutConfirm}
                className="flex-1 py-4 bg-red-500 text-white font-bold text-[15px] rounded-2xl hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all active:scale-[0.98]"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Toast Message */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[110] animate-fade-in-up">
          <div className="bg-slate-800 text-white px-5 py-3.5 rounded-[18px] shadow-xl shadow-slate-900/20 flex items-center gap-2.5">
            <CheckCircle2 size={18} className="text-green-400" />
            <span className="text-[14px] font-bold">안전하게 로그아웃 되었습니다.</span>
          </div>
        </div>
      )}
    </>
  );
}
