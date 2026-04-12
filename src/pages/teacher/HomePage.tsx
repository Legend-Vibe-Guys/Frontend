import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth, useAppData } from '../../hooks';
import { formatDateKorean, formatDateISO, formatTimeKorean } from '../../utils/date';
import {
  TrendingUp,
  FileText,
  ClipboardCheck,
  Clock,
  Pencil,
  CheckCircle2,
  X,
  School,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PATH } from '../../router/Path';

export default function HomePage() {
  const { user, updateProfile } = useAuth();
  const { stats, schedules } = useAppData();
  const navigate = useNavigate();

  const today = formatDateISO();
  const todaySchedules = schedules
    .filter((s) => s.date === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const nextSchedule = todaySchedules.find((s) => s.startTime > currentTime);

  // 반 이름 설정 모달
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classNameInput, setClassNameInput] = useState(user?.className || '');
  const [isSavingClass, setIsSavingClass] = useState(false);

  const handleOpenClassModal = () => {
    setClassNameInput(user?.className || '');
    setIsClassModalOpen(true);
  };

  const handleSaveClassName = async () => {
    if (!classNameInput.trim()) return;
    setIsSavingClass(true);
    try {
      await updateProfile({ className: classNameInput.trim() });
      setIsClassModalOpen(false);
    } catch {
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSavingClass(false);
    }
  };

  const hasClassName = !!(user?.className && user.className.trim());
  // 알림장 진행률
  const noticeRate = stats.noticeTotal > 0 ? (stats.noticeCompleted / stats.noticeTotal) * 100 : 0;
  // 관찰일지 진행률
  const obsRate = stats.observationTotal > 0 ? (stats.observationCompleted / stats.observationTotal) * 100 : 0;

  return (
    <>
      <div className="min-h-screen p-6 pb-32 animate-fade-in relative z-10">
        {/* ── 헤더 영역 ── */}
        <div className="flex justify-between items-start mb-8 pt-2">
          <div>
            <p className="text-[13px] font-bold text-blue-500 mb-1">{formatDateKorean()}</p>
            <h2 className="text-2xl font-black text-slate-900 leading-tight">
              안녕하세요, <br />
              {user?.name} 선생님! <span className="inline-block">👋</span>
            </h2>
          </div>
          {/* 반 이름 배지 */}
          <button
            onClick={handleOpenClassModal}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
              hasClassName
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30 hover:bg-blue-600'
                : 'bg-white text-slate-400 border border-slate-200 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50'
            }`}
          >
            {hasClassName ? (
              <>
                <School size={13} strokeWidth={2.5} />
                {user!.className}
                <Pencil size={11} strokeWidth={2.5} className="opacity-70" />
              </>
            ) : (
              <>
                <School size={13} strokeWidth={2} className="opacity-60" />
                반 이름 설정
              </>
            )}
          </button>
        </div>

        {/* ── Hero 카드: 원아 관리 ── */}
        <div
          onClick={() => navigate(PATH.TEACHER.STUDENTS)}
          className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-6 rounded-[2.5rem] mb-8 shadow-xl shadow-blue-300/40 relative overflow-hidden active:scale-[0.98] transition-all cursor-pointer"
        >
          {/* 장식 요소 */}
          <div className="absolute -right-6 -top-6 w-36 h-36 bg-white/15 rounded-full blur-2xl" />
          <div className="absolute -left-4 -bottom-6 w-44 h-44 bg-indigo-400/25 rounded-full blur-3xl" />

          <div className="relative z-10 mb-8 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[34px] font-jua font-normal tracking-wide text-white drop-shadow-sm leading-none pt-1">
                {hasClassName ? user!.className : '우리 반'}
              </h3>
              <div className="px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/40 rounded-xl">
                <p className="text-[13px] font-black text-white/90">
                  {stats.totalChildren}명 관리 중
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 relative z-10 mb-5">
            <div className="bg-white/15 backdrop-blur-sm p-3 rounded-2xl border border-white/20">
              <p className="text-[10px] text-white/70 font-bold mb-1">알레르기 등록</p>
              <p className="text-lg font-black text-white">{stats.allergyCount}명</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm p-3 rounded-2xl border border-white/20">
              <p className="text-[10px] text-white/70 font-bold mb-1">투약의뢰</p>
              <p className="text-lg font-black text-white">{stats.medicationRequests}건</p>
            </div>
          </div>

          <div className="w-full py-3.5 bg-white/95 text-blue-600 rounded-2xl text-[14px] font-black shadow-lg flex items-center justify-center gap-2 relative z-10">
            원아 관리하기 <TrendingUp size={16} />
          </div>
        </div>

        {/* ── 오늘의 진행 현황 카드 ── */}
        <div className="flex flex-col gap-4 mb-10">
          {/* 알림장 */}
          <div
            onClick={() => navigate(PATH.TEACHER.NOTICE)}
            className="p-6 bg-white/70 backdrop-blur-lg rounded-[2.2rem] shadow-sm border border-white/60 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                <FileText size={22} />
              </div>
              <div>
                <p className="text-[12px] text-slate-500 font-bold mb-0.5">알림장 발송 현황</p>
                <p className="text-[20px] font-black text-slate-800">
                  {stats.noticeCompleted}
                  <span className="text-[14px] ml-1 opacity-40 font-bold">/ {stats.noticeTotal}명</span>
                </p>
                {/* 진행바 */}
                <div className="h-1.5 bg-slate-100 rounded-full mt-2 w-36 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-300 transition-all duration-700"
                    style={{ width: `${noticeRate}%` }}
                  />
                </div>
              </div>
            </div>
            <ChevronRight size={22} className="text-slate-300" strokeWidth={3} />
          </div>

          {/* 관찰일지 */}
          <div
            onClick={() => navigate(PATH.TEACHER.OBSERVATION)}
            className="p-6 bg-white/70 backdrop-blur-lg rounded-[2.2rem] shadow-sm border border-white/60 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
                <ClipboardCheck size={22} />
              </div>
              <div>
                <p className="text-[12px] text-slate-500 font-bold mb-0.5">관찰일지 작성 현황</p>
                <p className="text-[20px] font-black text-slate-800">
                  {stats.observationCompleted}
                  <span className="text-[14px] ml-1 opacity-40 font-bold">/ {stats.observationTotal}건</span>
                </p>
                {/* 진행바 */}
                <div className="h-1.5 bg-slate-100 rounded-full mt-2 w-36 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-300 transition-all duration-700"
                    style={{ width: `${obsRate}%` }}
                  />
                </div>
              </div>
            </div>
            <ChevronRight size={22} className="text-slate-300" strokeWidth={3} />
          </div>
        </div>

        {/* ── 오늘의 일정 섹션 ── */}
        <div className="space-y-6">
          <section>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[17px] font-black text-slate-800 flex items-center gap-2">
                <span className="p-1.5 bg-blue-100 text-blue-500 rounded-lg">
                  <Clock size={16} />
                </span>
                오늘의 일정
              </h3>
              <button
                onClick={() => navigate(PATH.TEACHER.SCHEDULE)}
                className="text-[12px] font-bold text-blue-500 flex items-center gap-1 hover:text-blue-700 transition-colors"
              >
                전체보기 <ChevronRight size={14} strokeWidth={3} />
              </button>
            </div>

            <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2.2rem] shadow-sm border border-white/60">
              {todaySchedules.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  <p className="text-2xl mb-3 opacity-40">📅</p>
                  <p className="text-xs font-bold italic opacity-60">오늘은 정기 일정이 없어요</p>
                </div>
              ) : (
                <div className="space-y-5 relative ml-1 pt-1">
                  {/* 타임라인 세로선 */}
                  <div className="absolute left-[5px] top-6 bottom-4 w-[2px] bg-slate-100" />
                  {todaySchedules.map((s) => {
                    const isNext = nextSchedule?.id === s.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => navigate(PATH.TEACHER.SCHEDULE)}
                        className={`relative pl-8 transition-all duration-500 cursor-pointer active:scale-[0.98] ${isNext ? 'scale-[1.02]' : ''} ${s.isCompleted ? 'opacity-40' : ''}`}
                      >
                        {/* 타임라인 마커 */}
                        <div
                          className={`absolute left-0 top-1.5 w-[14px] h-[14px] rounded-full border-2 bg-white z-10 ${
                            isNext
                              ? 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)] animate-pulse'
                              : s.isCompleted
                              ? 'border-slate-200'
                              : 'border-blue-300'
                          }`}
                        />
                        <div
                          className={`p-4 rounded-2xl transition-all ${
                            isNext ? 'bg-blue-50 border border-blue-100/70 shadow-sm' : 'hover:bg-slate-50/60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className={`text-[11px] font-black ${isNext ? 'text-blue-500' : 'text-slate-400'}`}>
                              {formatTimeKorean(s.startTime)}
                            </p>
                            {isNext && (
                              <span className="bg-blue-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter shadow-sm">
                                다음 일정
                              </span>
                            )}
                          </div>
                          <p className={`text-[15px] font-black ${isNext ? 'text-slate-900' : s.isCompleted ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                            {s.title}
                          </p>
                          {s.description && (
                            <p className={`text-[12px] mt-1 font-medium ${s.isCompleted ? 'text-slate-300' : 'text-slate-500'}`}>
                              {s.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

        </div>
      </div>

      {/* ── 반 이름 설정 모달 ── */}
      {isClassModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[1000] flex justify-center items-end"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsClassModalOpen(false);
            }}
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-md cursor-pointer"
              onClick={() => setIsClassModalOpen(false)}
            />
            <div className="absolute bottom-0 w-full max-w-[430px] bg-white rounded-t-[2.5rem] p-6 pb-[calc(6rem+env(safe-area-inset-bottom,24px))] shadow-2xl animate-slide-up">
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-6" />
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <School size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">반 이름 설정</h3>
                    <p className="text-xs text-slate-400 font-medium">학부모 앱에도 반영됩니다</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsClassModalOpen(false)}
                  className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="mb-6">
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2 block">반 이름</label>
                <input
                  type="text"
                  value={classNameInput}
                  onChange={(e) => setClassNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveClassName();
                  }}
                  placeholder="예: 햇살반, 무지개반, 하늘반"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-200 focus:bg-white rounded-2xl px-4 py-4 text-base font-bold text-slate-800 outline-none transition-all placeholder:text-slate-300"
                  autoFocus
                />
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {['햇살반', '무지개반', '하늘반', '별님반', '꽃잎반', '새싹반'].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setClassNameInput(preset)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      classNameInput === preset
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <button
                onClick={handleSaveClassName}
                disabled={!classNameInput.trim() || isSavingClass}
                className="w-full py-4 bg-blue-600 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:active:scale-100"
              >
                {isSavingClass ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 size={18} strokeWidth={2.5} />
                    저장하기
                  </>
                )}
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
