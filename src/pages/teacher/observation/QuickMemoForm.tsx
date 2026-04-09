import { Sparkles, Loader2, Save } from 'lucide-react';
import type { Child, ObservationLog } from '../../../types';

interface QuickMemoFormProps {
  selectedChild: Child;
  memo: string;
  setMemo: (val: string) => void;
  isGenerating: boolean;
  onGenerateAI: () => void;
  aiDraft: ObservationLog | null;
  setAiDraft: (draft: ObservationLog | null) => void;
  onSave: () => void;
}

export function QuickMemoForm({
  selectedChild,
  memo,
  setMemo,
  isGenerating,
  onGenerateAI,
  aiDraft,
  setAiDraft,
  onSave
}: QuickMemoFormProps) {

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
        <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center text-3xl shadow-inner shrink-0">
          {selectedChild.profileEmoji}
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-800">
            {selectedChild.name} 관찰
          </h3>
          <p className="text-slate-400 font-bold text-xs mt-1 whitespace-nowrap">오늘 있었던 특별한 행동을 남겨주세요.</p>
        </div>
      </div>

      <div className="space-y-6 mb-8">
        <div className="flex flex-col">
          <label className="text-[11px] font-black text-slate-400 mb-3 ml-2 uppercase tracking-wider">관찰 텍스트 메모</label>
          <textarea 
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-base font-medium outline-none focus:border-indigo-400 focus:bg-white transition-all resize-none shadow-inner min-h-[160px]"
            placeholder="예: 자유시간에 블록으로 높은 성을 쌓았습니다. 친구에게 장난감을 양보했습니다."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>
      </div>

      {!aiDraft || isGenerating ? (
        <button
          className="w-full py-5 text-lg bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
          onClick={onGenerateAI}
          disabled={isGenerating || !memo.trim()}
        >
          {isGenerating ? (
            <><Loader2 size={24} className="animate-spin" /> AI 분석 중...</>
          ) : (
            <><Sparkles size={24} className="text-amber-400" /> 초안 완성하기</>
          )}
        </button>
      ) : (
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6 animate-fade-in-up mt-6">
          <div className="flex items-center justify-between mb-4 border-b border-indigo-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-indigo-700 bg-white border border-indigo-200 px-3 py-1 rounded-full uppercase">AI 초안</span>
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{aiDraft.categories[0].name}</span>
            </div>
            <button className="text-[10px] font-bold text-slate-400 underline" onClick={() => setAiDraft(null)}>취소</button>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-slate-400 mb-2 ml-1 uppercase tracking-tight">🔎 관찰 내용</label>
              <textarea
                className="w-full bg-white border border-indigo-100 rounded-2xl p-4 text-sm font-medium text-slate-800 outline-none focus:border-indigo-400 resize-none shadow-sm leading-relaxed"
                style={{ minHeight: '120px' }}
                value={aiDraft.content}
                onChange={(e) => setAiDraft({ ...aiDraft, content: e.target.value })}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-indigo-400 mb-2 ml-1 uppercase tracking-tight">💡 관찰 평가</label>
              <textarea
                className="w-full bg-white/50 border border-indigo-100 rounded-2xl p-4 text-sm font-medium text-indigo-900 outline-none focus:border-indigo-400 resize-none shadow-sm leading-relaxed"
                style={{ minHeight: '120px' }}
                value={aiDraft.evaluation}
                onChange={(e) => setAiDraft({ ...aiDraft, evaluation: e.target.value })}
              />
            </div>
          </div>

          <button
            className="w-full py-5 text-lg bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-lg shadow-indigo-200/50"
            onClick={onSave}
          >
            <Save size={24} /> 저장하기
          </button>
        </div>
      )}
    </div>
  );
}
