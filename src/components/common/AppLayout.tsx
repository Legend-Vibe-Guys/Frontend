import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../../hooks';
import Header from './Header';
import BottomNav from './BottomNav';
import { PATH } from '../../router/Path';

export default function AppLayout() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 각 경로에 맞지 않는 역할(교사/학부모)일 경우 리다이렉트
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    const path = location.pathname;
    
    // 교사 권한인데 학부모 경로(/parent)로 들어온 경우에만 리다이렉트
    if (user.role === 'teacher') {
      if (path.startsWith(PATH.PARENT.ROOT) && !path.startsWith(PATH.TEACHER.ROOT)) {
        console.log('[AppLayout] Redirecting Teacher to Teacher Root');
        navigate(PATH.TEACHER.ROOT, { replace: true });
      }
    } 
    // 학부모 권한인데 교사 경로(/teacher)로 들어온 경우에만 리다이렉트
    else if (user.role === 'parent') {
      if (path.startsWith(PATH.TEACHER.ROOT) && !path.startsWith(PATH.PARENT.ROOT)) {
        console.log('[AppLayout] Redirecting Parent to Parent Root');
        navigate(PATH.PARENT.ROOT, { replace: true });
      }
    }
  }, [isAuthenticated, user, location.pathname, navigate]);

  // 로그인 상태가 아니면 로그인 페이지로
  if (!isAuthenticated) {
    return <Navigate to={PATH.LOGIN} replace />;
  }

  return (
    <div className={`w-full max-w-[430px] h-dvh mx-auto flex flex-col relative shadow-2xl overflow-hidden font-['Noto_Sans_KR'] ${
      user?.role === 'parent' ? 'bg-[#FBFBF6]' : user?.role === 'teacher' ? 'bg-[#F6F8FB]' : 'bg-white'
    } print:h-auto print:max-w-none print:overflow-visible print:bg-white print:shadow-none`}>
      {/* Cotton Candy Blurred Background Layers - Parents */}
      {user?.role === 'parent' && (
        <div className="print:hidden">
          <div className="absolute top-[-5%] left-[-20%] w-[300px] h-[300px] bg-blue-100 rounded-full blur-[80px] mix-blend-multiply opacity-60 pointer-events-none" />
          <div className="absolute top-[35%] right-[-25%] w-[320px] h-[320px] bg-purple-100 rounded-full blur-[90px] mix-blend-multiply opacity-50 pointer-events-none" />
          <div className="absolute bottom-[5%] left-[-15%] w-[350px] h-[350px] bg-amber-100 rounded-full blur-[100px] mix-blend-multiply opacity-60 pointer-events-none" />
        </div>
      )}

      {/* Blue Glow Background Layers - Teachers */}
      {user?.role === 'teacher' && (
        <div className="print:hidden">
          <div className="absolute top-[-5%] left-[-20%] w-[300px] h-[300px] bg-blue-200 rounded-full blur-[90px] mix-blend-multiply opacity-40 pointer-events-none" />
          <div className="absolute top-[35%] right-[-25%] w-[320px] h-[320px] bg-indigo-200 rounded-full blur-[100px] mix-blend-multiply opacity-35 pointer-events-none" />
          <div className="absolute bottom-[5%] left-[-15%] w-[350px] h-[350px] bg-sky-100 rounded-full blur-[100px] mix-blend-multiply opacity-50 pointer-events-none" />
          <div className="absolute top-[65%] right-[-10%] w-[280px] h-[280px] bg-blue-100 rounded-full blur-[80px] mix-blend-multiply opacity-40 pointer-events-none" />
        </div>
      )}

      <div className="print:hidden"><Header /></div>
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 scroll-smooth [&::-webkit-scrollbar]:hidden relative z-10 print:overflow-visible print:h-auto print:pb-0">
        <Outlet />
      </main>
      <div className="print:hidden"><BottomNav /></div>
    </div>
  );
}
