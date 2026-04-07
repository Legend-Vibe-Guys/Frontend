import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../../hooks';
import Header from './Header';
import BottomNav from './BottomNav';
import { PATH } from '../../router/Path';

export default function AppLayout() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // 각 경로에 맞지 않는 역할(교사/학부모)일 경우 리다이렉트
  // 훅(useEffect)은 항상 조건부 반환문보다 위에 있어야 합니다.
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const path = window.location.pathname;
    if (user?.role === 'teacher' && path.startsWith(PATH.PARENT.ROOT)) {
      navigate(PATH.TEACHER.ROOT, { replace: true });
    } else if (user?.role === 'parent' && path.startsWith(PATH.TEACHER.ROOT)) {
      navigate(PATH.PARENT.ROOT, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // 로그인 상태가 아니면 로그인 페이지로
  if (!isAuthenticated) {
    return <Navigate to={PATH.LOGIN} replace />;
  }

  return (
    <div className="w-full max-w-[430px] h-dvh mx-auto bg-white flex flex-col relative shadow-2xl overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 scroll-smooth [&::-webkit-scrollbar]:hidden">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
