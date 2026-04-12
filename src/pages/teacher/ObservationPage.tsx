import { useState } from 'react';
import { useAppData } from '../../hooks';
import { Sparkles, ArrowLeft, Users } from 'lucide-react';
import { ChildListGrid } from '../../components/teacher/ChildListGrid';
import { ObservationHome } from './observation/ObservationHome';
import { QuickMemoForm } from './observation/QuickMemoForm';
import { ObservationArchive } from './observation/ObservationArchive';
import { MonthlyReportView } from './observation/MonthlyReportView';
import type { ObservationLog } from '../../types';
import { formatDateISO } from '../../utils/date';

type PageType = 'home' | 'quick_list' | 'quick_memo' | 'archive' | 'report';

export default function ObservationPage() {
  const { children, observations, generateAIObservation, addObservation, deleteObservation, updateObservation } = useAppData();
  
  const [activePage, setActivePage] = useState<PageType>('home');
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // Quick Memo States
  const [quickMemo, setQuickMemo] = useState('');
  const [isGeneratingAIObs, setIsGeneratingAIObs] = useState(false);
  const [aiDraft, setAiDraft] = useState<ObservationLog | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('신체운동·건강');



  const [isSaving, setIsSaving] = useState(false);

  const handleGoBack = () => {
    if (activePage === 'quick_memo') setActivePage('quick_list');
    else setActivePage('home');
    setAiDraft(null); 
  };

  const handleGenerateAI = async () => {
    if (!selectedChildId || !selectedCategory) return;
    setIsGeneratingAIObs(true);
    try {
      const draft = await generateAIObservation(selectedChildId, quickMemo, selectedCategory);
      setAiDraft(draft);
    } finally {
      setIsGeneratingAIObs(false);
    }
  };

  const handleSaveToArchive = async () => {
    if (aiDraft && !isSaving) {
      setIsSaving(true);
      try {
        await addObservation(aiDraft);
        alert("생활기록부로 저장되었습니다.");
        setQuickMemo('');
        setAiDraft(null);
        setActivePage('archive');
      } catch (error) {
        console.error("Save error:", error);
        alert("저장 중 오류가 발생했습니다. 다시 시도해주세요.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSaveDirect = async () => {
    if (!selectedChildId || !quickMemo.trim() || !selectedCategory || isSaving) return;
    
    const selectedChild = children.find(c => c.id === selectedChildId);
    if (!selectedChild) return;

    setIsSaving(true);
    try {
      const newLog: ObservationLog = {
        id: `obs-${Date.now()}`,
        childId: selectedChildId,
        childName: selectedChild.name,
        date: formatDateISO(),
        categories: [{ name: selectedCategory, analysis: "" }],
        content: quickMemo,
        evaluation: "(교사 직접 작성)",
        isAIGenerated: false,
      };

      await addObservation(newLog);
      alert("생활기록부로 저장되었습니다.");
      setQuickMemo('');
      setActivePage('archive');
    } catch (error) {
      console.error("Direct save error:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen relative print:bg-white print:p-0 overflow-x-hidden">
      
      {activePage === 'home' && (
        <ObservationHome onNavigate={(page) => setActivePage(page)} />
      )}

      {activePage === 'quick_list' && (
        <div className="p-6 md:p-12 max-w-4xl mx-auto animate-fade-in-right h-full print:hidden">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={handleGoBack} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all active:scale-90 shadow-sm"><ArrowLeft size={18} /></button>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">원아 목록</h2>
          </div>

          <div className="mb-6 flex items-center justify-between px-1">
             <h3 className="text-lg font-black text-slate-800">원아 목록</h3>
             <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100/50 shadow-sm">인원 {children.length}명</span>
          </div>

          <ChildListGrid 
            childrenData={children}
            onChildClick={(id) => { setSelectedChildId(id); setActivePage('quick_memo'); }}
            checkCompletion={() => false}
          />
        </div>
      )}

      {activePage === 'quick_memo' && selectedChildId && (
        <div className="p-6 md:p-10 max-w-3xl mx-auto animate-fade-in-up h-full print:hidden">
           <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200">
             <button onClick={handleGoBack} className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-all active:scale-95"><ArrowLeft size={24} /></button>
             <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 truncate"><Sparkles size={28} className="text-indigo-500 shrink-0" /> 메모 작성</h2>
           </div>
           
           <QuickMemoForm 
             selectedChild={children.find(c => c.id === selectedChildId)!}
             memo={quickMemo} setMemo={setQuickMemo}
             isGenerating={isGeneratingAIObs}
             isSaving={isSaving}
             selectedCategory={selectedCategory}
             setSelectedCategory={setSelectedCategory}
             onGenerateAI={handleGenerateAI}
             aiDraft={aiDraft} setAiDraft={setAiDraft}
             onSave={handleSaveToArchive}
             onSaveDirect={handleSaveDirect}
           />
        </div>
      )}

      {activePage === 'archive' && (
        <div className="p-6 md:p-12 max-w-4xl mx-auto animate-fade-in-left h-full print:hidden">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200">
             <button onClick={handleGoBack} className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-all active:scale-95"><ArrowLeft size={24} /></button>
             <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 truncate"><Users size={28} className="text-indigo-500 shrink-0" /> 생활 기록부</h2>
          </div>
          <ObservationArchive 
            observations={observations} 
            children={children} 
            onDelete={deleteObservation} 
            onUpdate={updateObservation}
          />
        </div>
      )}

      {activePage === 'report' && (
        <div className="p-6 md:p-12 max-w-4xl mx-auto animate-fade-in-up h-full">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200 print:hidden">
             <button onClick={handleGoBack} className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-all active:scale-95"><ArrowLeft size={24} /></button>
             <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 truncate"><Users size={28} className="text-indigo-500 shrink-0" /> 종합 평가 생성</h2>
          </div>
          <MonthlyReportView children={children} observations={observations} />
        </div>
      )}

    </div>
  );
}
