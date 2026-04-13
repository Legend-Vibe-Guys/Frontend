import { useState } from 'react';
import { useAuth } from '../../hooks';
import { Bell, LogOut, CheckCircle2, AlertCircle, MessageSquare, Clipboard, Calendar, Edit3 } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { formatNotificationTime } from '../../utils/date';
import type { AppNotification } from '../../types';

export default function Header() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  const handleLogoutConfirm = () => {
    setIsLogoutModalOpen(false);
    setShowToast(true);
    setTimeout(() => {
      logout();
    }, 1500); // 1.5초 후 실제 로그아웃 처리 및 리다이렉트
  };

  const handleNotifClick = async (notif: AppNotification) => {
    if (!notif.isRead) {
      await markAsRead(notif.id);
    }
    setIsNotifOpen(false);
    navigate(notif.link);
  };

  const getNotifIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'comment': return <MessageSquare size={16} className="text-blue-500" />;
      case 'notice': return <Clipboard size={16} className="text-orange-500" />;
      case 'observation': return <Edit3 size={16} className="text-purple-500" />;
      case 'schedule': return <Calendar size={16} className="text-green-500" />;
      case 'class_update': return <CheckCircle2 size={16} className="text-indigo-500" />;
      case 'health_update': return <AlertCircle size={16} className="text-red-500" />;
      default: return <Bell size={16} className="text-slate-400" />;
    }
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
          <h1 className="text-[17px] font-black text-slate-900 tracking-tight">아이노트</h1>
        </div>
        <div className="flex items-center gap-1">
          <div className="relative">
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all relative ${isNotifOpen ? 'bg-slate-100 text-[#4D61FF]' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotifOpen && (
              <>
                <div 
                  className="fixed inset-0 z-[60]" 
                  onClick={() => setIsNotifOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[70] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
                    <h3 className="text-[14px] font-bold text-slate-800">알림</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => markAllAsRead()}
                        className="text-[12px] text-slate-400 hover:text-[#4D61FF] font-medium"
                      >
                        모두 읽음
                      </button>
                    )}
                  </div>
                  <div className="max-h-[320px] overflow-y-auto">
                    {notifications.filter(n => !n.isRead).length === 0 ? (
                      <div className="py-10 flex flex-col items-center justify-center text-slate-400">
                        <Bell size={32} className="mb-2 opacity-20" />
                        <p className="text-[13px]">새로운 알림이 없습니다</p>
                      </div>
                    ) : (
                      notifications.filter(n => !n.isRead).map((notif) => (
                        <button
                          key={notif.id}
                          onClick={() => handleNotifClick(notif)}
                          className={`w-full flex gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0 bg-blue-50/30`}
                        >
                          <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${!notif.isRead ? 'bg-white shadow-sm' : 'bg-slate-50'}`}>
                            {getNotifIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-0.5">
                              <p className={`text-[13px] leading-tight flex-1 pr-2 ${!notif.isRead ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                                {notif.title}
                              </p>
                              <span className="text-[10px] text-slate-400 whitespace-nowrap mt-0.5">
                                {formatNotificationTime(notif.createdAt)}
                              </span>
                            </div>
                            <p className="text-[12px] text-slate-500 truncate">
                              {notif.content}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
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
