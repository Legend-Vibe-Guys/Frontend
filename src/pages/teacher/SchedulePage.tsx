import { useState } from 'react';
import { useAppData } from '../../hooks';
import { getDaysInMonth, getFirstDayOfMonth } from '../../utils/date';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

export default function SchedulePage() {
  const { schedules, toggleScheduleComplete } = useAppData();
  const [currentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(3);
  const [selectedDay, setSelectedDay] = useState(7);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const blanks = Array.from({ length: firstDay }, (_, i) => (
    <span key={`blank-${i}`} className="p-2" />
  ));

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const isSelected = day === selectedDay;
    const isToday = day === 7;
    return (
      <span
        key={day}
        className={`text-xs p-2 rounded-xl cursor-pointer transition-all text-center
          ${isSelected ? 'bg-blue-600 text-white font-bold' : ''}
          ${isToday && !isSelected ? 'bg-blue-50 text-blue-600 font-bold' : ''}
          ${!isSelected && !isToday ? 'text-slate-600 hover:bg-slate-200' : ''}
        `}
        onClick={() => setSelectedDay(day)}
      >
        {day}
      </span>
    );
  });

  return (
    <div className="p-6 pb-28 animate-fade-in">
      <h2 className="text-2xl font-black text-slate-900 mb-6">일정 관리</h2>

      {/* Calendar */}
      <div className="bg-slate-50 p-4 rounded-3xl mb-6">
        <div className="flex justify-between items-center px-2 mb-4">
          <p className="font-bold text-sm text-slate-800">{currentYear}년 {currentMonth + 1}월</p>
          <div className="flex gap-3">
            <button onClick={() => setCurrentMonth((m) => Math.max(0, m - 1))} className="text-slate-400 p-1 rounded-lg hover:bg-slate-200">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setCurrentMonth((m) => Math.min(11, m + 1))} className="text-slate-400 p-1 rounded-lg hover:bg-slate-200">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-[2px] text-center">
          {dayLabels.map((d, i) => (
            <span key={i} className="text-[10px] font-bold text-slate-300 p-1">{d}</span>
          ))}
          {blanks}
          {days}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative ml-4 pl-6" style={{ borderLeft: '2px dashed #e2e8f0' }}>
        {schedules.map((s) => (
          <div key={s.id} className={`relative pb-6 last:pb-0 flex items-start gap-3 ${s.isCompleted ? 'opacity-50' : ''}`}>
            <span
              className="absolute top-1 w-3 h-3 rounded-full"
              style={{
                left: '-29px',
                background: s.isCompleted ? s.color : '#e2e8f0',
                border: '2px solid white',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              }}
            />
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase mb-[2px]" style={{ color: s.isCompleted ? s.color : '#94a3b8' }}>
                {s.startTime} - {s.endTime}
              </p>
              <p className={`font-bold text-sm ${s.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                {s.title}
              </p>
              {s.description && <p className="text-xs text-slate-400 mt-[2px]">{s.description}</p>}
            </div>
            <button
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-[2px] transition-all
                ${s.isCompleted ? 'bg-emerald-500 text-white' : 'text-transparent hover:border-blue-600'}
              `}
              style={{ border: s.isCompleted ? '2px solid #10b981' : '2px solid #e2e8f0' }}
              onClick={() => toggleScheduleComplete(s.id)}
            >
              <Check size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
