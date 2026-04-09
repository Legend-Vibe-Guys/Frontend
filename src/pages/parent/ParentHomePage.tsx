import { useAuth, useAppData } from '../../hooks';
import { formatDateKorean, formatDateISO } from '../../utils/date';
import { Heart, BookOpen, MessageCircle, TrendingUp } from 'lucide-react';
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
  const [viewerImageUrl, setViewerImageUrl] = useState<string | null>(null);

  const myChild = children[0];

  if (!myChild) {
    return (
      <div className="p-6 pb-28 animate-fade-in flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-sm font-bold text-slate-400">자녀 정보를 불러오는 중이거나 등록된 자녀가 없습니다.</p>
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

  return (
    <div className="p-6 pb-28 animate-fade-in">
      <div className="mb-6">
        <p className="text-xs font-bold text-pink-500 mb-1">{formatDateKorean()}</p>
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          {user?.name}님, 안녕하세요 <Heart size={24} className="text-pink-500 fill-pink-500" />
        </h2>
      </div>

      {/* Child Card */}
      <div className="bg-pink-50 p-6 rounded-[2.5rem] mb-8 border border-pink-100 shadow-sm">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-[40px] shadow-inner overflow-hidden border-2 border-pink-100">
            {myChild.profileImageUrl ? (
              <img src={getFullImageUrl(myChild.profileImageUrl)} alt={myChild.name} className="w-full h-full object-cover" />
            ) : (
              myChild.profileEmoji
            )}
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800">{myChild.name}</h3>
            <p className="text-xs text-pink-500 font-semibold">{myChild.className}</p>
          </div>
        </div>
        <button 
          onClick={() => navigate(PATH.PARENT.EDIT_CHILD)}
          className="w-full py-2.5 bg-white/60 hover:bg-white text-pink-600 rounded-xl text-xs font-bold transition-all border border-pink-200/50 shadow-sm"
        >
          정보 수정하기
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { icon: BookOpen, label: '관찰일지', value: `${childObservations.length}건`, bg: 'bg-purple-50', color: 'text-purple-500' },
          { icon: MessageCircle, label: '알림장', value: `${childNotices.length}건`, bg: 'bg-emerald-50', color: 'text-emerald-500' },
        ].map(({ icon: Icon, label, value, bg, color }, i) => (
          <div key={i} className="p-4 bg-white border border-slate-200 rounded-2xl stagger-item" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className={`w-9 h-9 rounded-xl ${bg} ${color} flex items-center justify-center mb-2`}><Icon size={18} /></div>
            <p className="text-[10px] text-slate-400 font-semibold">{label}</p>
            <p className="text-base font-black text-slate-800">{value}</p>
          </div>
        ))}
      </div>

      {/* Today's Schedule (Timeline) */}
      <div className="mb-8 stagger-item">
        <h3 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp size={16} /> 오늘의 일정
        </h3>
        <div className="relative ml-4 pl-6" style={{ borderLeft: '2px dashed #e2e8f0' }}>
          {todaySchedules.length === 0 ? (
            <div className="text-center py-6 opacity-30">
              <p className="text-xs font-bold">오늘 예정된 일정이 없습니다.</p>
            </div>
          ) : (
            todaySchedules.map((s) => (
              <div key={s.id} className={`relative pb-5 last:pb-0 ${s.isCompleted ? 'opacity-40' : ''}`}>
                <div
                  className="absolute top-1 w-[10px] h-[10px] rounded-full"
                  style={{ 
                    left: '-29px', 
                    border: '2px solid white', 
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    background: s.isCompleted ? '#cbd5e1' : '#2563eb' 
                  }}
                />
                <p className={`text-[10px] font-bold uppercase mb-[2px] ${s.isCompleted ? 'text-slate-400' : 'text-blue-600'}`}>
                  {s.startTime}
                </p>
                <p className={`text-sm font-bold ${s.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                  {s.title}
                </p>
                {s.description && (
                  <p className={`text-xs ${s.isCompleted ? 'text-slate-300' : 'text-slate-400'}`}>
                    {s.description}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {childNotices.length > 0 && (
        <div className="mb-6 stagger-item">
          <h3 className="text-sm font-extrabold text-slate-800 mb-4">최근 알림장</h3>
          <div className="p-4 bg-white border border-slate-200 rounded-2xl">
            <p className="text-[10px] text-slate-400 mb-2">{childNotices[0].date}</p>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{childNotices[0].content}</p>
            {childNotices[0].photoUrl && (
              <div 
                className="mt-3 rounded-xl overflow-hidden h-32 border border-slate-100 cursor-zoom-in"
                onClick={() => setViewerImageUrl(getFullImageUrl(childNotices[0].photoUrl))}
              >
                <img 
                  src={getFullImageUrl(childNotices[0].photoUrl)} 
                  alt="Attached" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).parentElement?.style.setProperty('display', 'none');
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {childObservations.length > 0 && (
        <div className="mb-6 stagger-item">
          <h3 className="text-sm font-extrabold text-slate-800 mb-4">최근 관찰일지</h3>
          <div className="p-4 bg-white border border-slate-200 rounded-2xl">
            <p className="text-[10px] text-slate-400 mb-2">{childObservations[0].date}</p>
            <p className="text-xs text-slate-600 leading-relaxed">{childObservations[0].content}</p>
            <div className="flex gap-2 mt-3">
              {childObservations[0].categories.map((cat, i) => (<span key={i} className="text-[10px] text-blue-600 font-bold">#{cat.name}</span>))}
            </div>
          </div>
        </div>
      )}

      {viewerImageUrl && (
        <ImageViewer 
          imageUrl={viewerImageUrl} 
          onClose={() => setViewerImageUrl(null)} 
        />
      )}
    </div>
  );
}
