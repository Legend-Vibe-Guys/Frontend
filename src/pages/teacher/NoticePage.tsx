import { useState } from 'react';
import { useAppData } from '../../hooks';
import { NOTICE_KEYWORDS, CUSHION_LEVELS } from '../../constants/mockData';
import type { CushionLevel, Notice } from '../../types';
import { Sparkles, Send, ChevronDown, ChevronUp, Check, Loader2, MessageSquare } from 'lucide-react';

export default function NoticePage() {
  const { children, attendance, generateAINotice, generateBatchNotices, notices } = useAppData();
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [cushionLevel, setCushionLevel] = useState<CushionLevel>('medium');
  const [memos, setMemos] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNotices, setGeneratedNotices] = useState<Notice[]>([]);
  const [expandedNotice, setExpandedNotice] = useState<string | null>(null);
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [step, setStep] = useState<'setup' | 'select' | 'result'>('setup');
  const [showCommon, setShowCommon] = useState(false);

  const presentChildren = children.filter((c) =>
    attendance.find((a) => a.childId === c.id && a.status === 'present'),
  );
  const commonNotices = notices.filter((n) => n.type === 'common');

  const toggleKeyword = (kw: string) =>
    setSelectedKeywords((prev) => prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw]);
  const toggleChild = (childId: string) =>
    setSelectedChildren((prev) => prev.includes(childId) ? prev.filter((id) => id !== childId) : [...prev, childId]);
  const selectAllChildren = () => {
    setSelectedChildren(selectedChildren.length === presentChildren.length ? [] : presentChildren.map((c) => c.id));
  };

  const handleGenerate = async () => {
    if (selectedChildren.length === 0) return;
    setIsGenerating(true);
    try {
      const result = selectedChildren.length === 1
        ? [await generateAINotice(selectedChildren[0], selectedKeywords, memos[selectedChildren[0]] || '', cushionLevel)]
        : await generateBatchNotices(selectedChildren, selectedKeywords, '', cushionLevel);
      setGeneratedNotices(result);
      setStep('result');
    } finally { setIsGenerating(false); }
  };

  const handleReset = () => {
    setStep('setup'); setSelectedKeywords([]); setSelectedChildren([]); setMemos({}); setGeneratedNotices([]);
  };

  return (
    <div className="p-6 pb-28 animate-fade-in">
      {/* Common Notice Toggle */}
      <div className="flex items-center justify-between p-3 px-4 bg-slate-50 rounded-2xl mb-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setShowCommon(!showCommon)}>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <MessageSquare size={16} />
          <span>공통 알림장</span>
          <span className="bg-blue-600 text-white text-[9px] px-[6px] py-[2px] rounded-full font-bold">{commonNotices.length}</span>
        </div>
        {showCommon ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </div>

      {showCommon && (
        <div className="mb-6 flex flex-col gap-3 animate-fade-in">
          {commonNotices.map((n) => (
            <div key={n.id} className="p-4 bg-white border border-slate-200 rounded-2xl">
              <p className="text-[10px] text-slate-400 mb-1">{n.date}</p>
              <p className="font-bold text-sm text-slate-800 mb-2">{n.title}</p>
              <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">{n.content}</p>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">AI 알림장 ✨</h2>

      {/* Step 1 */}
      {step === 'setup' && (
        <div className="animate-fade-in">
          <div className="mb-6">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wide mb-3">활동 키워드 선택</label>
            <div className="flex flex-wrap gap-2">
              {NOTICE_KEYWORDS.map((kw) => (
                <button
                  key={kw}
                  className={`px-3 py-2 rounded-full text-xs font-semibold transition-all ${
                    selectedKeywords.includes(kw)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-50 text-slate-500 border border-slate-200 hover:border-blue-300'
                  }`}
                  style={selectedKeywords.includes(kw) ? { boxShadow: '0 4px 12px rgba(37,99,235,0.2)' } : {}}
                  onClick={() => toggleKeyword(kw)}
                >{kw}</button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wide mb-3">쿠션어 강도</label>
            <div className="flex gap-2">
              {CUSHION_LEVELS.map((level) => (
                <button
                  key={level.value}
                  className={`flex-1 p-4 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                    cushionLevel === level.value ? 'bg-blue-50' : 'bg-white hover:border-blue-300'
                  }`}
                  style={{ border: cushionLevel === level.value ? '2px solid #2563eb' : '2px solid #e2e8f0' }}
                  onClick={() => setCushionLevel(level.value)}
                >
                  <span className="text-xl">{level.emoji}</span>
                  <span className="text-xs font-bold text-slate-800">{level.label}</span>
                  <span className="text-[9px] text-slate-400">{level.description}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl active:scale-[0.98] transition-all disabled:opacity-40"
            style={{ boxShadow: '0 6px 20px rgba(37,99,235,0.2)' }}
            onClick={() => setStep('select')}
            disabled={selectedKeywords.length === 0}
          >다음: 아이 선택 →</button>
        </div>
      )}

      {/* Step 2 */}
      {step === 'select' && (
        <div className="animate-fade-in">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] font-black text-slate-400 uppercase">아이별 특이사항 & 선택</label>
              <button className="text-xs font-bold text-blue-600 px-3 py-1 rounded-full bg-blue-50" onClick={selectAllChildren}>
                {selectedChildren.length === presentChildren.length ? '전체 해제' : '전체 선택'}
              </button>
            </div>
            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
              {presentChildren.map((child) => {
                const isSelected = selectedChildren.includes(child.id);
                return (
                  <div key={child.id} className={`p-3 px-4 rounded-2xl transition-all ${isSelected ? 'bg-blue-50' : 'bg-white'}`} style={{ border: isSelected ? '1px solid #93c5fd' : '1px solid #e2e8f0' }}>
                    <div className="flex items-center cursor-pointer" onClick={() => toggleChild(child.id)}>
                      <div className="flex items-center gap-3">
                        <div className={`w-[22px] h-[22px] rounded-lg flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 text-white' : 'text-transparent'}`} style={{ border: isSelected ? '2px solid #2563eb' : '2px solid #e2e8f0' }}>
                          {isSelected && <Check size={12} />}
                        </div>
                        <span className="text-lg">{child.profileEmoji}</span>
                        <span className="font-bold text-sm text-slate-700">{child.name}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="mt-2 animate-fade-in">
                        <input type="text" className="w-full py-2 px-3 bg-white rounded-xl text-xs text-slate-600 outline-none transition-all" style={{ border: '1px solid #e2e8f0' }} placeholder={`${child.name} 특이사항 입력...`} value={memos[child.id] || ''} onChange={(e) => setMemos((prev) => ({ ...prev, [child.id]: e.target.value }))} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="px-5 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl text-sm" onClick={() => setStep('setup')}>← 이전</button>
            <button
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black rounded-2xl text-sm active:scale-[0.98] transition-all disabled:opacity-50"
              style={{ boxShadow: '0 6px 20px rgba(37,99,235,0.2)' }}
              onClick={handleGenerate}
              disabled={selectedChildren.length === 0 || isGenerating}
            >
              {isGenerating ? (<><Loader2 size={18} className="animate-spin-slow" /> 생성 중...</>) : (<><Sparkles size={18} /> AI 알림장 일괄 생성 ({selectedChildren.length}명)</>)}
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 'result' && (
        <div className="animate-fade-in">
          <p className="text-sm font-bold text-emerald-500 mb-4">✅ {generatedNotices.length}명의 알림장이 생성되었습니다</p>
          <div className="flex flex-col gap-3">
            {generatedNotices.map((notice) => (
              <div key={notice.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden stagger-item">
                <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpandedNotice(expandedNotice === notice.id ? null : notice.id)}>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-800">{notice.childName}</span>
                    <span className="text-[10px] text-blue-600 font-semibold">미리보기</span>
                  </div>
                  {expandedNotice === notice.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
                {expandedNotice === notice.id && (
                  <div className="px-4 pb-4 animate-fade-in">
                    <p className="text-xs leading-relaxed text-slate-600 bg-amber-50 p-4 rounded-xl whitespace-pre-line">{notice.content}</p>
                    <div className="flex gap-1 mt-3 flex-wrap">
                      {notice.keywords?.map((kw) => (
                        <span key={kw} className="text-[9px] px-2 py-[2px] rounded-full bg-blue-50 text-blue-600 font-bold">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button className="px-5 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl text-sm" onClick={handleReset}>새로 작성</button>
            <button className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black rounded-2xl text-sm active:scale-[0.98] transition-all" style={{ boxShadow: '0 6px 20px rgba(16,185,129,0.2)' }}>
              <Send size={18} /> 전체 전송
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
