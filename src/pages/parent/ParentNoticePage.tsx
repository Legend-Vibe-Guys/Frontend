import { useState } from 'react';
import { useAppData } from '../../hooks';
import { Bell, ChevronDown, Megaphone, ClipboardList, Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_BASE } from '../../api/api';
import ImageViewer from '../../components/common/ImageViewer';

const getFullImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

export default function ParentNoticePage() {
  const { notices, children, markNoticeAsRead } = useAppData();
  const [tab, setTab] = useState<'common' | 'individual'>('common');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
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
    setExpandedId(null);
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
              className={`bg-white/70 backdrop-blur-lg rounded-[2.2rem] overflow-hidden transition-all duration-300 border ${expandedId === notice.id ? 'border-orange-200 shadow-lg' : 'border-white/60 shadow-sm'}`}
            >
              {/* 리스트 아이템 내용 동일 */}
              <div 
                className="p-5 cursor-pointer flex items-start justify-between gap-4" 
                onClick={() => {
                  if (expandedId !== notice.id) {
                    setExpandedId(notice.id);
                    if (!notice.isRead) markNoticeAsRead(notice.id);
                  } else {
                    setExpandedId(null);
                  }
                }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-orange-600 px-2 py-0.5 bg-orange-100 rounded-full">{notice.date}</span>
                    {!notice.isRead && <span className="w-2 h-2 bg-orange-500 rounded-full shadow-sm" />}
                  </div>
                  <h4 className={`text-[17px] font-black text-slate-800 leading-tight ${expandedId === notice.id ? '' : 'line-clamp-1'}`}>
                    {notice.title}
                  </h4>
                </div>
                <div className="flex items-center gap-2 pt-1 text-slate-400">
                  {notice.photoUrl && <Camera size={16} />}
                  <div className={`transition-transform duration-300 ${expandedId === notice.id ? 'rotate-180 text-orange-600' : ''}`}>
                    <ChevronDown size={20} strokeWidth={3} />
                  </div>
                </div>
              </div>

              {expandedId === notice.id && (
                <div className="px-5 pb-6 animate-slide-down">
                  {((notice.photoUrls && notice.photoUrls.length > 0) || (notice.photoUrl && notice.photoUrl !== 'string')) && (
                    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                      {(notice.photoUrls && notice.photoUrls.length > 0 ? notice.photoUrls : [notice.photoUrl!]).map((photo, idx, arr) => (
                        <div 
                          key={idx}
                          className="flex-shrink-0 w-36 h-36 rounded-[1.8rem] overflow-hidden border border-white/40 shadow-md cursor-zoom-in group"
                          onClick={() => {
                            setViewerImages(arr.map(p => getFullImageUrl(p)));
                            setViewerIndex(idx);
                          }}
                        >
                          <img 
                            src={getFullImageUrl(photo)} 
                            alt={`Notice ${idx}`} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="p-4 bg-white/50 rounded-[1.8rem] border border-white/60">
                    <p className="text-[14px] text-slate-700 leading-relaxed whitespace-pre-line font-medium italic">
                      {notice.content}
                    </p>
                  </div>
                </div>
              )}
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

      {viewerImages.length > 0 && (
        <ImageViewer 
          images={viewerImages} 
          initialIndex={viewerIndex}
          onClose={() => setViewerImages([])} 
        />
      )}
    </div>
  );
}
