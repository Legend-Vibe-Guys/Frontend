import { useState } from 'react';
import { useAppData } from '../../hooks';
import { Bell, ChevronDown, ChevronUp, Megaphone } from 'lucide-react';

export default function ParentNoticePage() {
  const { notices } = useAppData();
  const [tab, setTab] = useState<'common' | 'individual'>('common');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const commonNotices = notices.filter((n) => n.type === 'common');
  const individualNotices = notices.filter((n) => n.type === 'individual' && n.childId === 'c1');
  const currentList = tab === 'common' ? commonNotices : individualNotices;

  return (
    <div className="p-6 pb-28 animate-fade-in">
      <h2 className="text-2xl font-black text-slate-900 mb-6">알림장 📋</h2>

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
              <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpandedId(expandedId === notice.id ? null : notice.id)}>
                <div>
                  <p className="text-[10px] text-slate-400 mb-[2px]">{notice.date}</p>
                  <p className="font-bold text-sm text-slate-800">{notice.title}</p>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  {!notice.isRead && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
                  {expandedId === notice.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              {expandedId === notice.id && (
                <div className="px-4 pb-4 animate-fade-in">
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl">{notice.content}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
