import { useState, useMemo, useEffect } from 'react';
import { Loader2, Sparkles, Download, Save, Edit2, CheckCircle2, ChevronLeft, Trash2, X, MousePointer2, Send } from 'lucide-react';
import { CustomSelect } from '../../../components/teacher/CustomSelect';
import { useAppData } from '../../../store/AppDataContext';
import type { Child, ObservationLog, MonthlyReport, NuriDomain, DomainDetail } from '../../../types';

interface MonthlyReportViewProps {
  children: Child[];
  observations: ObservationLog[];
}

const nuriDomains: NuriDomain[] = ['신체운동·건강', '의사소통', '사회관계', '예술경험', '자연탐구'];

export function MonthlyReportView({ children, observations }: MonthlyReportViewProps) {
  const { monthlyReports, saveMonthlyReport, deleteMonthlyReport, fetchMonthlyReports, sendMonthlyReportToParent } = useAppData();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [reportChildId, setReportChildId] = useState<string>('');
  const [reportMonth, setReportMonth] = useState<string>(currentMonth);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [activeDomain, setActiveDomain] = useState<NuriDomain | null>(null);
  const [pickedEntries, setPickedEntries] = useState<Record<string, DomainDetail>>({});

  const childOptions = useMemo(() => [
    { value: '', label: '아동 선택' },
    ...children.map(c => ({ value: c.id, label: c.name, emoji: c.profileEmoji }))
  ], [children]);

  const childObservations = useMemo(() => {
    if (!reportChildId || !reportMonth) return [];
    return observations.filter(obs => obs.childId === reportChildId && obs.date.startsWith(reportMonth));
  }, [observations, reportChildId, reportMonth]);

  const existingReports = useMemo(() => {
    if (!reportChildId || !reportMonth) return [];
    return monthlyReports.filter(r => r.childId === reportChildId && r.reportMonth === reportMonth);
  }, [monthlyReports, reportChildId, reportMonth]);

  const domainCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    nuriDomains.forEach(d => counts[d] = 0);
    childObservations.forEach(obs => {
      obs.categories.forEach(cat => {
        if (counts[cat.name] !== undefined) counts[cat.name]++;
      });
    });
    return counts;
  }, [childObservations]);

  const getDomainDisplayName = (name: string) => {
    if (name === '신체운동·건강') return '신체';
    return name;
  };

  const handleGenerate = async () => {
    if (!reportChildId || !reportMonth || !selectedChild) return;
    
    setIsGenerating(true);
    try {
      // 인위적인 지연 (분석 효과)
      await new Promise(r => setTimeout(r, 800));

      const newReport: MonthlyReport = {
        id: `rep-${Date.now()}`,
        childId: reportChildId,
        childName: selectedChild.name,
        reportMonth: reportMonth,
        details: { ...pickedEntries },
        isSaved: false
      };
      
      setReport(newReport);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!report) return;
    setIsSaving(true);
    try {
      await saveMonthlyReport(report);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendToParent = async () => {
    if (!report) return;
    setIsSending(true);
    try {
      await sendMonthlyReportToParent(report);
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('평가서를 삭제하시겠습니까? 데이터는 복구할 수 없습니다.')) {
      deleteMonthlyReport(id);
    }
  };

  const handleEditExisting = (existing: MonthlyReport) => {
    setReport(existing);
  };

  const handleCloseEditor = () => {
    setReport(null);
  };

  const handlePrint = () => window.print();

  const selectedChild = children.find(c => c.id === reportChildId);
  const selectedMonthNum = reportMonth ? parseInt(reportMonth.split('-')[1]) : 0;

  // 데이터 유실 방지를 위한 자동 페칭
  useEffect(() => {
    if (reportChildId) {
      fetchMonthlyReports(reportChildId);
    }
  }, [reportChildId, fetchMonthlyReports]);

  return (
    <div className="animate-fade-in-up h-full pb-20 relative">
      {showSaveSuccess && (
        <div className="fixed top-1/2 left-0 right-0 -translate-y-1/2 pointer-events-none z-[2000] flex justify-center px-6">
          <div className="bg-slate-900/95 backdrop-blur-md text-white px-8 py-5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col items-center gap-3 border border-white/10 animate-scale-in min-w-[200px]">
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40">
              <CheckCircle2 size={24} className="text-white" />
            </div>
            <span className="text-sm sm:text-base font-black tracking-tight">저장이 완료되었습니다</span>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 mb-8 shadow-sm flex flex-col items-center print:hidden">
        <div className="flex flex-col gap-6 w-full mb-8">
          <CustomSelect 
            label="👤 평가 대상 원아 선택"
            value={reportChildId}
            options={childOptions}
            onChange={(val) => { 
              setReportChildId(val); 
              setReport(null); 
              setPickedEntries({}); 
              if (val) fetchMonthlyReports(val);
            }}
            placeholder="아이를 선택해주세요"
            accentColor="emerald"
          />
          <div className="flex flex-col">
            <label className="text-[11px] font-black text-slate-400 uppercase mb-3 tracking-widest px-1">📅 평가 기준 월 설정</label>
            <div className="relative w-full overflow-hidden">
              <input 
                type="month" 
                className="bg-white border border-slate-200 rounded-2xl px-4 py-4 font-bold text-left outline-none w-full min-w-0 max-w-full focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50/50 transition-all text-slate-700 shadow-sm box-border" 
                value={reportMonth} 
                onChange={(e) => { setReportMonth(e.target.value); setReport(null); setPickedEntries({}); }} 
              />
            </div>
          </div>
        </div>

        {reportChildId && reportMonth && (
          <div className="w-full border-t border-slate-100 pt-8 flex flex-col items-center">
             {existingReports.length > 0 && (
               <div className="w-full mb-10">
                 <div className="flex items-center justify-between mb-4 px-1">
                   <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider">작성된 종합 평가</h3>
                   <span className="bg-emerald-100 text-emerald-600 px-2.5 py-1 rounded-full text-[10px] font-black">{existingReports.length}건</span>
                 </div>
                 <div className="space-y-3">
                   {existingReports.map((r) => (
                     <div 
                      key={r.id} 
                      onClick={() => handleEditExisting(r)}
                      className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between group hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer"
                     >
                       <div className="flex flex-col flex-1">
                         <span className="text-sm font-bold text-slate-700">{selectedChild?.name}의 {selectedMonthNum}월 종합 평가</span>
                         <span className="text-[10px] text-slate-400 font-medium">
                           {r.updatedAt ? `최근 수정: ${r.updatedAt.split('T')[0]}` : `작성일: ${r.createdAt?.split('T')[0] || '날짜 정보 없음'}`}
                         </span>
                       </div>
                       <div className="flex items-center gap-3 ml-4">
                         <div className="text-slate-300 group-hover:text-emerald-400 transition-colors">
                           <Edit2 size={14} />
                         </div>
                         <button 
                           onClick={(e) => handleDelete(e, r.id)}
                           className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-300 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm active:scale-95"
                         >
                           <Trash2 size={16} />
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             <div className="w-full mb-8">
               <div className="flex items-start gap-3 mb-6 px-1">
                 <span className="text-2xl shrink-0 mt-0.5">📊</span>
                 <div className="flex flex-col">
                   <h3 className="text-lg font-black text-slate-800 leading-tight">
                     {selectedChild?.name}의 {selectedMonthNum}월 누적 데이터
                   </h3>
                   <span className="text-sm text-slate-400 font-bold mt-1">총 {childObservations.length}건의 기록이 있습니다</span>
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-2.5">
                 {nuriDomains.map(domain => {
                   const count = domainCounts[domain] || 0;
                   const isEmpty = count === 0;
                   const hasData = count > 0;
                   return (
                      <button 
                        key={domain}
                        onClick={() => setActiveDomain(domain)}
                        className={`px-4 py-3 rounded-2xl border text-[13px] font-bold transition-all flex flex-col gap-1 text-left relative overflow-hidden group/btn ${
                          isEmpty 
                            ? 'bg-rose-50 border-rose-100 text-rose-500 shadow-sm shadow-rose-50' 
                            : pickedEntries[domain]
                              ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-100'
                              : hasData
                                ? 'bg-white border-slate-200 text-emerald-600 hover:border-emerald-300 hover:shadow-md'
                                : 'bg-slate-50 border-slate-100 text-slate-600'
                        }`}
                      >
                        <span className={pickedEntries[domain] ? 'text-emerald-100 text-[10px] uppercase tracking-tighter' : isEmpty ? 'text-rose-300 text-[10px] uppercase tracking-tighter' : hasData ? 'text-emerald-400 text-[10px] uppercase tracking-tighter' : 'text-slate-400 text-[10px] uppercase tracking-tighter'}>
                          {getDomainDisplayName(domain)}
                        </span>
                        <div className="flex items-center justify-between">
                          <span className={pickedEntries[domain] ? 'font-black text-sm text-white' : isEmpty ? 'font-black text-sm' : hasData ? 'font-black text-emerald-700 text-sm' : 'text-slate-700 text-sm'}>
                            {count}건 {pickedEntries[domain] && '• 선택됨'}
                          </span>
                          {hasData && !pickedEntries[domain] && (
                            <MousePointer2 size={12} className="opacity-0 group-hover/btn:opacity-100 transition-opacity text-emerald-400" />
                          )}
                        </div>
                        {pickedEntries[domain] && (
                          <div className="absolute top-1 right-2">
                            <CheckCircle2 size={14} className="text-emerald-200" />
                          </div>
                        )}
                      </button>
                   );
                 })}
               </div>
             </div>

             <button
               className={`w-full py-5 font-black rounded-2xl transition-all shadow-xl active:scale-[0.98] ${
                 Object.keys(pickedEntries).length === 5 
                   ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100' 
                   : 'bg-slate-200 text-slate-400 cursor-not-allowed'
               }`}
               onClick={handleGenerate}
               disabled={isGenerating || Object.keys(pickedEntries).length < 5}
             >
               {isGenerating ? (
                 <span className="flex items-center justify-center gap-2">
                   <Loader2 size={24} className="animate-spin" /> 분석 및 평가서 생성 중...
                 </span>
               ) : (
                 <span className="flex items-center justify-center gap-2">
                   <Sparkles size={24} /> 종합 평가 생성하기
                 </span>
               )}
             </button>
          </div>
        )}
      </div>

      {report && (
        <div className="fixed inset-0 z-[150] bg-white animate-slide-up overflow-y-auto print:relative print:z-0 print:overflow-visible">
          <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between print:hidden">
            <button 
              onClick={handleCloseEditor}
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
            >
              <ChevronLeft size={28} />
            </button>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">
              {report.isSaved ? '종합 평가서 수정' : '종합 평가서 작성'}
            </h2>
            <div className="w-10"></div>
          </div>

          <div className="max-w-5xl mx-auto w-full px-6 py-10 sm:py-16 print:max-w-none print:p-0 print:m-0">
            <div className="text-center mb-12 pb-10 border-b-2 border-slate-900/5 print:mb-6 print:pb-4 print:border-slate-200">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tighter mb-8 leading-tight break-keep">
                유아 발달 종합 평가서
              </h2>
              <div className="inline-flex items-center justify-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl font-bold text-slate-600 border border-slate-100 print:bg-transparent print:border-none">
                  <span className="text-slate-800 text-sm sm:text-base font-black">{report.childName} 유아</span>
                  <span className="text-slate-200">|</span>
                  <span className="text-slate-500 text-xs sm:text-sm">{report.reportMonth.split('-')[0]}년 {report.reportMonth.split('-')[1]}월</span>
              </div>
            </div>

            <div className="space-y-16">
              {nuriDomains.map(domain => (
                <div key={domain} className="group break-inside-avoid">
                  <h4 className="font-black text-emerald-700 mb-6 flex items-center gap-3 text-sm sm:text-base md:text-lg uppercase tracking-wider border-l-4 border-emerald-500 pl-4 print:mb-2 print:text-base print:border-l-8">
                    {domain}
                  </h4>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="relative">
                      <label className="text-[10px] font-black text-slate-400 mb-2 ml-1 uppercase block tracking-tighter print:hidden">🔎 관찰 내용 (사실)</label>
                      <textarea
                        className="w-full text-sm sm:text-base leading-relaxed font-medium text-slate-600 bg-slate-50/50 border border-slate-100 rounded-2xl p-4 sm:p-5 outline-none focus:bg-white focus:border-slate-300 transition-all resize-none shadow-inner print:p-0 print:text-[14px] print:text-slate-700 print:bg-transparent print:border-none print:shadow-none print:min-h-0 print:leading-snug"
                        style={{ minHeight: '120px' }}
                        value={report.details[domain]?.content || ''}
                        onChange={(e) => {
                          setReport({
                            ...report,
                            details: { 
                              ...report.details, 
                              [domain]: { ...report.details[domain], content: e.target.value } 
                            }
                          })
                        }}
                      />
                    </div>
                    <div className="relative">
                      <label className="text-[10px] font-black text-emerald-500 mb-2 ml-1 uppercase block tracking-tighter print:hidden">💡 관찰 평가 (분석)</label>
                      <textarea
                        className="w-full text-sm sm:text-base leading-relaxed font-bold text-slate-800 bg-white border border-emerald-100 rounded-2xl p-4 sm:p-5 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50/30 transition-all resize-none shadow-sm print:p-0 print:text-[14px] print:text-slate-900 print:bg-transparent print:border-none print:shadow-none print:min-h-0 print:leading-snug print:mt-1"
                        style={{ minHeight: '140px' }}
                        value={report.details[domain]?.evaluation || ''}
                        onChange={(e) => {
                          setReport({
                            ...report,
                            details: { 
                              ...report.details, 
                              [domain]: { ...report.details[domain], evaluation: e.target.value } 
                            }
                          })
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-20 flex flex-col gap-6 pb-20 print:hidden max-w-4xl mx-auto w-full">
              {/* 상단 버튼 그룹: 저장 및 인쇄 */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  className="py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all disabled:opacity-50" 
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 size={24} className="animate-spin" /> : <Save size={20} />}
                  <span className="text-sm sm:text-base">{report.isSaved ? '수정하기' : '저장하기'}</span>
                </button>
                
                <button 
                  className="py-5 bg-slate-900 hover:bg-black text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all" 
                  onClick={handlePrint}
                >
                  <Download size={20} />
                  <span className="text-sm sm:text-base">PDF 인쇄</span>
                </button>
              </div>

              {/* 하단 버튼: 부모에게 전송 (독립 행) */}
              <button 
                className={`w-full py-6 font-black rounded-[2rem] flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all disabled:opacity-50 ${
                  isSending 
                    ? 'bg-slate-100 text-slate-400'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                }`}
                onClick={handleSendToParent}
                disabled={isSending}
                title="작성된 내용을 부모님 앱으로 전송합니다"
              >
                {isSending ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} className="text-indigo-200" />}
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-base sm:text-lg">부모님께 전송하기</span>
                  <span className="text-[10px] opacity-60 font-medium">작성된 내용이 전달됩니다</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeDomain && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-scale-in">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">{activeDomain} 기록 선택</h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{selectedMonthNum}월 누적 데이터 중 선택</p>
                </div>
              </div>
              <button onClick={() => setActiveDomain(null)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {childObservations
                .filter(obs => obs.categories.some(cat => cat.name === activeDomain))
                .map((obs) => {
                  const isSelected = pickedEntries[activeDomain]?.content === obs.content;
                  return (
                    <div 
                      key={obs.id}
                      className={`group border-2 rounded-3xl p-5 transition-all cursor-pointer ${isSelected ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200 hover:bg-slate-50/50'}`}
                      onClick={() => {
                        setPickedEntries({
                          ...pickedEntries,
                          [activeDomain]: { content: obs.content, evaluation: obs.evaluation }
                        });
                        setActiveDomain(null);
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{obs.date}</span>
                        {isSelected && (
                          <span className="text-[11px] font-black text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 size={14} /> 선택됨
                          </span>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">관찰 내용</label>
                          <p className="text-sm font-bold text-slate-700 leading-relaxed line-clamp-3">{obs.content}</p>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-emerald-500 uppercase block mb-1">교사 평가</label>
                          <p className="text-sm font-bold text-emerald-700 leading-relaxed line-clamp-3 italic">"{obs.evaluation}"</p>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {childObservations.filter(obs => obs.categories.some(cat => cat.name === activeDomain)).length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <Trash2 size={24} className="text-slate-200" />
                  </div>
                  <p className="font-bold text-sm">해당 영역의 관찰 기록이 없습니다.</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 shrink-0">
              <button onClick={() => setActiveDomain(null)} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all">
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
