import { useState, useRef } from 'react';
import { useAppData } from '../../hooks';
import type { ObservationLog } from '../../types';
import { ImagePlus, Loader2, Camera, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

export default function ObservationPage() {
  const { children, observations, generateAIObservation } = useAppData();
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [generatedLog, setGeneratedLog] = useState<ObservationLog | null>(null);
  const [expandedObs, setExpandedObs] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!selectedChildId) return;
    setIsUploading(true);
    try { const result = await generateAIObservation(selectedChildId); setGeneratedLog(result); }
    finally { setIsUploading(false); }
  };

  const handleFileClick = () => { if (!selectedChildId) return; fileInputRef.current?.click(); };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChildId) return;
    setIsUploading(true);
    try { const result = await generateAIObservation(selectedChildId, file); setGeneratedLog(result); }
    finally { setIsUploading(false); }
  };

  return (
    <div className="p-6 pb-28 animate-fade-in">
      <h2 className="text-2xl font-black text-slate-900 mb-6">AI 관찰일지 📷</h2>

      {/* Child Select */}
      <div className="mb-4">
        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">아이 선택</label>
        <select
          className="w-full p-3 px-4 bg-white rounded-2xl text-sm font-semibold text-slate-700 appearance-none cursor-pointer outline-none transition-all"
          style={{ border: '2px solid #e2e8f0' }}
          value={selectedChildId}
          onChange={(e) => { setSelectedChildId(e.target.value); setGeneratedLog(null); }}
        >
          <option value="">아이를 선택하세요</option>
          {children.map((c) => (<option key={c.id} value={c.id}>{c.profileEmoji} {c.name}</option>))}
        </select>
      </div>

      {/* Upload Zone */}
      <div
        className={`w-full min-h-[180px] rounded-[2rem] flex flex-col items-center justify-center p-6 mb-4 cursor-pointer transition-all ${
          isUploading ? 'bg-blue-50 text-blue-600' :
          !selectedChildId ? 'bg-slate-50 text-slate-300 opacity-50 cursor-not-allowed' :
          'bg-slate-50 text-slate-300 hover:bg-slate-100 hover:text-blue-600'
        }`}
        style={{ border: isUploading ? '3px dashed #93c5fd' : '3px dashed #e2e8f0' }}
        onClick={handleFileClick}
      >
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        {isUploading ? (
          <>
            <Loader2 size={32} className="animate-spin-slow" />
            <p className="text-xs font-bold mt-3">AI가 사진을 분석하고 있습니다...</p>
            <p className="text-[10px] text-slate-400 mt-1">잠시만 기다려주세요</p>
          </>
        ) : (
          <>
            <div className="relative mb-3">
              <ImagePlus size={28} />
              <Camera size={16} className="absolute -bottom-1 -right-2 bg-blue-50 rounded-full p-[2px]" />
            </div>
            <p className="text-xs font-bold mt-2">활동 사진 촬영 및 업로드</p>
            <p className="text-[10px] text-slate-400 mt-1">{selectedChildId ? '사진을 업로드하면 AI가 자동으로 관찰일지를 작성합니다' : '먼저 아이를 선택해주세요'}</p>
          </>
        )}
      </div>

      {/* Quick Generate */}
      {selectedChildId && !generatedLog && (
        <button
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 mb-6 active:scale-[0.98] transition-all disabled:opacity-50"
          style={{ boxShadow: '0 6px 20px rgba(139,92,246,0.25)' }}
          onClick={handleUpload} disabled={isUploading}
        >
          {isUploading ? <><Loader2 size={18} className="animate-spin-slow" /> 생성 중...</> : <>✨ 사진 없이 AI 관찰일지 생성</>}
        </button>
      )}

      {/* Generated Result */}
      {generatedLog && (
        <div className="mb-6 animate-fade-in-up">
          <div className="mb-4">
            <p className="text-xs font-bold text-emerald-500 mb-1">🤖 AI 생성 완료</p>
            <p className="text-xs text-slate-500">{generatedLog.childName} · {generatedLog.date}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-2xl mb-4">
            <p className="text-xs text-slate-600 leading-relaxed">{generatedLog.content}</p>
          </div>
          <div className="flex flex-col gap-3 mb-4">
            {generatedLog.categories.map((cat, idx) => (
              <div key={idx} className="p-4 bg-white border border-slate-200 rounded-2xl" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <p className="text-[10px] font-black text-blue-600 uppercase italic tracking-tight mb-2"># {cat.name}</p>
                <p className="text-xs font-medium text-slate-600 leading-relaxed">{cat.analysis}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl">수정하기</button>
            <button className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-2xl active:scale-[0.98] transition-all" style={{ boxShadow: '0 6px 20px rgba(37,99,235,0.2)' }}>저장하기</button>
          </div>
        </div>
      )}

      {/* Past Observations */}
      <div className="mt-6">
        <h3 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2"><Calendar size={16} /> 작성된 관찰일지</h3>
        {observations.length === 0 ? (
          <p className="text-center text-slate-400 text-xs py-8">아직 작성된 관찰일지가 없습니다</p>
        ) : (
          <div className="flex flex-col gap-3">
            {observations.map((obs) => (
              <div key={obs.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden stagger-item">
                <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpandedObs(expandedObs === obs.id ? null : obs.id)}>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-800">{obs.childName}</span>
                    <span className="text-[10px] text-slate-400">{obs.date}</span>
                    {obs.isAIGenerated && <span className="text-[9px] px-[6px] py-[2px] bg-purple-50 text-purple-500 rounded-full font-bold">AI</span>}
                  </div>
                  {expandedObs === obs.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
                {expandedObs === obs.id && (
                  <div className="px-4 pb-4 animate-fade-in">
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">{obs.content}</p>
                    <div className="flex flex-col gap-2">
                      {obs.categories.map((cat, idx) => (
                        <div key={idx} className="flex gap-2 text-xs">
                          <span className="text-blue-600 font-bold whitespace-nowrap">#{cat.name}</span>
                          <span className="text-slate-500">{cat.analysis}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
