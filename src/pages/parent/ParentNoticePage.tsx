import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../hooks';
import { Bell, Megaphone, ClipboardList, ChevronLeft, ChevronRight, MessageSquare, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { PATH } from '../../router/Path';

export default function ParentNoticePage() {
  const { notices, children, markNoticeAsRead } = useAppData();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'common' | 'individual'>('common');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  const commonNotices = notices.filter((n) => n.type === 'common');
  const childIds = children.map(c => c.id);
  const individualNotices = notices.filter((n) => n.type === 'individual' && childIds.includes(n.childId || ''));
  
  const currentList = [...(tab === 'common' ? commonNotices : individualNotices)].sort((a, b) => {
    if (a.createdAt && b.createdAt) return b.createdAt.localeCompare(a.createdAt);
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.id.localeCompare(a.id);
  });

  const totalPages = Math.ceil(currentList.length / ITEMS_PER_PAGE);
  const displayedList = currentList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleTabChange = (newTab: 'common' | 'individual') => {
    setTab(newTab);
    setCurrentPage(1);
  };

  const handleNoticeClick = (noticeId: string, isRead: boolean) => {
    if (!isRead) markNoticeAsRead(noticeId);
    navigate(PATH.PARENT.NOTICE_DETAIL.replace(':id', noticeId));
  };

  return (
    <div className="min-h-screen p-6 pb-32 animate-fade-in relative z-10">
      {/* Header */}
      <div className="mb-8 pt-4">
        <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
          알림장 <span className="text-2xl">📋</span>
        </h2>
        <p className="text-[14px] text-slate-500 font-medium">우리 아이의 소중한 기록들을 확인하세요.</p>
      </div>

      {/* Modern Tabs - Glassmorphism */}
      <div className="flex gap-2 mb-8 bg-white/40 backdrop-blur-md p-1.5 rounded-[1.8rem] border border-white/50 shadow-sm">
        <button 
          className={`flex-1 flex gap-2 items-center justify-center py-4 rounded-[1.5rem] text-[13px] font-black transition-all duration-300 ${tab === 'common' ? 'bg-white text-orange-600 shadow-md ring-1 ring-orange-50' : 'text-slate-400'}`} 
          onClick={() => handleTabChange('common')}
        >
          <Megaphone size={16} /> 우리 반 소식
        </button>
        <button 
          className={`flex-1 flex gap-2 items-center justify-center py-4 rounded-[1.5rem] text-[13px] font-black transition-all duration-300 ${tab === 'individual' ? 'bg-white text-amber-600 shadow-md ring-1 ring-amber-50' : 'text-slate-400'}`} 
          onClick={() => handleTabChange('individual')}
        >
          <Bell size={16} /> 개별 알림장
        </button>
      </div>

      {/* Content List */}
      <div className="space-y-4">
        {displayedList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <ClipboardList size={48} className="mb-4 text-slate-400" />
            <p className="text-sm font-bold text-slate-500">아직 도착한 알림장이 없어요.</p>
          </div>
        ) : (
          displayedList.map((notice) => (
            <div 
              key={notice.id} 
              onClick={() => handleNoticeClick(notice.id, notice.isRead)}
              className="bg-white/70 backdrop-blur-lg rounded-[2.2rem] overflow-hidden transition-all duration-300 border border-white/60 shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer"
            >
              <div className="p-6 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-orange-600 px-2 py-0.5 bg-orange-100 rounded-full">{notice.date}</span>
                    {!notice.isRead && <span className="w-2 h-2 bg-orange-500 rounded-full shadow-sm" />}
                  </div>
                  <h4 className="text-[17px] font-black text-slate-800 leading-tight mb-2 truncate">
                    {notice.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1 font-medium italic opacity-70">
                    {notice.content}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-orange-500">
                      <MessageSquare size={14} />
                      <span className="text-xs font-black">{notice.commentCount || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center self-center text-slate-200">
                  <ChevronRightIcon size={24} strokeWidth={3} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination UI */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3 bg-white/40 backdrop-blur-md p-2 rounded-[2rem] border border-white/50 shadow-sm w-fit mx-auto">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 disabled:opacity-20 hover:bg-orange-50 hover:text-orange-500 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-black transition-all ${
                  currentPage === i + 1 
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' 
                    : 'text-slate-400 hover:bg-white hover:text-slate-600'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 disabled:opacity-20 hover:bg-orange-50 hover:text-orange-500 transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

    </div>
  );
}
