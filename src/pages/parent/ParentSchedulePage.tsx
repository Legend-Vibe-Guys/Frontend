import { useState, useMemo } from 'react';
import { useAppData } from '../../hooks';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
} from 'lucide-react';
import { formatDateISO, formatTimeKorean } from '../../utils/date';

export default function ParentSchedulePage() {
  const { schedules } = useAppData();
  
  // State for selected date (ISO format: YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(formatDateISO());
  
  // State for calendar month navigation
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Helper: Month Data
  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of original month
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Day of week of first day (0: Sun)
    const startDay = firstDayOfMonth.getDay();
    
    const days = [];
    
    // Padding for previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({ 
        day: prevMonthLastDay - i, 
        month: month - 1, 
        year, 
        isCurrentMonth: false 
      });
    }
    
    // Current month days
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push({ day: i, month: month, year, isCurrentMonth: true });
    }
    
    // Padding for next month
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({ 
        day: i, 
        month: month + 1, 
        year, 
        isCurrentMonth: false 
      });
    }
    
    return days;
  }, [currentMonth]);

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  // Filter and Sort Schedules
  const filteredSchedules = useMemo(() => {
    const safeSchedules = Array.isArray(schedules) ? schedules : [];
    return safeSchedules
      .filter(s => s.date === selectedDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [schedules, selectedDate]);

  // Current Time Logic for Highlighting
  const now = new Date();
  const todayISO = formatDateISO();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const nextUpId = useMemo(() => {
    if (selectedDate !== todayISO) return null;
    return filteredSchedules.find(s => s.startTime > currentTime)?.id;
  }, [filteredSchedules, selectedDate, todayISO, currentTime]);

  return (
    <div className="min-h-screen p-6 pb-32 animate-fade-in relative z-10">
      {/* Header */}
      <div className="mb-8 pt-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 flex items-center justify-center text-2xl">
            📅
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">일정 안내</h2>
            <p className="text-[14px] text-slate-500 font-medium tracking-tight">아이의 일상을 시간별로 확인하세요</p>
          </div>
        </div>
      </div>

      {/* Monthly Calendar Card */}
      <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-6 mb-8 border border-white/60 shadow-xl shadow-slate-200/30">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-6 px-2">
          <h3 className="text-[18px] font-black text-slate-800">
            {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={() => changeMonth(-1)}
              className="w-10 h-10 flex items-center justify-center bg-slate-50/50 rounded-xl text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft size={20} strokeWidth={3} />
            </button>
            <button 
              onClick={() => changeMonth(1)}
              className="w-10 h-10 flex items-center justify-center bg-slate-50/50 rounded-xl text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <ChevronRight size={20} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-y-4 text-center">
          {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
            <span key={i} className={`text-[11px] font-black uppercase tracking-wider mb-2 ${i === 0 ? 'text-rose-300' : i === 6 ? 'text-sky-300' : 'text-slate-400'}`}>
              {d}
            </span>
          ))}
          
          {calendarData.map((d, i) => {
            const dateISO = formatDateISO(new Date(d.year, d.month, d.day));
            const isSelected = selectedDate === dateISO;
            const isToday = todayISO === dateISO;
            const hasSchedule = Array.isArray(schedules) && schedules.some(s => s.date === dateISO);

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(dateISO)}
                className={`relative h-11 w-11 mx-auto flex flex-col items-center justify-center rounded-2xl transition-all duration-300 cursor-pointer
                  ${isSelected ? 'bg-amber-400 text-white shadow-lg shadow-amber-100 scale-110 z-10' : 'hover:bg-slate-50'}
                  ${!d.isCurrentMonth ? 'opacity-20' : ''}
                `}
              >
                <span className={`text-[15px] font-black ${isSelected ? 'text-white' : isToday ? 'text-amber-500' : 'text-slate-700'}`}>
                  {d.day}
                </span>
                {hasSchedule && !isSelected && (
                  <span className="absolute bottom-1.5 w-1 h-1 bg-amber-300 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Timeline */}
      <div className="space-y-6">
        <div className="flex items-center justify-between ml-2">
          <h4 className="text-[17px] font-black text-slate-800 flex items-center gap-2">
            오늘의 타임라인
          </h4>
          <span className="text-[12px] font-bold text-amber-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-100/50">
            {filteredSchedules.length}개의 일정
          </span>
        </div>

        {filteredSchedules.length === 0 ? (
          <div className="bg-white/50 backdrop-blur-md rounded-[2.2rem] p-10 border border-white/60 text-center shadow-inner">
          <div className="flex justify-center mb-4">
            <Sparkles size={48} className="text-amber-400 opacity-40 animate-pulse" />
          </div>
          <p className="text-[14px] text-slate-400 font-bold leading-relaxed italic opacity-80">
            이날은 특별한<br/>일정이 없어요.
          </p>
          </div>
        ) : (
          <div className="space-y-4 relative">
             {/* Simple Timeline Divider Line */}
            <div className="absolute left-[34px] top-6 bottom-6 w-[2px] bg-slate-100 hidden"></div>
            
            {filteredSchedules.map((item) => {
              const isNext = nextUpId === item.id;
              
              return (
                <div 
                  key={item.id} 
                  className={`bg-white/70 backdrop-blur-lg rounded-[2.2rem] p-6 border transition-all duration-500 flex gap-6 items-center
                    ${isNext ? 'border-amber-200 shadow-xl shadow-amber-100/30 scale-[1.02] ring-2 ring-amber-100/30' : 'border-white/60 shadow-sm'}
                  `}
                >
                  <div className="flex flex-col items-center justify-center min-w-[70px] text-center border-r border-slate-100 pr-6 mr-2">
                    <span className={`text-[13px] font-black mb-1 ${isNext ? 'text-amber-500' : 'text-slate-800'}`}>
                      {formatTimeKorean(item.startTime).split(' ')[0]}
                    </span>
                    <span className={`text-[16px] font-black ${isNext ? 'text-slate-900 font-black' : 'text-slate-700'}`}>
                      {formatTimeKorean(item.startTime).split(' ')[1]}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Clock size={12} className={isNext ? 'text-amber-400' : 'text-slate-300'} />
                      <span className={`text-[12px] font-bold ${isNext ? 'text-amber-600' : 'text-slate-400'}`}>
                        {item.startTime} ~ {item.endTime || '--:--'}
                      </span>
                      {isNext && (
                        <span className="bg-amber-400 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-sm">다음 일정</span>
                      )}
                    </div>
                    <h4 className={`text-[18px] font-black leading-tight ${isNext ? 'text-slate-900 font-black' : 'text-slate-800 font-bold'}`}>
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-[13px] text-slate-500 font-medium mt-1.5 line-clamp-2 opacity-80">{item.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
