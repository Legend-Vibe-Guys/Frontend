import { useAuth, useAppData } from '../../hooks';
import { formatDateKorean, formatDateISO, formatTimeKorean } from '../../utils/date';
import { Heart, BookOpen, MessageCircle, TrendingUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PATH } from '../../router/Path';
import { API_BASE } from '../../api/api';
import { useState } from 'react';
import ImageViewer from '../../components/common/ImageViewer';

const getFullImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

export default function ParentHomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { children, observations, notices, schedules } = useAppData();
  const [viewerImages, setViewerImages] = useState<string[]>([]);

  const myChild = children[0];

  if (!myChild) {
    return (
      <div className="p-6 pb-28 animate-fade-in flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-3xl mb-4">🐣</div>
        <p className="text-sm font-bold text-slate-400">자녀 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  const childObservations = observations
    .filter((o) => o.childId === myChild.id)
    .sort((a, b) => b.date.localeCompare(a.date));
    
  const childNotices = notices
    .filter((n) => n.type === 'individual' && n.childId === myChild.id)
    .sort((a, b) => {
      if (a.createdAt && b.createdAt) return b.createdAt.localeCompare(a.createdAt);
      return b.date.localeCompare(a.date);
    });

  const today = formatDateISO();
  const todaySchedules = schedules
    .filter((s) => s.date === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // Find the next upcoming schedule
  const nextUp = todaySchedules.find(s => s.startTime > currentTime);

  return (
    <div className="min-h-screen p-6 pb-32 animate-fade-in relative z-10">
      {/* Header Area */}
      <div className="flex justify-between items-start mb-8 pt-2">
        <div>
          <p className="text-[13px] font-bold text-amber-500 mb-1">{formatDateKorean()}</p>
          <h2 className="text-2xl font-black text-slate-900 leading-tight">
            안녕하세요, <br/>
            {user?.name}님! <span className="inline-block">👋</span>
          </h2>
        </div>
        <div className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 flex items-center justify-center text-xl">
          🎁
        </div>
      </div>

      {/* Main Child Card */}
      <div 
        onClick={() => navigate(PATH.PARENT.EDIT_CHILD)}
        className="bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 p-6 rounded-[2.5rem] mb-8 shadow-xl shadow-orange-200/40 relative overflow-hidden active:scale-[0.98] transition-all cursor-pointer"
      >
        {/* Decorative elements */}
        <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
        <div className="absolute -left-4 -bottom-4 w-40 h-40 bg-orange-300/30 rounded-full blur-3xl"></div>
        
        <div className="flex items-center gap-5 mb-6 relative z-10">
          <div className="w-24 h-24 bg-white rounded-[2.2rem] flex items-center justify-center text-[48px] shadow-2xl overflow-hidden border-4 border-white transition-transform hover:rotate-2 duration-500">
            {myChild.profileImageUrl ? (
              <img src={getFullImageUrl(myChild.profileImageUrl)} alt={myChild.name} className="w-full h-full object-cover" />
            ) : (
              myChild.profileEmoji
            )}
          </div>
          <div>
            <div className="px-3 py-1 bg-black/10 backdrop-blur-md rounded-full inline-block mb-1 border border-white/20">
              <p className="text-[11px] text-white font-extrabold">{myChild.className || '우리 반'}</p>
            </div>
            <h3 className="text-2xl font-black text-white drop-shadow-sm">{myChild.name}</h3>
          </div>
        </div>
        
        <div className="w-full py-4 bg-white/95 text-orange-600 rounded-2xl text-[14px] font-black shadow-lg flex items-center justify-center gap-2">
          아이 정보 확인하기 <TrendingUp size={16} />
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="flex flex-col gap-4 mb-10">
        <div 
          onClick={() => navigate(PATH.PARENT.OBSERVATION)}
          className="p-6 bg-white/70 backdrop-blur-lg rounded-[2.2rem] shadow-sm border border-white/60 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-[12px] text-slate-500 font-bold mb-0.5">우리 아이 성장 기록</p>
              <p className="text-[20px] font-black text-slate-800">{childObservations.length}<span className="text-[14px] ml-1 opacity-50 font-bold">건의 기록</span></p>
            </div>
          </div>
          <div className="text-slate-400">
            <ChevronDown size={24} className="-rotate-90" strokeWidth={3} />
          </div>
        </div>

        <div 
          onClick={() => navigate(PATH.PARENT.NOTICES)}
          className="p-6 bg-white/70 backdrop-blur-lg rounded-[2.2rem] shadow-sm border border-white/60 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-inner">
              <MessageCircle size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-[12px] text-slate-500 font-bold">알림장 확인하기</p>
                {childNotices.some(n => !n.isRead) && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-500 text-white text-[9px] font-black rounded-md shadow-sm">NEW</span>
                )}
              </div>
              <p className="text-[20px] font-black text-slate-800">{childNotices.length}<span className="text-[14px] ml-1 opacity-50 font-bold">건의 알림</span></p>
            </div>
          </div>
          <div className="text-slate-400">
            <ChevronDown size={24} className="-rotate-90" strokeWidth={3} />
          </div>
        </div>
      </div>

      {/* Unified Timeline Section */}
      <div className="space-y-8">
        <section>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[17px] font-black text-slate-800 flex items-center gap-2">
              <span className="p-1.5 bg-amber-100 text-amber-500 rounded-lg"><TrendingUp size={16} /></span> 오늘의 일정
            </h3>
          </div>
          
          <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2.2rem] shadow-sm border border-white/60">
            {todaySchedules.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <p className="text-xs font-bold italic opacity-60">오늘은 정기 일정이 없어요 ☀️</p>
              </div>
            ) : (
              <div className="space-y-6 relative ml-1 pt-1">
                <div className="absolute left-[5px] top-6 bottom-4 w-[2px] bg-slate-100"></div>
                {todaySchedules.map((s) => {
                  const isNext = nextUp?.id === s.id;
                  return (
                    <div 
                      key={s.id} 
                      onClick={() => navigate(PATH.PARENT.SCHEDULE)}
                      className={`relative pl-8 transition-all duration-500 cursor-pointer active:scale-[0.98] ${isNext ? 'scale-[1.02]' : ''}`}
                    >
                      <div className={`absolute left-0 top-1.5 w-[14px] h-[14px] rounded-full border-2 bg-white z-10 ${isNext ? 'border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)] animate-pulse' : 'border-slate-300'}`}></div>
                      
                      <div className={`p-4 rounded-2xl transition-all ${isNext ? 'bg-amber-50 border border-amber-100/50 shadow-sm' : 'hover:bg-slate-50/50'}`}>
                         <div className="flex items-center justify-between mb-1">
                          <p className={`text-[11px] font-black ${isNext ? 'text-amber-500' : 'text-slate-400'}`}>{formatTimeKorean(s.startTime)}</p>
                          {isNext && (
                            <span className="bg-amber-400 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter shadow-sm">다음 일정</span>
                          )}
                        </div>
                        <p className={`text-[16px] font-black ${isNext ? 'text-slate-900' : 'text-slate-700'}`}>{s.title}</p>
                        {s.description && <p className="text-[13px] text-slate-500 mt-1 font-medium">{s.description}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Latest Notice - Highlighted */}
        {childNotices.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[17px] font-black text-slate-800 flex items-center gap-2">
                <span className="p-1.5 bg-orange-100 text-orange-600 rounded-lg"><Heart size={16} /></span> 최근 알림장
              </h3>
            </div>
            <div 
              className="bg-white p-6 rounded-[2rem] shadow-sm border border-amber-50/50 cursor-pointer active:scale-[0.99] transition-transform"
              onClick={() => navigate(PATH.PARENT.NOTICES)}
            >
              <div className="flex justify-between items-start mb-3">
                <p className="text-[11px] font-bold text-slate-400">{childNotices[0].date}</p>
                {!childNotices[0].isRead && <span className="px-2 py-0.5 bg-amber-500 text-white text-[9px] font-black rounded-full uppercase">New</span>}
              </div>
              <p className="text-[14px] text-slate-700 leading-relaxed font-medium line-clamp-3 mb-4">
                {childNotices[0].content}
              </p>
              
              {((childNotices[0].photoUrls && childNotices[0].photoUrls.length > 0) || (childNotices[0].photoUrl && childNotices[0].photoUrl !== 'string')) && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {(childNotices[0].photoUrls && childNotices[0].photoUrls.length > 0 ? childNotices[0].photoUrls : [childNotices[0].photoUrl!]).slice(0, 3).map((photo, idx) => (
                    <div key={idx} className="flex-shrink-0 w-20 h-20 rounded-[1.2rem] overflow-hidden border border-slate-50">
                      <img src={getFullImageUrl(photo)} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {(childNotices[0].photoUrls?.length || 1) > 3 && (
                    <div className="flex-shrink-0 w-20 h-20 rounded-[1.2rem] bg-slate-50 flex items-center justify-center text-slate-400 text-xs font-bold">
                      +{(childNotices[0].photoUrls?.length || 1) - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}
      </div>

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

