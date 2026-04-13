import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../hooks';
import { ChevronRight, ArrowLeft, MessageSquare, Megaphone, User } from 'lucide-react';
import { PATH } from '../../router/Path';
import { API_BASE } from '../../api/api';

const getFullImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

export default function NoticeListPage() {
  const { notices } = useAppData();
  const navigate = useNavigate();

  const sortedNotices = [...notices].sort((a, b) => {
    if (a.createdAt && b.createdAt) return b.createdAt.localeCompare(a.createdAt);
    return b.date.localeCompare(a.date) || b.id.localeCompare(a.id);
  });

  return (
    <div className="min-h-screen p-6 pb-28 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(PATH.TEACHER.NOTICE)}
          className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-black text-slate-900">발송 내역 전체보기</h2>
      </div>

      <div className="space-y-4">
        {sortedNotices.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold">발송된 알림장이 없습니다.</p>
          </div>
        ) : (
          sortedNotices.map((notice) => (
            <div
              key={notice.id}
              onClick={() => navigate(PATH.TEACHER.NOTICE_DETAIL.replace(':id', notice.id))}
              className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm active:scale-[0.98] transition-all cursor-pointer flex gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-lg border ${
                    notice.type === 'common' 
                      ? 'bg-blue-50 text-blue-500 border-blue-100' 
                      : 'bg-emerald-50 text-emerald-500 border-emerald-100'
                  }`}>
                    {notice.type === 'common' ? <Megaphone size={10} /> : <User size={10} />}
                    {notice.type === 'common' ? '공통' : '개별'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">{notice.date}</span>
                </div>
                <h3 className="text-[15px] font-black text-slate-800 mb-1 truncate">{notice.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {notice.content}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-blue-500">
                    <MessageSquare size={14} />
                    <span className="text-xs font-black">{notice.commentCount || 0}</span>
                  </div>
                </div>
              </div>
              
              {((notice.photoUrls && notice.photoUrls.length > 0) || (notice.photoUrl && notice.photoUrl !== 'string')) && (
                <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-slate-50">
                  <img
                    src={getFullImageUrl(notice.photoUrls ? notice.photoUrls[0] : notice.photoUrl)}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </div>
              )}
              
              <div className="flex items-center text-slate-200">
                <ChevronRight size={20} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
