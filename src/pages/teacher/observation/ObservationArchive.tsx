import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { CustomSelect } from '../../../components/teacher/CustomSelect';
import type { ObservationLog, Child, NuriDomain } from '../../../types';
import { ChildAvatar } from '../../../components/common/ChildAvatar';

interface ObservationArchiveProps {
  observations: ObservationLog[];
  children: Child[];
}

export function ObservationArchive({ observations, children }: ObservationArchiveProps) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [filterMonth, setFilterMonth] = useState<string>(currentMonth);
  const [filterChild, setFilterChild] = useState<string>('');
  const [filterDomain, setFilterDomain] = useState<string>('');
  const [expandedObs, setExpandedObs] = useState<string | null>(null);

  const nuriDomains: NuriDomain[] = ['신체운동·건강', '의사소통', '사회관계', '예술경험', '자연탐구'];

  const childOptions = [
    { value: '', label: '전체 원아 보기' },
    ...children.map(c => ({ value: c.id, label: c.name, emoji: c.profileEmoji }))
  ];

  const domainOptions = [
    { value: '', label: '전체 영역 보기' },
    ...nuriDomains.map(d => ({ value: d, label: d }))
  ];

  const filteredObservations = observations.filter(obs => {
    const matchMonth = filterMonth ? obs.date.startsWith(filterMonth) : true;
    const matchChild = filterChild ? obs.childId === filterChild : true;
    const matchDomain = filterDomain ? obs.categories.some(c => c.name === filterDomain) : true;
    return matchMonth && matchChild && matchDomain;
  });

  return (
    <div className="animate-fade-in-left h-full pb-20">
      <div className="bg-white border border-slate-200 rounded-[2rem] p-6 mb-8 shadow-sm space-y-4">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col">
            <label className="text-[11px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">📅 작성 월</label>
            <div className="relative group">
              <input 
                type="month" 
                className="bg-white border border-slate-200 rounded-2xl px-5 py-4 font-bold text-base outline-none w-full focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50/50 transition-all text-slate-700 shadow-sm" 
                value={filterMonth} 
                onChange={(e) => setFilterMonth(e.target.value)} 
              />
            </div>
          </div>

          <CustomSelect 
            label="👤 원아 선택"
            value={filterChild}
            options={childOptions}
            onChange={setFilterChild}
            placeholder="원아를 선택해주세요"
          />

          <CustomSelect 
            label="🎨 누리과정 영역"
            value={filterDomain}
            options={domainOptions}
            onChange={setFilterDomain}
            placeholder="영역을 선택해주세요"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredObservations.length > 0 ? (
          filteredObservations.map(obs => {
            const childData = children.find(c => c.id === obs.childId);
            return (
              <div key={obs.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-indigo-200 transition-all">
                <div 
                  className="p-5 flex items-center justify-between cursor-pointer" 
                  onClick={() => setExpandedObs(expandedObs === obs.id ? null : obs.id)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <ChildAvatar 
                      name={obs.childName}
                      profileImageUrl={childData?.profileImageUrl}
                      profileEmoji={childData?.profileEmoji || '👶'}
                      className="w-12 h-12 bg-slate-50 rounded-full"
                      emojiClassName="text-2xl"
                    />
                    <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-black text-slate-900 truncate">{obs.childName}</span>
                      <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {obs.categories[0]?.name}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold">{obs.date}</p>
                  </div>
                </div>
                {expandedObs === obs.id ? <ChevronUp size={18} className="text-slate-300" /> : <ChevronDown size={18} className="text-slate-300" />}
              </div>
              {expandedObs === obs.id && (
                <div className="px-6 pb-7 animate-fade-in border-t border-slate-50 pt-6 space-y-6">
                   <div className="px-1">
                     <span className="text-[10px] font-black text-slate-300 uppercase block mb-2 tracking-tighter">🔎 관찰 내용</span>
                     <p className="text-[13px] font-semibold text-slate-700 leading-relaxed whitespace-pre-wrap">
                       {obs.content}
                     </p>
                   </div>
                   <div className="bg-slate-50/80 p-5 rounded-[1.5rem] border border-slate-100">
                     <span className="text-[10px] font-black text-indigo-400 uppercase block mb-2 tracking-tighter">💡 관찰 평가</span>
                     <p className="text-[13px] font-medium text-slate-500 leading-relaxed whitespace-pre-wrap">
                       {obs.evaluation || "분석된 평가 내용이 없습니다."}
                     </p>
                   </div>
                </div>
              )}
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center text-slate-400 font-bold bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
            기록 데이터가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
