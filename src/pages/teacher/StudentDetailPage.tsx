import { useState, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppData, useAuth } from '../../hooks';
import { memosAPI, studentsAPI, API_BASE } from '../../api/api';
import { ChevronLeft, AlertTriangle, Pill, BookOpen, Save, CheckCircle, Plus, X } from 'lucide-react';
import { formatDateISO } from '../../utils/date';

const getFullImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

function formatDateKorean(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const day = days[date.getDay()];
  return `${m}월 ${d}일 (${day})`;
}

// 초기 Mock 데이터 제거 (주석 처리됨)

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { children } = useAppData();
  const child = children.find(c => c.id === id);

  // 날짜 및 메모 동기화
  const today = formatDateISO();
  const [selectedDate, setSelectedDate] = useState(today);
  const [memosByDate, setMemosByDate] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { isAuthenticated } = useAuth(); // or simply import from AuthContext. Wait, I imported it.

  // 현재 날짜의 메모 (입력 중인 값)
  const [currentMemo, setCurrentMemo] = useState('');

  // fetch 초기 메모 DB 연동
  useEffect(() => {
    if (child?.id) {
       memosAPI.getByChild(child.id).then(res => {
          if (res.success && res.memos) {
             setMemosByDate(res.memos);
             setCurrentMemo(res.memos[today] || ''); // initialize today
          }
       }).catch(console.error);
    }
  }, [child?.id, isAuthenticated, today]);

  // 특징(Traits) 편집 모드
  const [traits, setTraits] = useState<string[]>([]);
  const [isEditingTrait, setIsEditingTrait] = useState(false);
  const [newTrait, setNewTrait] = useState('');

  // 아이 데이터가 로드되면 특징 상태 동기화
  useEffect(() => {
    if (child?.traits) {
      setTraits(child.traits);
    }
  }, [child?.traits]);

  if (!child) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <p className="text-lg font-bold mb-3">원아를 찾을 수 없습니다.</p>
        <button onClick={() => navigate(-1)} className="text-blue-500 font-bold text-sm">← 돌아가기</button>
      </div>
    );
  }

  const allergies = child?.allergies || [];
  const medicationRequest = child?.medicationRequest;
  const hasMedication = !!medicationRequest;

  // -- 날짜 처리 --
  const handleDateChange = (date: string) => {
    // 1. 임시 로컬 저장 (선택 사항이나 보통 API 없이 이탈 방지용)
    setMemosByDate(prev => ({ ...prev, [selectedDate]: currentMemo }));
    
    // 2. 뷰 전환
    setSelectedDate(date);
    setCurrentMemo(memosByDate[date] || '');
  };

  const handleSaveMemo = async () => {
    if (!child) return;
    setIsSaving(true);
    try {
        await memosAPI.save(child.id, selectedDate, currentMemo.trim());
        setMemosByDate(prev => ({ ...prev, [selectedDate]: currentMemo.trim() }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2200);
    } catch (e) {
        console.error("Failed to save memo", e);
        alert('메모 저장에 실패했습니다.');
    } finally {
        setIsSaving(false);
    }
  };

  // -- 특징 편집 처리 --
  const saveTraitsToDb = async (newTraits: string[]) => {
      if (!child) return;
      try {
         await studentsAPI.updateTraits(child.id, newTraits);
      } catch(e) {
         console.error("Failed to update traits", e);
      }
  };

  const addTrait = () => {
    if (newTrait.trim()) {
      const updatedTraits = [...traits, newTrait.trim()];
      setTraits(updatedTraits);
      setNewTrait('');
      setIsEditingTrait(false);
      saveTraitsToDb(updatedTraits);
    }
  };

  const handleTraitKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') addTrait();
    if (e.key === 'Escape') setIsEditingTrait(false);
  };

  const removeTrait = (traitToRemove: string) => {
    const updatedTraits = traits.filter(t => t !== traitToRemove);
    setTraits(updatedTraits);
    saveTraitsToDb(updatedTraits);
  };

  return (
    <div className="bg-slate-50 min-h-full pb-28 animate-fade-in">
      {/* 헤더 */}
      <div className="bg-white px-4 py-3.5 flex items-center gap-3 border-b border-slate-100 sticky top-0 z-20">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full transition-colors shrink-0"
        >
          <ChevronLeft size={18} className="text-slate-700" />
        </button>
        <h1 className="font-black text-slate-900 flex-1 text-center text-base mr-9">{child.name} 상세 기록</h1>
      </div>

      <div className="p-5 space-y-4">
        {/* 1. 프로필 & 특징 */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-3xl text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-8 -mb-8" />
          
          <div className="relative">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-[60px] h-[60px] bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl border border-white/20 shadow-inner shrink-0 overflow-hidden">
                {child.profileImageUrl ? (
                  <img src={getFullImageUrl(child.profileImageUrl)} alt={child.name} className="w-full h-full object-cover" />
                ) : (
                  child.profileEmoji
                )}
              </div>
              <div>
                <h2 className="text-xl font-black">{child.name}</h2>
                <p className="text-blue-200 text-xs mt-0.5">{child.birthDate} 출생</p>
              </div>
            </div>

            {/* 학생 특징 리스트 */}
            <div className="flex flex-wrap gap-2 mt-3">
              {traits.map(t => (
                <span key={t} className="flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold pl-3 pr-1.5 py-1.5 rounded-full backdrop-blur-sm border border-white/15 hover:bg-white/30 transition-colors cursor-default">
                  {t}
                  <button
                    onClick={() => removeTrait(t)}
                    className="w-4 h-4 rounded-full hover:bg-white/40 flex items-center justify-center transition-colors shrink-0"
                  >
                    <X size={11} strokeWidth={2.5} />
                  </button>
                </span>
              ))}

              {isEditingTrait ? (
                <div className="flex items-center gap-1.5 bg-white/25 rounded-full pl-3 pr-1.5 py-1.5 backdrop-blur-sm border border-white/30">
                  <input
                    type="text"
                    value={newTrait}
                    onChange={(e) => setNewTrait(e.target.value)}
                    onKeyDown={handleTraitKeyDown}
                    placeholder="특징 입력 후 Enter"
                    className="bg-transparent text-xs font-semibold text-white placeholder:text-white/55 outline-none w-28"
                    autoFocus
                    onBlur={() => {
                      if (!newTrait.trim()) setIsEditingTrait(false);
                    }}
                  />
                  <button onClick={addTrait} className="bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                    <Plus size={11} strokeWidth={3} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingTrait(true)}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/15 border-dashed transition-colors"
                >
                  <Plus size={11} /> 추가
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. 건강 특이사항 */}
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          {/* 섹션 헤더 */}
          <div className="px-5 py-3.5 border-b border-slate-50 flex items-center gap-2">
            <div className="w-6 h-6 bg-rose-50 rounded-lg flex items-center justify-center">
              <AlertTriangle size={13} className="text-rose-500" />
            </div>
            <h3 className="text-sm font-black text-slate-800">건강 특이사항</h3>
            <span className="ml-auto text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">학부모 제공</span>
          </div>

          <div className="p-4 space-y-3">
            {/* 보유 알레르기 */}
            <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-3.5">
              <div className="flex items-center gap-1.5 mb-2.5">
                <AlertTriangle size={12} className="text-rose-500" />
                <span className="text-[11px] font-extrabold text-rose-700 uppercase tracking-wide">알레르기</span>
              </div>
              {allergies.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {allergies.map(a => (
                    <span key={a} className="bg-white text-rose-600 border border-rose-200 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                      {a}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-bold text-slate-400">등록된 알레르기 없음</p>
              )}
            </div>

            {/* 투약 의뢰 */}
            <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-3.5">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Pill size={12} className="text-amber-600" />
                <span className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wide">투약 의뢰</span>
              </div>
              {hasMedication ? (
                <p className="text-xs font-semibold text-slate-700 leading-relaxed bg-white/70 px-3 py-2.5 rounded-xl border border-amber-100">
                  {medicationRequest}
                </p>
              ) : (
                <p className="text-xs font-bold text-slate-400">등록된 투약 의뢰 없음</p>
              )}
            </div>
          </div>
        </div>

        {/* 3. 날짜별 선생님 메모 */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-50 rounded-xl flex items-center justify-center">
                <BookOpen size={14} className="text-blue-600" />
              </div>
              <h3 className="text-sm font-black text-slate-800">날짜별 메모</h3>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={e => handleDateChange(e.target.value)}
              className="text-[11px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 cursor-pointer border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          <textarea
            value={currentMemo}
            onChange={e => setCurrentMemo(e.target.value)}
            placeholder={`${formatDateKorean(selectedDate)}의 ${child.name} 어린이 활동 특이사항을 메모해주세요.`}
            className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-300 outline-none focus:border-blue-400 focus:bg-white transition-all resize-none shadow-inner"
          />

          <button
            onClick={handleSaveMemo}
            disabled={(!currentMemo.trim() && !memosByDate[selectedDate]) || !!saved || isSaving}
            className={`mt-4 w-full py-3.5 font-extrabold rounded-2xl flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 ${
              saved
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-400/40'
                : 'bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700'
            }`}
          >
            {isSaving ? (
              <>저장 중...</>
            ) : saved ? (
              <><CheckCircle size={16} /> 저장 완료!</>
            ) : (
              <><Save size={16} /> 이 메모 저장하기</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
