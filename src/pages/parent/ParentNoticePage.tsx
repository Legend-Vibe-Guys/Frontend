import { useState } from 'react';
import { useAppData } from '../../hooks';
import { Bell, ChevronDown, ChevronUp, Megaphone, ClipboardList, Camera } from 'lucide-react';
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
  const [viewerImageUrl, setViewerImageUrl] = useState<string | null>(null);

  const commonNotices = notices.filter((n) => n.type === 'common');
  const childIds = children.map(c => c.id);
  const individualNotices = notices.filter((n) => n.type === 'individual' && childIds.includes(n.childId || ''));
  
  const currentList = [...(tab === 'common' ? commonNotices : individualNotices)].sort((a, b) => {
    // 날짜 역순 (최신순)
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date);
    }
    // 같은 날짜면 ID 역순 (보통 생성순)
    return b.id.localeCompare(a.id);
  });

  return (
    <div className="p-6 pb-28 animate-fade-in">
      <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
        알림장 <ClipboardList size={22} className="text-blue-600" />
      </h2>

      <div className="flex gap-2 mb-6 bg-slate-50 p-1 rounded-2xl">
        <button className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold transition-all ${tab === 'common' ? 'bg-white text-blue-600 font-bold shadow-sm' : 'text-slate-400'}`} onClick={() => setTab('common')}>
          <Megaphone size={14} /> 공통 알림장
        </button>
        <button className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold transition-all ${tab === 'individual' ? 'bg-white text-blue-600 font-bold shadow-sm' : 'text-slate-400'}`} onClick={() => setTab('individual')}>
          <Bell size={14} /> 개별 알림장
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {currentList.length === 0 ? (
          <p className="text-center text-slate-400 text-xs py-8">아직 알림장이 없습니다</p>
        ) : (
          currentList.map((notice) => (
            <div key={notice.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden stagger-item">
              <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => {
                if (expandedId !== notice.id) {
                  setExpandedId(notice.id);
                  if (!notice.isRead) {
                    markNoticeAsRead(notice.id);
                  }
                } else {
                  setExpandedId(null);
                }
              }}>
                <div className="flex-1">
                  <p className="text-[10px] text-slate-400 mb-[2px]">{notice.date}</p>
                  <p className="font-bold text-sm text-slate-800 line-clamp-1">{notice.title}</p>
                </div>
                <div className="flex items-center gap-3 text-slate-400 ml-2">
                  {notice.photoUrl && <Camera size={14} className="text-blue-400" />}
                  {!notice.isRead && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
                  {expandedId === notice.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              {expandedId === notice.id && (
                <div className="px-4 pb-4 animate-fade-in space-y-3">
                  {notice.photoUrl && (
                    <div 
                      className="rounded-xl overflow-hidden border border-slate-100 shadow-sm cursor-zoom-in"
                      onClick={() => setViewerImageUrl(getFullImageUrl(notice.photoUrl))}
                    >
                      <img 
                        src={getFullImageUrl(notice.photoUrl)} 
                        alt="Notice" 
                        className="w-full h-auto object-cover max-h-60"
                      />
                    </div>
                  )}
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl">{notice.content}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {viewerImageUrl && (
        <ImageViewer 
          imageUrl={viewerImageUrl} 
          onClose={() => setViewerImageUrl(null)} 
        />
      )}
    </div>
  );
}
