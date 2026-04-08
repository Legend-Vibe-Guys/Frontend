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
    <div className="w-full min-h-dvh p-5 bg-gradient-to-b from-blue-50 to-slate-100 py-10 overflow-y-auto flex">
      <div className="w-full max-w-[500px] bg-white rounded-[32px] shadow-2xl p-[50px] sm:p-[60px] flex flex-col relative m-auto animate-fade-in">
        {/* Logo Start */}
        <div className="w-[72px] h-[72px] bg-gradient-to-br from-blue-600 to-purple-600 rounded-[20px] mx-auto mb-6 flex items-center justify-center text-4xl shadow-lg shadow-blue-600/20">
          🌱
        </div>
        <h1 className="text-[32px] font-black text-slate-900 text-center tracking-tight mb-2">아이케어 AI</h1>
        <p className="text-[15px] text-slate-400 text-center mb-10">
          AI 기반 스마트 어린이집 관리 서비스
        </p>

        {errorMsg && (
          <div className="w-full p-4 mb-6 bg-red-50 text-red-500 text-sm font-bold rounded-2xl text-center">
            {errorMsg}
          </div>
        )}

        {/* Login Action Area */}
        <button 
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full p-4 bg-white border-2 border-slate-200 text-slate-700 font-bold text-[16px] rounded-[18px] flex items-center justify-center gap-3 transition-all hover:bg-slate-50 hover:border-blue-600 disabled:opacity-60 disabled:hover:border-slate-200"
        >
          {isLoading ? (
            <Loader2 size={24} className="animate-spin text-blue-600" />
          ) : (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              구글 계정으로 로그인
            </>
          )}
        </button>
      </div>
    </div>
  );
}
