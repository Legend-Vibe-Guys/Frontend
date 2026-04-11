import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { PATH } from '../../router/Path';
import type { UserRole } from '../../types';
import { Loader2, ChevronDown } from 'lucide-react';
import { authAPI } from '../../api/api';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [role, setRole] = useState<UserRole>('teacher');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [childName, setChildName] = useState('');
  const [childBirthDate, setChildBirthDate] = useState('');
  const [assignedTeacher, setAssignedTeacher] = useState('');
  const [className, setClassName] = useState('');
  const [teachers, setTeachers] = useState<{uid: string, name: string, className: string}[]>([]);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await authAPI.getTeachers();
        if (res.success) {
          setTeachers(res.teachers);
        }
      } catch (err) {
        console.error('Failed to fetch teachers', err);
      }
    };
    fetchTeachers();
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNumber = e.target.value.replace(/[^0-9]/g, '');
    let result = '';
    if (onlyNumber.length < 4) {
      result = onlyNumber;
    } else if (onlyNumber.length < 8) {
      result = `${onlyNumber.slice(0, 3)}-${onlyNumber.slice(3)}`;
    } else {
      result = `${onlyNumber.slice(0, 3)}-${onlyNumber.slice(3, 7)}-${onlyNumber.slice(7, 11)}`;
    }
    setPhone(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      setErrorMsg('이름과 전화번호를 입력해주세요.');
      return;
    }
    if (role === 'teacher' && !className) {
      setErrorMsg('반 이름을 입력해주세요.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    // 선택된 선생님의 이름 찾기
    const selectedTeacher = teachers.find(t => t.uid === assignedTeacher);

    try {
      await signup({ 
        name, 
        phone, 
        role, 
        className: role === 'teacher' ? className : '',
        ...(role === 'parent' ? { 
          childName,
          childBirthDate,
          assignedTeacher: selectedTeacher?.name || '',
          teacherUid: assignedTeacher // UID 전달
        } : {}) 
      });
      // 성공하면 role에 맞게 리다이렉트
      navigate(role === 'teacher' ? PATH.TEACHER.ROOT : PATH.PARENT.ROOT, { replace: true });
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || '회원가입 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  const inputClass = "w-full p-4 bg-white border border-slate-200 rounded-[1.25rem] text-[16px] text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#5E5CE6] focus:ring-4 focus:ring-[#5E5CE6]/5 font-medium shadow-sm appearance-none" as const;

  return (
    <div className="flex-1 flex flex-col pt-4 pb-10 relative z-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">반가워요! 🌱</h2>
        <p className="text-[15px] text-slate-600 font-bold break-keep">
          서비스 이용을 위한 추가 정보가 필요합니다.
        </p>
      </div>

      {/* Role Select */}
      <div className="flex gap-2 mb-10 bg-slate-50/50 p-1.5 rounded-[1.5rem] border border-slate-200/50 shadow-sm">
        <button 
          type="button" 
          className={`flex-1 py-3.5 rounded-[1.25rem] text-[15px] font-bold transition-all duration-300 ${role === 'teacher' ? 'bg-white text-[#5E5CE6] shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-600 bg-transparent'}`} 
          onClick={() => setRole('teacher')}
        >
          👩‍🏫 선생님
        </button>
        <button 
          type="button" 
          className={`flex-1 py-3.5 rounded-[1.25rem] text-[15px] font-bold transition-all duration-300 ${role === 'parent' ? 'bg-white text-[#5E5CE6] shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-600 bg-transparent'}`} 
          onClick={() => setRole('parent')}
        >
          👨‍👩‍👧 학부모
        </button>
      </div>

      {errorMsg && (
        <div className="w-full p-4 mb-6 bg-red-50 text-red-500 text-sm font-bold rounded-[1.25rem] text-center border border-red-100">
          {errorMsg}
        </div>
      )}

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-bold text-slate-700 ml-1">이름</label>
          <input className={inputClass} type="text" placeholder="성함을 입력하세요" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-bold text-slate-700 ml-1">연락처</label>
          <input className={inputClass} type="tel" placeholder="010-0000-0000" maxLength={13} value={phone} onChange={handlePhoneChange} />
        </div>

        {role === 'teacher' && (
          <div className="flex flex-col gap-2 animate-fade-in">
            <label className="text-[14px] font-bold text-slate-700 ml-1">담당 반 이름</label>
            <input className={inputClass} type="text" placeholder="예: 햇님반, 기린반" value={className} onChange={(e) => setClassName(e.target.value)} />
          </div>
        )}

        <div className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${role === 'parent' ? 'max-h-[600px] opacity-100 pointer-events-auto mt-2' : 'max-h-0 opacity-0 pointer-events-none mt-0'}`}>
          <div className="flex flex-col gap-6 pt-8 border-t border-slate-200 border-dashed">
            <div className="text-center mb-2">
              <h3 className="text-[18px] font-black text-slate-900 underline underline-offset-4 decoration-blue-500/30">아이 정보 등록 👼</h3>
              <p className="text-[13px] text-slate-500 font-medium mt-1">아이와 선생님을 안전하게 연결합니다.</p>
            </div>
            
            <div className="flex flex-col gap-5 bg-slate-50/30 p-5 rounded-[2rem] border border-slate-100">
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-bold text-slate-700 ml-1">아이 이름</label>
                <input className={inputClass} type="text" placeholder="아이의 이름을 입력하세요" value={childName} onChange={(e) => setChildName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-bold text-slate-700 ml-1">생년월일</label>
                <input className={inputClass} type="date" value={childBirthDate} onChange={(e) => setChildBirthDate(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2 relative">
                <label className="text-[14px] font-bold text-slate-700 ml-1">담당 선생님 선택</label>
                <div className="relative">
                  <select 
                    className={inputClass} 
                    value={assignedTeacher} 
                    onChange={(e) => setAssignedTeacher(e.target.value)}
                  >
                    <option value="">선생님을 선택하세요</option>
                    {teachers.map(t => (
                      <option key={t.uid} value={t.uid}>
                        {t.name} 선생님 {t.className ? `(${t.className})` : ''}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown size={20} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full h-16 bg-gradient-to-b from-[#3B82F6] to-[#8B5CF6] text-white font-black text-[18px] rounded-[1.25rem] flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(139,92,246,0.2)] transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {isLoading ? <Loader2 size={24} className="animate-spin" /> : '회원가입 완료'}
          </button>
        </div>
      </form>
    </div>
  );
}
