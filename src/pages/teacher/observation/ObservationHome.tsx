import { Camera, Sparkles, FolderClock, FileText, ChevronRight } from 'lucide-react';

interface ObservationHomeProps {
  onNavigate: (page: 'quick_list' | 'archive' | 'report') => void;
}

export function ObservationHome({ onNavigate }: ObservationHomeProps) {
  return (
    <div className="p-6 md:p-12 animate-fade-in max-w-2xl mx-auto h-full space-y-8 print:hidden">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black text-slate-900 mb-2 flex items-center justify-center gap-3">
          <Camera size={32} className="text-indigo-500" />
          관찰일지 관리
        </h1>
        <p className="text-slate-500 font-medium">선생님의 기록을 스마트하게 관리하세요.</p>
      </div>

      <div className="flex flex-col gap-4">
        <button 
          onClick={() => onNavigate('quick_list')}
          className="bg-white border-2 border-transparent hover:border-indigo-400 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all text-left flex items-center gap-6 group active:scale-[0.98]"
        >
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 shrink-0 group-hover:scale-110 transition-transform">
            <Sparkles size={28} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-black text-slate-800 mb-1">빠른 관찰 메모</h3>
            <p className="text-xs font-bold text-slate-400 truncate">키워드로 생성하는 AI 관찰일지 초안</p>
          </div>
          <ChevronRight size={24} className="text-slate-200 group-hover:text-indigo-500 shrink-0" />
        </button>

        <button 
          onClick={() => onNavigate('archive')}
          className="bg-white border-2 border-transparent hover:border-blue-400 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all text-left flex items-center gap-6 group active:scale-[0.98]"
        >
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shrink-0 group-hover:scale-110 transition-transform">
            <FolderClock size={28} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-black text-slate-800 mb-1">생활 기록부</h3>
            <p className="text-xs font-bold text-slate-400 truncate">아이들의 소중한 기록을 한눈에 관리</p>
          </div>
          <ChevronRight size={24} className="text-slate-200 group-hover:text-blue-500 shrink-0" />
        </button>

        <button 
          onClick={() => onNavigate('report')}
          className="bg-white border-2 border-transparent hover:border-emerald-400 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all text-left flex items-center gap-6 group active:scale-[0.98]"
        >
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0 group-hover:scale-110 transition-transform">
            <FileText size={28} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-black text-slate-800 mb-1">월말 종합 평가</h3>
            <p className="text-xs font-bold text-slate-400 truncate">누적 데이터를 기반으로 연말/월말 평가</p>
          </div>
          <ChevronRight size={24} className="text-slate-200 group-hover:text-emerald-500 shrink-0" />
        </button>
      </div>
    </div>
  );
}
