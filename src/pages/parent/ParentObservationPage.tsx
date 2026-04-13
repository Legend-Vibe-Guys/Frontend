import { useState, useEffect, useMemo } from 'react';
import { useAppData } from '../../hooks';
import { 
  BookOpen, 
  Calendar, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Sprout, 
  Activity, 
  MessageCircle, 
  Users, 
  Palette, 
  Search, 
  ClipboardList, 
  Lightbulb, 
  Inbox 
} from 'lucide-react';

export default function ParentObservationPage() {
  const { children, monthlyReports, fetchMonthlyReports } = useAppData();
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const handlePrevMonth = () => {
    const date = new Date(selectedMonth + '-01');
    date.setMonth(date.getMonth() - 1);
    setSelectedMonth(date.toISOString().slice(0, 7));
  };

  const handleNextMonth = () => {
    const date = new Date(selectedMonth + '-01');
    date.setMonth(date.getMonth() + 1);
    setSelectedMonth(date.toISOString().slice(0, 7));
  };

  const myChild = children[0];

  // 자녀 월간 데이터 로딩
  useEffect(() => {
    if (myChild?.id) {
      fetchMonthlyReports(myChild.id);
    }
  }, [myChild?.id, fetchMonthlyReports]);

  const currentMonthlyReport = useMemo(() => {
    return monthlyReports.find(
      (r) => r.childId === myChild?.id && r.reportMonth === selectedMonth && r.isSent
    );
  }, [monthlyReports, myChild?.id, selectedMonth]);

  const nuriDomains = ['신체운동·건강', '의사소통', '사회관계', '예술경험', '자연탐구'];

  // 누리과정 영역별 아이콘
  const domainIcons: Record<string, React.ReactNode> = {
    '신체운동·건강': <Activity size={18} className="text-green-500" />,
    '의사소통': <MessageCircle size={18} className="text-blue-500" />,
    '사회관계': <Users size={18} className="text-indigo-500" />,
    '예술경험': <Palette size={18} className="text-pink-500" />,
    '자연탐구': <Search size={18} className="text-amber-500" />,
  };

  const monthNum = selectedMonth.split('-')[1];

  return (
    <div className="min-h-screen p-6 pb-32 animate-fade-in relative z-10">
      {/* Header */}
      <div className="mb-8 pt-4">
        <h2 className="text-3xl font-black text-slate-900 mb-1 flex items-center gap-3">
          성장 기록 <Sprout size={32} className="text-green-500" strokeWidth={2.5} />
        </h2>
        <p className="text-[14px] text-slate-500 font-medium tracking-tight">선생님이 보내주신 월간 발달 보고서를 확인하세요.</p>
      </div>

      {/* Month Picker */}
      <div className="flex items-center justify-between bg-white/70 backdrop-blur-md p-2 rounded-[2rem] border border-white/60 shadow-sm mb-8">
        <button 
          onClick={handlePrevMonth}
          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
            <Calendar size={16} />
          </div>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent font-black text-slate-800 text-[15px] outline-none cursor-pointer w-[120px] text-center"
          />
        </div>

        <button 
          onClick={handleNextMonth}
          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {currentMonthlyReport ? (
        <div className="space-y-4 animate-fade-in">
          {/* Summary Badge */}
          <div className="flex items-center gap-2 mb-4 px-1">
            <Sparkles size={13} className="text-amber-500" />
            <span className="text-[13px] font-black text-slate-500">
              {monthNum}월 · {myChild?.name} 유아의 5대 영역 발달 기록
            </span>
          </div>

          {/* Domain Cards */}
          {nuriDomains.map((domain, index) => {
            const detail = currentMonthlyReport.details[domain];
            if (!detail) return null;
            return (
              <div
                key={domain}
                className="bg-white/70 backdrop-blur-lg rounded-[2.2rem] border border-white/60 shadow-sm overflow-hidden"
              >
                {/* Card Header */}
                <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-slate-50">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                    {domainIcons[domain] || <ClipboardList size={18} className="text-slate-400" />}
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block leading-none mb-0.5">
                      영역 {index + 1}
                    </span>
                    <h4 className="text-[15px] font-black text-slate-800 leading-tight">{domain}</h4>
                  </div>
                </div>

                {/* Content */}
                <div className="px-5 py-4 space-y-3">
                  {/* 관찰 내용 */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                       <ClipboardList size={12} /> 관찰 내용
                    </label>
                    <p className="text-[13px] text-slate-600 leading-relaxed font-medium italic bg-slate-50 rounded-2xl px-4 py-3">
                      "{detail.content}"
                    </p>
                  </div>

                  {/* 교사 평가 */}
                  <div>
                    <label className="text-[10px] font-bold text-orange-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Lightbulb size={12} /> 관찰 평가
                    </label>
                    <p className="text-[13px] text-slate-700 leading-relaxed font-semibold bg-orange-50/60 rounded-2xl px-4 py-3 border border-orange-100/50">
                      {detail.evaluation}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Footer */}
          <div className="text-center pt-4 pb-2 text-slate-300 text-[11px] font-bold tracking-widest uppercase">
            — {monthNum}월 종합 평가서 —
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-24 bg-white/50 backdrop-blur-sm rounded-[2.5rem] border-2 border-dashed border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Inbox size={40} className="text-slate-200" />
          </div>
          <p className="text-[15px] font-black text-slate-700 mb-2">아직 도착한 보고서가 없어요</p>
          <p className="text-[13px] text-slate-400 font-medium text-center leading-relaxed px-10">
            {monthNum}월 평가서가 선생님으로부터<br />전송되면 이곳에서 확인할 수 있어요.
          </p>
          <div className="mt-5 flex items-center gap-1.5 text-amber-500 text-[12px] font-black">
            <BookOpen size={13} /> 선생님이 열심히 작성 중이에요!
          </div>
        </div>
      )}
    </div>
  );
}
