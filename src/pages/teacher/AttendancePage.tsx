import { useAppData } from '../../hooks';
import { UserCheck, UserX, Clock } from 'lucide-react';

export default function AttendancePage() {
  const { children, attendance, markAttendance, stats } = useAppData();

  const getAttendanceForChild = (childId: string) =>
    attendance.find((a) => a.childId === childId);

  return (
    <div className="p-6 pb-28 animate-fade-in">
      <h2 className="text-2xl font-black text-slate-900 mb-6">등하원 현황</h2>

      {/* Summary */}
      <div className="flex gap-3 mb-6">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-500 text-xs font-bold">
          <UserCheck size={14} />
          <span>등원 {stats.presentCount}명</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-500 text-xs font-bold">
          <UserX size={14} />
          <span>미등원 {stats.absentCount}명</span>
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {children.map((child) => {
          const record = getAttendanceForChild(child.id);
          const isPresent = record?.status === 'present';
          const isAbsent = record?.status === 'absent';

          return (
            <div
              key={child.id}
              className={`flex items-center justify-between p-4 bg-white rounded-3xl transition-all stagger-item ${
                isAbsent ? 'border-2 border-red-100' : 'border border-slate-200'
              }`}
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[22px] ${isAbsent ? 'bg-red-50' : 'bg-blue-50'}`}>
                  {child.profileEmoji}
                </div>
                <div>
                  <p className="font-black text-sm text-slate-800">{child.name}</p>
                  {isPresent && record?.arrivalTime && (
                    <p className="text-[10px] text-blue-600 font-bold flex items-center gap-1 mt-[2px]">
                      <Clock size={10} /> {record.arrivalTime} 등원
                    </p>
                  )}
                  {isAbsent && (
                    <p className="text-[10px] text-red-400 font-bold italic mt-[2px]">
                      미등원 {record?.reason ? `(${record.reason})` : ''}
                    </p>
                  )}
                  {child.allergies.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {child.allergies.map((a) => (
                        <span key={a} className="text-[9px] px-[6px] py-[2px] bg-amber-50 text-amber-500 rounded-full font-bold">{a}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {isAbsent ? (
                <button
                  className="text-[10px] font-bold px-4 py-2 bg-blue-600 text-white rounded-xl active:scale-95 transition-all"
                  style={{ boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}
                  onClick={() => markAttendance(child.id, 'present')}
                >
                  등원처리
                </button>
              ) : (
                <button className="text-[10px] font-bold px-4 py-2 bg-slate-50 rounded-xl text-slate-600">
                  기록
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
