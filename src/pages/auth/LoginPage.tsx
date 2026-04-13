import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { PATH } from '../../router/Path';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { loginWithGoogle, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 로그인 성공 시 역할별 대시보드로 이동
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'teacher' ? PATH.TEACHER.ROOT : PATH.PARENT.ROOT, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result.needsSignup) {
        navigate(PATH.SIGNUP);
      }
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error?.code === 'auth/popup-closed-by-user' || error?.message?.includes('auth/popup-closed-by-user')) {
        setErrorMsg('로그인이 취소되었어요!');
      } else {
        setErrorMsg(error?.message || '로그인 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col pt-20 h-full overflow-hidden">
      {/* Centered App Icon - Moved slightly down */}
      <div className="flex flex-col items-center mb-10 -mt-6">
        <div className="w-28 h-28 bg-gradient-to-br from-[#4D61FF] via-[#7B5CFF] to-[#BD00FF] rounded-[2rem] flex items-center justify-center shadow-[0_20px_40px_rgba(123,92,255,0.35)] mb-6 transition-transform hover:scale-105 duration-300">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-lg">
            <path d="M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3"/>
            <path d="M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4"/>
            <path d="M5 21h14"/>
          </svg>
        </div>
        <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-3">
          아이노트
        </h1>
        <p className="text-[15px] font-bold text-slate-500 text-center leading-relaxed whitespace-pre-wrap">
          {"선생님의 퇴근을 지켜주는\n스마트 행정 자동화 솔루션"}
        </p>
      </div>

      <div className="mt-auto pb-10 flex flex-col gap-6">
        {errorMsg && (
          <div className="w-full p-4 bg-red-50 text-red-500 text-sm font-bold rounded-2xl text-center">
            {errorMsg}
          </div>
        )}

        {/* Google Login Button */}
        <button 
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full h-16 bg-white rounded-2xl flex items-center justify-center gap-3 shadow-sm border border-slate-100 transition-all hover:border-[#7B5CFF] hover:shadow-md active:scale-[0.98] disabled:opacity-60"
        >
          {isLoading ? (
            <Loader2 size={24} className="animate-spin text-[#7B5CFF]" />
          ) : (
            <>
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-[17px] font-bold text-slate-700">구글 계정으로 로그인</span>
            </>
          )}
        </button>

        <p className="text-[11.5px] text-slate-400 text-center whitespace-nowrap px-2">
          {"로그인 시 아이노트의 "}
          <span className="underline cursor-pointer">이용약관</span>
          {" 및 "}
          <span className="underline cursor-pointer">개인정보처리방침</span>
          {"에 동의하게 됩니다."}
        </p>
      </div>
    </div>
  );
}
