import { useState } from 'react';
import { useAppData } from '../../hooks';
import { BookOpen, Calendar, ChevronDown, Star } from 'lucide-react';

export default function ParentObservationPage() {
  const { observations, children } = useAppData();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const myChild = children[0];
  const childObservations = observations
    .filter((o) => o.childId === myChild?.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="min-h-screen p-6 pb-32 animate-fade-in relative z-10">
      {/* Header Area */}
      <div className="mb-8 pt-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 flex items-center justify-center text-xl">
            🌱
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            성장 기록 <span className="text-orange-500">.</span>
          </h2>
        </div>
        <p className="text-[14px] text-slate-500 font-medium ml-1">우리 아이의 소중한 성장 순간들을 모았습니다.</p>
      </div>

      {/* Summary Stats - Refined Minimalist Design */}
      <div className="bg-white/60 backdrop-blur-lg p-5 rounded-[2.2rem] border border-white/50 shadow-sm mb-8 flex items-center gap-4 animate-fade-in">
        {/* Left Side: Icon from Original Design */}
        <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-[1.25rem] flex items-center justify-center shadow-inner shrink-0">
          <BookOpen size={28} />
        </div>
        
        {/* Right Side: Consolidated Info */}
        <div className="flex-1">
          {/* Recent Update: Small Gray Text at the Top */}
          <div className="flex items-center gap-1.5 mb-1 opacity-60">
            <div className="w-1 h-1 bg-slate-300 rounded-full" />
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              최근 업데이트: {childObservations.length > 0 ? childObservations[0].date.replace(/-/g, '.') : '-'}
            </p>
          </div>
          
          {/* Total Records: Main Content */}
          <div className="flex items-baseline gap-2">
            <h4 className="text-[17px] font-black text-slate-800 tracking-tight">전체 기록</h4>
            <div className="flex items-baseline">
              <span className="text-[24px] font-black text-orange-600 leading-none">{childObservations.length}</span>
              <span className="text-[16px] font-black text-orange-600 ml-0.5">건</span>
            </div>
          </div>
        </div>
      </div>

      {/* Observation List */}
      <div className="space-y-4">
        {childObservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-3xl mb-4">🐣</div>
            <p className="text-sm font-bold text-slate-500">아직 등록된 기록이 없어요.</p>
          </div>
        ) : (
          childObservations.map((obs) => (
            <div 
              key={obs.id} 
              className={`bg-white/70 backdrop-blur-lg rounded-[2.2rem] overflow-hidden transition-all duration-300 border ${expandedId === obs.id ? 'border-orange-200 shadow-lg' : 'border-white/60 shadow-sm'}`}
            >
              <div 
                className="p-5 cursor-pointer" 
                onClick={() => setExpandedId(expandedId === obs.id ? null : obs.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-orange-500" />
                    <span className="text-[12px] font-black text-orange-500">{obs.date}</span>
                  </div>
                  <div className={`transition-transform duration-300 ${expandedId === obs.id ? 'rotate-180 text-orange-600' : 'text-slate-400'}`}>
                    <ChevronDown size={20} strokeWidth={3} />
                  </div>
                </div>
                <h4 className={`text-[16px] font-black text-slate-800 leading-tight mb-2 ${expandedId === obs.id ? '' : 'line-clamp-1'}`}>
                  {obs.content}
                </h4>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {obs.categories.map((cat, i) => (
                    <span key={i} className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold shadow-sm">
                      #{cat.name}
                    </span>
                  ))}
                </div>
              </div>

              {expandedId === obs.id && (
                <div className="px-5 pb-6 animate-slide-down">
                  <div className="p-4 bg-white/50 rounded-[1.8rem] border border-white/60 shadow-inner">
                    <p className="text-[14px] text-slate-700 leading-relaxed whitespace-pre-line font-medium italic">
                      {obs.content}
                    </p>
                  </div>
                  {/* Additional stats for parent if available */}
                  {obs.evaluation && (
                    <div className="mt-4 p-4 bg-orange-50/80 backdrop-blur-sm rounded-[1.8rem] border border-orange-100/50">
                      <p className="text-[11px] font-black text-orange-600 mb-1 uppercase tracking-wider flex items-center gap-1.5">
                        <Star size={10} /> Teacher's Insight
                      </p>
                      <p className="text-[13px] text-orange-800 leading-relaxed font-semibold">
                        {obs.evaluation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
