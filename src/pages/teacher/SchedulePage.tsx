import { useState, useMemo } from 'react';
import { useAppData } from '../../hooks';
import { formatDateISO } from '../../utils/date';
import { ChevronLeft, ChevronRight, Check, Plus, Edit2, Trash2, X, Clock, Type, AlignLeft } from 'lucide-react';
import type { ScheduleItem } from '../../types';

export default function SchedulePage() {
  const { schedules, toggleScheduleComplete, addSchedule, updateSchedule, deleteSchedule } = useAppData();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ScheduleItem>>({
    title: '',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    color: '#3b82f6',
    isCompleted: false
  });

  const selectedDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  
  const dailySchedules = schedules
    .filter(s => s.date === selectedDateStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const calendarData = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const startDay = firstDayOfMonth.getDay();
    
    const days = [];
    
    // Padding for previous month
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({ 
        day: prevMonthLastDay - i, 
        month: currentMonth - 1, 
        year: currentYear, 
        isCurrentMonth: false 
      });
    }
    
    // Current month days
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push({ day: i, month: currentMonth, year: currentYear, isCurrentMonth: true });
    }
    
    // Padding for next month
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({ 
        day: i, 
        month: currentMonth + 1, 
        year: currentYear, 
        isCurrentMonth: false 
      });
    }
    
    return days;
  }, [currentYear, currentMonth]);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      color: '#3b82f6',
      isCompleted: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (s: ScheduleItem) => {
    setEditingId(s.id);
    setFormData(s);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title?.trim()) return;

    try {
      if (editingId) {
        await updateSchedule(editingId, formData);
      } else {
        await addSchedule({ ...formData, date: selectedDateStr } as ScheduleItem);
      }
      setIsModalOpen(false);
    } catch {
      alert('일정 저장에 실패했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('이 일정을 삭제할까요?')) return;
    try {
      await deleteSchedule(id);
    } catch {
      alert('일정 삭제에 실패했습니다.');
    }
  };

  const changeMonth = (delta: number) => {
    const nextDate = new Date(currentYear, currentMonth + delta, 1);
    setCurrentYear(nextDate.getFullYear());
    setCurrentMonth(nextDate.getMonth());
    setSelectedDay(1);
  };

  return (
    <>
      <div className="p-6 pb-28 animate-fade-in max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-slate-900">우리 반 일정</h2>
          <button 
            onClick={handleOpenAddModal}
            className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Calendar Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-6 mb-10 border border-white/60 shadow-xl shadow-slate-200/30">
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-6 px-2">
            <h3 className="text-[18px] font-black text-slate-800">
              {currentYear}년 {currentMonth + 1}월
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
              const isSelected = selectedDateStr === dateISO;
              const isToday = formatDateISO(today) === dateISO;
              const hasSchedule = Array.isArray(schedules) && schedules.some(s => s.date === dateISO);

              return (
                <button
                  key={i}
                  onClick={() => {
                    const date = new Date(d.year, d.month, d.day);
                    setCurrentYear(date.getFullYear());
                    setCurrentMonth(date.getMonth());
                    setSelectedDay(date.getDate());
                  }}
                  className={`relative h-11 w-11 mx-auto flex flex-col items-center justify-center rounded-2xl transition-all duration-300 cursor-pointer
                    ${isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-110 z-10' : 'hover:bg-slate-50'}
                    ${!d.isCurrentMonth ? 'opacity-20' : ''}
                  `}
                >
                  <span className={`text-[15px] font-black ${isSelected ? 'text-white' : isToday ? 'text-blue-500' : 'text-slate-700'}`}>
                    {d.day}
                  </span>
                  {hasSchedule && !isSelected && (
                    <span className="absolute bottom-1.5 w-1 h-1 bg-blue-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Timeline Section Header */}
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-blue-600 rounded-full" />
            <h3 className="font-black text-[17px] text-slate-800">{currentMonth + 1}월 {selectedDay}일</h3>
          </div>
          <span className="text-[12px] font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
            {dailySchedules.length}개의 일정
          </span>
        </div>

        {/* Timeline */}
        <div className="relative ml-4 pl-8 border-l-2 border-dashed border-slate-200 space-y-10">
          {dailySchedules.length === 0 ? (
            <div className="text-center py-10 opacity-30">
              <p className="text-sm font-bold">일정이 없습니다.</p>
            </div>
          ) : (
            dailySchedules.map((s) => (
              <div key={s.id} className={`group relative ${s.isCompleted ? 'opacity-40' : ''}`}>
                <span
                  className="absolute top-6 -left-[43px] w-5 h-5 rounded-full border-4 border-white shadow-sm transition-all z-10"
                  style={{ background: s.isCompleted ? s.color : '#cbd5e1' }}
                />
                <div className="bg-white/70 backdrop-blur-lg rounded-[2.2rem] p-6 border border-white/60 shadow-sm flex items-center justify-between gap-4 transition-all hover:shadow-md">
                  <div className="flex-1">
                    <div className="flex flex-col mb-1.5">
                      <p className="text-[12px] font-black uppercase tracking-wider mb-1" style={{ color: s.color || '#3b82f6' }}>
                        {s.startTime} - {s.endTime}
                      </p>
                      <h4 className={`text-[18px] font-black leading-tight ${s.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {s.title}
                      </h4>
                    </div>
                    {s.description && (
                      <p className="text-[13px] text-slate-500 font-medium leading-relaxed opacity-80">{s.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenEditModal(s)} className="p-2 text-slate-400 hover:text-blue-500 cursor-pointer bg-slate-50 rounded-xl transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-2 text-slate-400 hover:text-red-500 cursor-pointer bg-slate-50 rounded-xl transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => toggleScheduleComplete(s.id)}
                      className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 cursor-pointer shadow-sm
                        ${s.isCompleted 
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-200/50 scale-100' 
                          : 'bg-slate-100 border border-slate-300 text-transparent hover:border-emerald-400 hover:bg-slate-200 hover:text-emerald-400/40 scale-100 active:scale-90 shadow-inner'}
                      `}
                    >
                      <Check size={16} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in transition-all">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-900">{editingId ? '일정 수정' : '새 일정 추가'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-600 transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  <Type size={12} /> 제목
                </label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:bg-slate-100 transition-all"
                  placeholder="예: 야외 놀이 활동"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    <Clock size={12} /> 시작 시간
                  </label>
                  <input 
                    type="time" 
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:bg-slate-100 transition-all"
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    <Clock size={12} /> 종료 시간
                  </label>
                  <input 
                    type="time" 
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:bg-slate-100 transition-all"
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  <AlignLeft size={12} /> 상세 설명 (선택)
                </label>
                <textarea 
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:bg-slate-100 transition-all min-h-[100px] resize-none"
                  placeholder="추가 전달 사항..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-400 font-black rounded-2xl transition-all active:scale-95 cursor-pointer"
                >취소</button>
                <button 
                  onClick={handleSubmit}
                  className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-900/20 transition-all active:scale-95 cursor-pointer"
                >{editingId ? '수정 완료' : '일정 추가'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
