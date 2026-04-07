import { useAuth, useAppData } from '../../hooks';
import { formatDateKorean } from '../../utils/date';
import { Heart, TrendingUp, BookOpen, MessageCircle } from 'lucide-react';

export default function ParentHomePage() {
  const { user } = useAuth();
  const { children, attendance, observations, notices } = useAppData();

  const myChild = children[0];
  const childAttendance = attendance.find((a) => a.childId === myChild.id);
  const childObservations = observations.filter((o) => o.childId === myChild.id);
  const childNotices = notices.filter((n) => n.type === 'individual' && n.childId === myChild.id);

  return (
    <div className="p-6 pb-28 animate-fade-in">
      <div className="mb-6">
        <p className="text-xs font-bold text-pink-500 mb-1">{formatDateKorean()}</p>
        <h2 className="text-2xl font-black text-slate-900">{user?.name}님, 안녕하세요 💕</h2>
      </div>

      {/* Child Card */}
      <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-5 rounded-[2rem] mb-6 border border-pink-200 animate-fade-in-up">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[28px] shadow-md">{myChild.profileEmoji}</div>
          <div>
            <h3 className="text-lg font-black text-slate-800">{myChild.name}</h3>
            <p className="text-xs text-pink-500 font-semibold">{myChild.className}</p>
          </div>
        </div>
        {childAttendance?.status === 'present' ? (
          <div className="inline-block px-4 py-2 rounded-full bg-emerald-50 text-emerald-500 text-xs font-bold">✅ {childAttendance.arrivalTime} 등원 완료</div>
        ) : (
          <div className="inline-block px-4 py-2 rounded-full bg-red-50 text-red-500 text-xs font-bold">미등원</div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { icon: Heart, label: '건강 상태', value: '좋음 😊', bg: 'bg-pink-50', color: 'text-pink-500' },
          { icon: TrendingUp, label: '출석률', value: '95%', bg: 'bg-blue-50', color: 'text-blue-600' },
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

      {childNotices.length > 0 && (
        <div className="mb-6 stagger-item">
          <h3 className="text-sm font-extrabold text-slate-800 mb-4">최근 알림장</h3>
          <div className="p-4 bg-white border border-slate-200 rounded-2xl">
            <p className="text-[10px] text-slate-400 mb-2">{childNotices[0].date}</p>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{childNotices[0].content}</p>
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
    </div>
  );
}
