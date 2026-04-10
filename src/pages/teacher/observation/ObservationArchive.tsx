import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Edit2, Save, X, Loader2 } from 'lucide-react';
import { CustomSelect } from '../../../components/teacher/CustomSelect';
import type { ObservationLog, Child, NuriDomain } from '../../../types';

interface ObservationArchiveProps {
  observations: ObservationLog[];
  children: Child[];
  onDelete?: (id: string) => Promise<void>;
  onUpdate?: (id: string, data: Partial<ObservationLog>) => Promise<void>;
}

export function ObservationArchive({ observations, children, onDelete, onUpdate }: ObservationArchiveProps) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [filterMonth, setFilterMonth] = useState<string>(currentMonth);
  const [filterChild, setFilterChild] = useState<string>('');
  const [filterDomain, setFilterDomain] = useState<string>('');
  const [expandedObs, setExpandedObs] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // 편집 관련 상태
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ content: string; evaluation: string }>({ content: '', evaluation: '' });
  const [isSaving, setIsSaving] = useState(false);

  const nuriDomains: NuriDomain[] = ['신체운동·건강', '의사소통', '사회관계', '예술경험', '자연탐구'];

  const handleStartEdit = (e: React.MouseEvent, obs: ObservationLog) => {
    e.stopPropagation();
    setEditingId(obs.id);
    setEditValues({ content: obs.content, evaluation: obs.evaluation });
    if (expandedObs !== obs.id) setExpandedObs(obs.id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValues({ content: '', evaluation: '' });
  };

  const handleSaveEdit = async (id: string) => {
    if (!onUpdate) return;
    setIsSaving(true);
    try {
      await onUpdate(id, editValues);
      setEditingId(null);
    } catch (error) {
      console.error('Update error:', error);
      alert('수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // 카드 확장 이벤트 방지
    if (!onDelete) return;
    
    if (window.confirm('이 관찰 기록을 생활기록부에서 영구적으로 삭제하시겠습니까? 데이터베이스에서도 삭제됩니다.')) {
      setIsDeleting(id);
      try {
        await onDelete(id);
      } catch (error) {
        console.error('Delete error:', error);
        alert('삭제에 실패했습니다. 다시 시도해주세요.');
      } finally {
        setIsDeleting(null);
      }
    }
  };

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
            <div className="relative group min-w-0">
              <input 
                type="month" 
                className="bg-white border border-slate-200 rounded-2xl px-4 py-4 font-bold text-base outline-none w-full focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50/50 transition-all text-slate-700 shadow-sm box-border" 
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
          filteredObservations.map(obs => (
            <div key={obs.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-indigo-200 transition-all">
              <div 
                className="p-5 flex items-center justify-between cursor-pointer" 
                onClick={() => setExpandedObs(expandedObs === obs.id ? null : obs.id)}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-2xl shrink-0">
                    {children.find(c => c.id === obs.childId)?.profileEmoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-black text-slate-900 truncate">{obs.childName}</span>
                      <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {obs.categories?.[0]?.name || '영역 미지정'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold">{obs.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <button 
                    onClick={(e) => handleDelete(e, obs.id)}
                    disabled={isDeleting === obs.id || isSaving}
                    className="w-10 h-10 flex items-center justify-center bg-rose-50/50 border border-rose-100 rounded-xl text-rose-500 hover:bg-rose-100 hover:text-rose-600 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    title="기록 삭제"
                  >
                    <Trash2 size={16} className={isDeleting === obs.id ? "animate-pulse" : ""} />
                  </button>
                  {expandedObs === obs.id ? <ChevronUp size={18} className="text-slate-300" /> : <ChevronDown size={18} className="text-slate-300" />}
                </div>
              </div>
              {expandedObs === obs.id && (
                <div className="px-6 pb-7 animate-fade-in border-t border-slate-50 pt-6 space-y-6">
                   {editingId === obs.id ? (
                     // 편집 모드
                     <div className="space-y-5">
                       <div className="px-2">
                         <label className="text-[10px] font-black text-indigo-400 uppercase block mb-2 tracking-tighter">🔎 관찰 내용 수정</label>
                         <textarea 
                           className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[13px] font-medium text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50/30 transition-all min-h-[120px] resize-none"
                           value={editValues.content}
                           onChange={(e) => setEditValues({ ...editValues, content: e.target.value })}
                           disabled={isSaving}
                         />
                       </div>
                       <div className="px-2">
                         <label className="text-[10px] font-black text-indigo-400 uppercase block mb-2 tracking-tighter">💡 관찰 평가 수정</label>
                         <textarea 
                           className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[13px] font-medium text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50/30 transition-all min-h-[120px] resize-none"
                           value={editValues.evaluation}
                           onChange={(e) => setEditValues({ ...editValues, evaluation: e.target.value })}
                           disabled={isSaving}
                         />
                       </div>
                       <div className="flex gap-2 pt-2">
                         <button 
                           onClick={() => handleSaveEdit(obs.id)}
                           disabled={isSaving}
                           className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-50"
                         >
                           {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                           수정 사항 저장하기
                         </button>
                         <button 
                           onClick={handleCancelEdit}
                           disabled={isSaving}
                           className="px-6 py-4 bg-white border border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
                         >
                           <X size={18} />
                         </button>
                       </div>
                     </div>
                   ) : (
                     // 일반 보기 모드
                     <>
                       <div className="flex justify-end px-2 mb-2">
                         <button 
                           onClick={(e) => handleStartEdit(e, obs)}
                           className="flex items-center gap-2 text-[11px] font-black text-indigo-500 bg-indigo-50 px-4 py-2 rounded-full hover:bg-indigo-100 transition-all active:scale-95"
                         >
                           <Edit2 size={12} />
                           기록 수정하기
                         </button>
                       </div>
                       <div className="px-2">
                         <span className="text-[10px] font-black text-indigo-400 uppercase block mb-2 tracking-tighter">🔎 관찰 내용</span>
                         <p className="text-[13px] font-bold text-indigo-900/90 leading-relaxed whitespace-pre-wrap">
                           {obs.content}
                         </p>
                       </div>
                       <div className="bg-slate-50/80 p-5 rounded-[1.5rem] border border-slate-100">
                         <span className="text-[10px] font-black text-indigo-400 uppercase block mb-2 tracking-tighter">💡 관찰 평가</span>
                         <p className="text-[13px] font-bold text-indigo-900 leading-relaxed whitespace-pre-wrap">
                           {obs.evaluation || "분석된 평가 내용이 없습니다."}
                         </p>
                       </div>
                     </>
                   )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-slate-400 font-bold bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
            기록 데이터가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
