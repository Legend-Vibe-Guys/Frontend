import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { PATH } from '../../router/Path';
import type { UserRole } from '../../types';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login, signup, isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // 로그인 성공 시 역할별 대시보드로 이동
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'teacher' ? PATH.TEACHER.ROOT : PATH.PARENT.ROOT, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState<UserRole>('teacher');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [childName, setChildName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignup) {
      await signup({ name, email, phone, role, childName: role === 'parent' ? childName : undefined });
    } else {
      await login(email, password, role);
    }
  };

  const inputClass = "w-full p-3 px-4 bg-white rounded-xl text-sm text-slate-700 outline-none transition-all placeholder:text-slate-300 focus:ring-2 focus:ring-blue-100" as const;

  return (
    <div className="w-full max-w-[430px] h-dvh mx-auto bg-gradient-to-b from-blue-50 via-slate-50 to-white flex flex-col items-center justify-center p-6" style={{ boxShadow: '0 0 60px rgba(0,0,0,0.08)' }}>
      <div className="w-full animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-[32px]" style={{ boxShadow: '0 12px 32px rgba(37,99,235,0.2)' }}>
            🌱
          </div>
          <h1 className="text-2xl font-black text-slate-900">아이케어 AI</h1>
          <p className="text-xs text-slate-400 mt-1">AI 기반 스마트 어린이집 관리 서비스</p>
        </div>

        {/* Role Toggle */}
        <div className="flex gap-2 mb-6 bg-slate-50 p-1 rounded-2xl">
          <button className={`flex-1 py-3 rounded-xl text-xs font-semibold transition-all ${role === 'teacher' ? 'bg-white text-blue-600 font-bold shadow-md' : 'text-slate-400'}`} onClick={() => setRole('teacher')}>
            👩‍🏫 교사
          </button>
          <button className={`flex-1 py-3 rounded-xl text-xs font-semibold transition-all ${role === 'parent' ? 'bg-white text-blue-600 font-bold shadow-md' : 'text-slate-400'}`} onClick={() => setRole('parent')}>
            👨‍👩‍👧 학부모
          </button>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-4 mb-5" onSubmit={handleSubmit}>
          {isSignup && (
            <>
              <div className="flex flex-col gap-2 animate-fade-in">
                <label className="text-xs font-bold text-slate-600">이름</label>
                <input className={inputClass} style={{ border: '2px solid #e2e8f0' }} type="text" placeholder="이름을 입력하세요" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2 animate-fade-in">
                <label className="text-xs font-bold text-slate-600">전화번호</label>
                <input className={inputClass} style={{ border: '2px solid #e2e8f0' }} type="tel" placeholder="010-0000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              {role === 'parent' && (
                <div className="flex flex-col gap-2 animate-fade-in">
                  <label className="text-xs font-bold text-slate-600">아이 이름</label>
                  <input className={inputClass} style={{ border: '2px solid #e2e8f0' }} type="text" placeholder="아이 이름을 입력하세요" value={childName} onChange={(e) => setChildName(e.target.value)} />
                </div>
              )}
            </>
          )}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-600">이메일</label>
            <input className={inputClass} style={{ border: '2px solid #e2e8f0' }} type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-600">비밀번호</label>
            <div className="relative">
              <input className={`${inputClass} pr-11`} style={{ border: '2px solid #e2e8f0' }} type={showPassword ? 'text' : 'password'} placeholder="비밀번호를 입력하세요" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className="mt-2 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60" style={{ boxShadow: '0 6px 20px rgba(37,99,235,0.2)' }} disabled={isLoading}>
            {isLoading ? <Loader2 size={18} className="animate-spin-slow" /> : isSignup ? '회원가입' : '로그인'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          {isSignup ? '이미 계정이 있으신가요?' : '아직 계정이 없으신가요?'}
          <button className="text-blue-600 font-bold ml-1" onClick={() => setIsSignup(!isSignup)}>{isSignup ? '로그인' : '회원가입'}</button>
        </p>
        <div className="text-center mt-6 py-3 bg-amber-50 rounded-xl">
          <p className="text-[10px] text-amber-500 font-semibold">💡 데모: 아무 값이나 입력 후 로그인하세요</p>
        </div>
      </div>
    </div>
  );
}
