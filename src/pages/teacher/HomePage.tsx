import { useAuth, useAppData } from '../../hooks';
import { formatDateKorean } from '../../utils/date';
import {
  ChevronRight,
  TrendingUp,
  FileText,
  ClipboardCheck,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PATH } from '../../router/Path';

export default function HomePage() {
  const { user } = useAuth();
  const { stats, schedules } = useAppData();
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];
  const todaySchedules = schedules
    .filter((s) => s.date === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const nextSchedule = todaySchedules.find((s) => !s.isCompleted);

  return (
    <div className="p-6 pb-28 animate-fade-in">
      {/* Greeting */}
      <div className="mb-8">
        <p className="text-xs font-bold text-blue-600 mb-1">{formatDateKorean()}</p>
        <h2 className="text-2xl font-black text-slate-900 leading-snug">
          {user?.name} 선생님, 👋<br />오늘도 힘내세요!
        </h2>
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
      <div className="mb-8 stagger-item">
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
  );
}
