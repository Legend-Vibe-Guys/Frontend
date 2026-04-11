import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth, useAppData } from '../../hooks';
import { formatDateKorean, formatDateISO } from '../../utils/date';
import {
  ChevronRight,
  TrendingUp,
  FileText,
  ClipboardCheck,
  Clock,
  Pencil,
  CheckCircle2,
  X,
  School,
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

  const nextSchedule = todaySchedules.find((s) => !s.isCompleted);

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

  return (
    <>
      <div className="p-6 pb-28 animate-fade-in text-[#2D2D2D]">
        {/* Greeting */}
        <div className="mb-8">
          <p className="text-xs font-bold text-blue-600 mb-1">{formatDateKorean()}</p>
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-2xl font-black text-slate-900 leading-snug">
              {user?.name} 선생님, 👋<br />오늘도 힘내세요!
            </h2>

            {/* 반 이름 뱃지/설정 버튼 */}
            <button
              onClick={handleOpenClassModal}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
                hasClassName
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 hover:bg-blue-700'
                  : 'bg-slate-100 text-slate-400 border border-dashed border-slate-300 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50'
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
        </div>

        {/* Student Management Hero */}
        <div
          className="bg-gradient-to-br from-slate-900 to-[#1a1a2e] p-6 rounded-[2rem] text-white mb-6 cursor-pointer active:scale-[0.98] transition-transform"
          style={{ boxShadow: '0 12px 32px rgba(15,23,42,0.25)' }}
          onClick={() => navigate(PATH.TEACHER.STUDENTS)}
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-bold opacity-50 uppercase tracking-[2px]">Students</p>
              <h3 className="text-3xl font-black">
                {stats.totalChildren}{' '}
                <span className="text-xs font-normal opacity-60">명 관리중</span>
              </h3>
            </div>
            <div className="bg-blue-600 px-3 py-1 rounded-full text-[10px] font-bold animate-pulse-soft">
              실시간
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/[0.08] p-3 rounded-2xl border border-white/[0.08]">
              <p className="text-[10px] opacity-60">알레르기 등록</p>
              <p className="text-lg font-bold">{stats.allergyCount}명</p>
            </div>
            <div className="bg-white/[0.08] p-3 rounded-2xl border border-white/[0.08]">
              <p className="text-[10px] opacity-60">투약의뢰</p>
              <p className="text-lg font-bold">{stats.medicationRequests}건</p>
            </div>
          </div>
        </div>

        {/* Progress Cards */}
        <div className="mb-6">
          <h3 className="text-sm font-extrabold text-slate-800 mb-4">오늘의 진행 상황</h3>
          <div className="grid grid-cols-2 gap-3">
            <div
              className="p-4 bg-white border border-slate-200 rounded-2xl cursor-pointer active:scale-[0.97] transition-all stagger-item"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
              onClick={() => navigate(PATH.TEACHER.NOTICE)}
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <FileText size={18} />
              </div>
              <p className="text-[10px] text-slate-400 font-semibold">알림장</p>
              <p className="text-lg font-black text-slate-800">
                {stats.noticeCompleted}<span className="text-xs font-medium text-slate-300">/{stats.noticeTotal}</span>
              </p>
              <div className="h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-300 transition-all duration-700"
                  style={{ width: `${(stats.noticeCompleted / stats.noticeTotal) * 100}%` }}
                />
              </div>
            </div>

            <div
              className="p-4 bg-white border border-slate-200 rounded-2xl cursor-pointer active:scale-[0.97] transition-all stagger-item"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
              onClick={() => navigate(PATH.TEACHER.OBSERVATION)}
            >
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center mb-3">
                <ClipboardCheck size={18} />
              </div>
              <p className="text-[10px] text-slate-400 font-semibold">관찰일지</p>
              <p className="text-lg font-black text-slate-800">
                {stats.observationCompleted}<span className="text-xs font-medium text-slate-300">/{stats.observationTotal}</span>
              </p>
              <div className="h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-300 transition-all duration-700"
                  style={{ width: `${(stats.observationCompleted / stats.observationTotal) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Next Schedule */}
        {nextSchedule && (
          <div
            className="p-5 bg-blue-50 rounded-3xl border border-blue-100 flex items-center justify-between cursor-pointer mb-6 active:scale-[0.98] transition-all stagger-item"
            onClick={() => navigate(PATH.TEACHER.SCHEDULE)}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800">다음 일정</p>
                <p className="text-xs text-blue-600">{nextSchedule.startTime} {nextSchedule.title}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-blue-300" />
          </div>
        )}

        {/* Timeline */}
        <div className="stagger-item">
          <h3 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={16} /> 오늘의 일정
          </h3>
          <div className="relative ml-4 pl-6" style={{ borderLeft: '2px dashed #e2e8f0' }}>
            {todaySchedules.length === 0 ? (
              <div className="text-center py-6 opacity-30">
                <p className="text-xs font-bold">오늘 예정된 일정이 없습니다.</p>
              </div>
            ) : (
              todaySchedules.map((s) => (
                <div key={s.id} className={`relative pb-5 last:pb-0 ${s.isCompleted ? 'opacity-40' : ''}`}>
                  <div
                    className="absolute top-1 w-[10px] h-[10px] rounded-full"
                    style={{ 
                      left: '-29px', 
                      border: '2px solid white', 
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      background: s.isCompleted ? '#cbd5e1' : '#2563eb' 
                    }}
                  />
                  <p className={`text-[10px] font-bold uppercase mb-[2px] ${s.isCompleted ? 'text-slate-400' : 'text-blue-600'}`}>
                    {s.startTime}
                  </p>
                  <p className={`text-sm font-bold ${s.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {s.title}
                  </p>
                  {s.description && (
                    <p className={`text-xs ${s.isCompleted ? 'text-slate-300' : 'text-slate-400'}`}>
                      {s.description}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── 반 이름 설정 모달 (Portal로 이동하여 레이어 간섭 완벽 차단) ── */}
      {isClassModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[1000] flex justify-center items-end"
          onClick={(e) => { if (e.target === e.currentTarget) setIsClassModalOpen(false); }}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-md cursor-pointer" 
            onClick={() => setIsClassModalOpen(false)}
          />

          {/* Sheet */}
          <div 
            className="absolute bottom-0 w-full max-w-[430px] bg-white rounded-t-[2.5rem] p-6 pb-[calc(6rem+env(safe-area-inset-bottom,24px))] shadow-2xl animate-slide-up"
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-6" />

            {/* Header */}
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

            {/* Input */}
            <div className="mb-6">
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2 block">
                반 이름
              </label>
              <input
                type="text"
                value={classNameInput}
                onChange={(e) => setClassNameInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveClassName(); }}
                placeholder="예: 햇살반, 무지개반, 하늘반"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-200 focus:bg-white rounded-2xl px-4 py-4 text-base font-bold text-slate-800 outline-none transition-all placeholder:text-slate-300"
                autoFocus
              />
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-2 mb-6">
              {['햇살반', '무지개반', '하늘반', '별님반', '꽃잎반', '새싹반'].map(preset => (
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

            {/* Save Button */}
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
        document.body
      )}
    </>
  );
}
