import { useState, useEffect } from 'react';
import { useAppData } from '../../hooks';
import type { Notice } from '../../types';
import {
  Sparkles,
  Send,
  MessageSquare,
  Image as ImageIcon,
  CheckCircle,
  RefreshCcw,
  X
} from 'lucide-react';

export default function NoticePage() {
  const { children, attendance, addNotice, generateAINotice, notices, schedules } = useAppData();
  
  const [activeTab, setActiveTab] = useState<'common' | 'individual'>('common');

  // --- Common Notice State ---
  const [commonTitle, setCommonTitle] = useState('');
  const [commonContent, setCommonContent] = useState('');
  const [commonPhoto, setCommonPhoto] = useState<string | null>(null);

  // --- Individual Notice State ---
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [activitySummary, setActivitySummary] = useState('');
  const [memoLength, setMemoLength] = useState<'short' | 'long'>('short');
  const [memos, setMemos] = useState<Record<string, string>>({});
  const [drafts, setDrafts] = useState<Record<string, Notice>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const presentChildren = children.filter((c) =>
    attendance.find((a) => a.childId === c.id && a.status === 'present')
  );
  const commonNotices = notices.filter((n) => n.type === 'common');
  const individualNotices = notices.filter((n) => n.type === 'individual');

  const todayString = new Date().toISOString().split('T')[0];
  const completedIndividualChildIds = new Set(individualNotices.filter(n => n.date === todayString).map(n => n.childId));
  const completedCount = presentChildren.filter(c => completedIndividualChildIds.has(c.id)).length;

  const todaySchedules = schedules.filter(s => s.date === todayString);

  useEffect(() => {
    if (!activitySummary && todaySchedules.length > 0) {
      // 중요 일정 키워드 필터링 (야외활동, 식사류, 주요 활동 등)
      const importantKeywords = ['활동', '놀이', '식사', '점심', '간식', '야외', '견학', '체욱', '미술'];
      const filteredSchedules = todaySchedules.filter(s =>
        importantKeywords.some(keyword => s.title.includes(keyword))
      );

      if (filteredSchedules.length > 0) {
        const scheduleText = filteredSchedules.map(s => s.title).join(', ');
        setActivitySummary(`오늘 저희 반은 ${scheduleText} 위주로 하루를 보냈습니다.`);
      } else {
        // 필터링된 일정이 없으면 예비 텍스트 표시
        setActivitySummary(`오늘 저희 반은 실내 자유참여 및 정규 일정을 무사히 마쳤습니다.`);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedules]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCommonPhoto(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSendCommon = () => {
    if (!commonTitle.trim() || !commonContent.trim()) return;
    
    const newNotice: Notice = {
      id: `n-${Date.now()}`,
      type: 'common',
      title: commonTitle,
      content: commonContent,
      date: new Date().toISOString().split('T')[0],
      isRead: false,
      isSent: true,
      photoUrl: commonPhoto || undefined
    };
    addNotice(newNotice);
    setCommonTitle('');
    setCommonContent('');
    setCommonPhoto(null);
    alert('전체 공통 알림장이 전송되었습니다.');
  };

  const handleGenerateDraft = async (childId: string) => {
    setIsGenerating(true);
    try {
      const draft = await generateAINotice(childId, memos[childId] || '', memoLength, activitySummary);
      setDrafts(prev => ({ ...prev, [childId]: draft }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDraftChange = (childId: string, newContent: string) => {
    if (drafts[childId]) {
      setDrafts(prev => ({
        ...prev,
        [childId]: { ...prev[childId], content: newContent }
      }));
    }
  };

  const handleSendIndividual = (childId: string) => {
    const draft = drafts[childId];
    if (!draft) return;
    
    addNotice({ ...draft, isSent: true });
    alert('개별 알림장이 해당 학부모님께 전송되었습니다.');
    setSelectedChildId(null);
    setDrafts(prev => {
      const newDrafts = { ...prev };
      delete newDrafts[childId];
      return newDrafts;
    });
    setMemos(prev => {
      const newMemos = { ...prev };
      delete newMemos[childId];
      return newMemos;
    });
  };

  return (
    <div className="p-6 pb-28 animate-fade-in">
      <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">선생님 알림장 ✍️</h2>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
        <button
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
            activeTab === 'common' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
          }`}
          onClick={() => setActiveTab('common')}
        >
          공통 알림장
        </button>
        <button
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
            activeTab === 'individual' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
          }`}
          onClick={() => setActiveTab('individual')}
        >
          개별 알림장
        </button>
      </div>

      {activeTab === 'common' && (
        <div className="animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 mb-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-500" /> 공통 알림장 작성
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">제목</label>
                <input
                  type="text"
                  placeholder="예: 4월 봄소풍 안내"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 focus:bg-white transition-all"
                  value={commonTitle}
                  onChange={e => setCommonTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">내용 (공지사항)</label>
                <textarea
                  placeholder="학부모님들께 전달할 공통 내용을 입력하세요..."
                  className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 focus:bg-white transition-all resize-none"
                  value={commonContent}
                  onChange={e => setCommonContent(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">사진 첨부</label>
                <label className="flex items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-all font-semibold relative overflow-hidden">
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                  {commonPhoto ? (
                    <>
                      <img src={commonPhoto} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                      <div className="relative z-10 bg-black/50 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1 backdrop-blur-sm">
                        <CheckCircle size={14} /> 첨부 완료 (클릭하여 변경)
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-400">
                      <ImageIcon size={24} />
                      <span className="text-xs">클릭하여 사진 선택</span>
                    </div>
                  )}
                </label>
              </div>

              <button
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ boxShadow: '0 4px 14px rgba(37,99,235,0.25)' }}
                disabled={!commonTitle.trim() || !commonContent.trim()}
                onClick={handleSendCommon}
              >
                <Send size={18} /> 전체 전송하기
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-600 mb-3 ml-2">발송 내역</h4>
            <div className="flex flex-col gap-3">
              {commonNotices.length > 0 ? (
                commonNotices.map((n) => (
                  <div key={n.id} className="p-4 bg-white border border-slate-200 rounded-2xl">
                    <p className="text-[10px] text-slate-400 mb-1">{n.date}</p>
                    <p className="font-bold text-sm text-slate-800 mb-2">{n.title}</p>
                    <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">{n.content}</p>
                    {n.photoUrl && (
                      <div className="mt-3 rounded-xl overflow-hidden h-32 border border-slate-100">
                        <img src={n.photoUrl} alt="Attached" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-xs text-slate-400 py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  발송 내역이 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'individual' && (
        <div className="animate-fade-in">
          {!selectedChildId ? (
            <div>
              {/* 알림장 작성 현황 대시보드 */}
              <div className="mb-6 bg-emerald-50 border border-emerald-100 rounded-3xl p-6 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <CheckCircle size={80} />
                </div>
                <span className="text-sm font-bold text-emerald-800 mb-1 z-10">오늘 알림장 작성 완료</span>
                <div className="flex items-baseline gap-2 z-10 mt-1">
                  <span className="text-4xl font-black text-emerald-600 tracking-tight">{completedCount}</span>
                  <span className="text-2xl font-bold text-slate-300">/</span>
                  <span className="text-2xl font-bold text-slate-400">{presentChildren.length}</span>
                </div>
                <span className="text-xs font-bold text-emerald-600/80 mt-1.5 z-10 ml-2">완료됨 명</span>
              </div>

              <div className="mb-4 flex items-center justify-between">
                 <h3 className="text-sm font-bold text-slate-700 ml-1">출석 아동 목록</h3>
                 <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">출석 {presentChildren.length}명</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {presentChildren.map((child) => {
                  const isCompleted = completedIndividualChildIds.has(child.id);
                  return (
                    <button
                      key={child.id}
                      className={`relative border rounded-2xl p-4 flex flex-col items-center gap-2 transition-all active:scale-95 ${
                        isCompleted ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                      }`}
                      onClick={() => setSelectedChildId(child.id)}
                    >
                      {isCompleted && (
                        <div className="absolute top-2.5 right-2.5 flex items-center justify-center w-5 h-5 bg-emerald-500 rounded-full text-white shadow-sm">
                          <CheckCircle size={12} strokeWidth={3} />
                        </div>
                      )}
                      
                      <span className={`text-3xl p-2.5 rounded-full leading-none transition-colors ${isCompleted ? 'bg-white shadow-sm' : 'bg-slate-50'}`}>
                        {child.profileEmoji}
                      </span>
                      
                      <span className={`font-bold text-sm ${isCompleted ? 'text-emerald-900' : 'text-slate-700'}`}>
                        {child.name}
                      </span>
                      
                      {drafts[child.id] && !isCompleted && (
                         <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2.5 py-0.5 rounded-full mt-0.5 shadow-sm">작성중</span>
                      )}
                      {isCompleted && (
                         <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full mt-0.5 shadow-sm">발송완료</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              {/* Selected Child Header */}
              <div className="flex items-center justify-between mb-6 bg-blue-50/50 p-3 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-3 pl-2">
                   <span className="text-2xl leading-none">{presentChildren.find(c => c.id === selectedChildId)?.profileEmoji}</span>
                   <span className="font-black text-blue-900">{presentChildren.find(c => c.id === selectedChildId)?.name} 알림장 작성</span>
                </div>
                <button
                  className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm"
                  onClick={() => setSelectedChildId(null)}
                >
                  <X size={16} />
                </button>
              </div>

              {/* 반 활동 요약 연동 */}
              <div className="mb-5">
                <label className="block text-[11px] font-bold text-slate-500 mb-2 ml-1">오늘 반 공통 활동 요약</label>
                <textarea
                  className="w-full bg-amber-50 text-amber-900 border border-amber-200/50 rounded-xl px-4 py-3 text-xs outline-none focus:border-amber-400 focus:bg-amber-100/50 transition-all resize-none h-16 leading-relaxed"
                  placeholder="예: 오늘은 미세먼지가 없어 공원에서 야외활동을 했습니다."
                  value={activitySummary}
                  onChange={e => setActivitySummary(e.target.value)}
                />
              </div>

              {/* Draft Generation Panel */}
              {!drafts[selectedChildId] || isGenerating ? (
                <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-5 mb-4 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500"></div>
                   
                   <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                     <Sparkles size={14} className="text-purple-500" /> 특이사항 간단 메모
                   </label>
                   <textarea
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-300 focus:bg-white transition-all resize-none min-h-[100px] mb-4 shadow-inner"
                     placeholder='날것의 문장을 편하게 적어주세요! 예: "점심시간 밥 조금 남김. 미술시간에 손에 물감 묻었다고 짜증냄. 손씻고 기분 풀림"'
                     value={memos[selectedChildId] || ''}
                     onChange={e => setMemos(prev => ({ ...prev, [selectedChildId]: e.target.value }))}
                     disabled={isGenerating}
                   />

                   <div className="flex items-center justify-between mb-4 mt-2">
                     <span className="text-[11px] font-bold text-slate-500">알림장 길이</span>
                     <div className="flex gap-2">
                       <button
                         className={`text-xs px-4 py-1.5 rounded-full font-bold transition-all ${memoLength === 'short' ? 'bg-slate-800 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                         onClick={() => setMemoLength('short')}
                         disabled={isGenerating}
                       >
                         단문 요약
                       </button>
                       <button
                         className={`text-xs px-4 py-1.5 rounded-full font-bold transition-all ${memoLength === 'long' ? 'bg-slate-800 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                         onClick={() => setMemoLength('long')}
                         disabled={isGenerating}
                       >
                         긴 글 풀이
                       </button>
                     </div>
                   </div>

                   <button
                     className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
                     onClick={() => handleGenerateDraft(selectedChildId)}
                     disabled={isGenerating}
                   >
                     {isGenerating ? (
                       <span className="animate-pulse">✨ AI가 초안 작성 중...</span>
                     ) : (
                       <>✨ AI 초안 만들기</>
                     )}
                   </button>
                </div>
              ) : (
                /* Generated Draft Panel */
                <div className="bg-white border-2 border-purple-200 shadow-sm rounded-3xl p-5 mb-4 animate-fade-in">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold text-purple-700 flex items-center gap-1.5">
                      <Sparkles size={14} /> AI 초안 결과 (직접 수정 가능)
                    </label>
                    <button
                      className="text-[10px] flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-bold transition-colors"
                      onClick={() => handleGenerateDraft(selectedChildId)}
                    >
                      <RefreshCcw size={10} /> 다시 생성
                    </button>
                  </div>
                  
                  <textarea
                    className="w-full bg-purple-50/30 border border-purple-100 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-purple-400 transition-all resize-none min-h-[160px] leading-relaxed mb-4 shadow-inner"
                    value={drafts[selectedChildId].content}
                    onChange={(e) => handleDraftChange(selectedChildId, e.target.value)}
                  />

                  <button
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    style={{ boxShadow: '0 4px 14px rgba(37,99,235,0.25)' }}
                    onClick={() => handleSendIndividual(selectedChildId)}
                  >
                    <Send size={18} /> 해당 학부모님께 발송
                  </button>
                </div>
              )}

              {/* Selected Child History */}
              <div className="mt-8 mb-4 animate-fade-in">
                <h4 className="text-sm font-bold text-slate-600 mb-3 ml-2 flex items-center gap-1.5">
                  <MessageSquare size={16} className="text-slate-400" /> 
                  이 아이의 최근 알림장 전송 내역
                </h4>
                <div className="flex flex-col gap-3">
                  {individualNotices.filter((n) => n.childId === selectedChildId).length > 0 ? (
                    individualNotices
                      .filter((n) => n.childId === selectedChildId)
                      .map((n) => (
                      <div key={n.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-bold text-[11px] text-blue-600">{n.date}</p>
                          {n.isRead ? (
                             <p className="text-[10px] text-slate-400 font-bold px-2 py-0.5 bg-slate-100 rounded-md">읽음</p>
                          ) : (
                             <p className="text-[10px] text-amber-500 font-bold px-2 py-0.5 bg-amber-50 rounded-md">안읽음</p>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-xl mt-2">{n.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-xs text-slate-400 py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      최근 알림장 내역이 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
