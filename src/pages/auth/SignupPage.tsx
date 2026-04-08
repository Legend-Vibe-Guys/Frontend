import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { PATH } from '../../router/Path';
import type { UserRole } from '../../types';
import { Loader2 } from 'lucide-react';

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
    setErrorMsg('');
    setIsLoading(true);
    try {
      await signup({ 
        name, 
        phone, 
        role, 
        ...(role === 'parent' ? { childName, childBirthDate, assignedTeacher } : {}) 
      });
      // 성공하면 role에 맞게 리다이렉트
      navigate(role === 'teacher' ? PATH.TEACHER.ROOT : PATH.PARENT.ROOT, { replace: true });
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || '회원가입 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  const inputClass = "w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-[16px] text-slate-700 outline-none transition-all placeholder:text-slate-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10" as const;

  return (
    <div className="w-full min-h-dvh p-5 bg-gradient-to-b from-blue-50 to-slate-100 py-10 overflow-y-auto flex">
      <div className="w-full max-w-[500px] bg-white rounded-[32px] shadow-2xl p-[40px] sm:p-[60px] flex flex-col relative m-auto animate-fade-in">
        <h2 className="text-[24px] font-black text-slate-900 text-center tracking-tight mb-2">반가워요! 🌱</h2>
        <p className="text-[15px] text-slate-400 text-center mb-8 break-keep">
          서비스 이용을 위한 추가 정보가 필요합니다.
        </p>

        {/* Role Select */}
        <div className="flex gap-2 mb-[30px] bg-slate-100 p-1.5 rounded-[18px]">
          <button type="button" className={`flex-1 py-3.5 rounded-2xl text-[15px] font-bold transition-all ${role === 'teacher' ? 'bg-white text-blue-600 shadow-[0_4px_12px_rgba(0,0,0,0.08)]' : 'text-slate-400 hover:text-slate-500 bg-transparent'}`} onClick={() => setRole('teacher')}>
            👩‍🏫 선생님
          </button>
          <button type="button" className={`flex-1 py-3.5 rounded-2xl text-[15px] font-bold transition-all ${role === 'parent' ? 'bg-white text-blue-600 shadow-[0_4px_12px_rgba(0,0,0,0.08)]' : 'text-slate-400 hover:text-slate-500 bg-transparent'}`} onClick={() => setRole('parent')}>
            👨‍👩‍👧 학부모
          </button>
        </div>

        {errorMsg && (
          <div className="w-full p-4 mb-6 bg-red-50 text-red-500 text-sm font-bold rounded-2xl text-center">
            {errorMsg}
          </div>
        )}

        <form className="flex flex-col gap-6 flex-1" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2.5">
            <label className="text-[14px] font-bold text-slate-600 ml-1">이름</label>
            <input className={inputClass} type="text" placeholder="성함을 입력하세요" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2.5">
            <label className="text-[14px] font-bold text-slate-600 ml-1">연락처</label>
            <input className={inputClass} type="tel" placeholder="010-0000-0000" maxLength={13} value={phone} onChange={handlePhoneChange} />
          </div>

          <div className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${role === 'parent' ? 'max-h-[500px] opacity-100 pointer-events-auto mt-2' : 'max-h-0 opacity-0 pointer-events-none mt-0'}`}>
            <div className="flex flex-col gap-6 pt-6 border-t border-slate-200 border-dashed">
              <div className="text-center mb-2">
                <h3 className="text-[18px] font-black text-slate-800">아이 정보 등록 👼</h3>
                <p className="text-[13px] text-slate-400 mt-1">아이와 선생님을 안전하게 연결합니다.</p>
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="text-[14px] font-bold text-slate-600 ml-1">아이 이름</label>
                <input className={inputClass} type="text" placeholder="아이의 이름을 입력하세요" value={childName} onChange={(e) => setChildName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="text-[14px] font-bold text-slate-600 ml-1">생년월일</label>
                <input className={inputClass} type="date" value={childBirthDate} onChange={(e) => setChildBirthDate(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="text-[14px] font-bold text-slate-600 ml-1">담당 선생님 성함</label>
                <input className={inputClass} type="text" placeholder="선생님 성함을 입력하세요" value={assignedTeacher} onChange={(e) => setAssignedTeacher(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <button type="submit" disabled={isLoading} className="w-full p-5 bg-gradient-to-br from-blue-600 to-purple-600 text-white font-black text-[17px] rounded-[20px] flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-[0_15px_30px_rgba(37,99,235,0.3)] active:translate-y-0 shadow-[0_12px_24px_rgba(37,99,235,0.2)] disabled:opacity-60 disabled:hover:translate-y-0">
              {isLoading ? <Loader2 size={24} className="animate-spin" /> : '회원가입 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
