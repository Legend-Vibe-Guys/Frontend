import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '../components/common/AppLayout';
import { PATH } from './Path';

// 교사용 페이지
import HomePage from '../pages/teacher/HomePage';
import SchedulePage from '../pages/teacher/SchedulePage';
import StudentListPage from '../pages/teacher/StudentListPage';
import StudentDetailPage from '../pages/teacher/StudentDetailPage';
import NoticePage from '../pages/teacher/NoticePage';
import NoticeEditPage from '../pages/teacher/NoticeEditPage';
import ObservationPage from '../pages/teacher/ObservationPage';

// 학부모용 페이지
import ParentHomePage from '../pages/parent/ParentHomePage';
import ParentNoticePage from '../pages/parent/ParentNoticePage';
import ChildEditPage from '../pages/parent/ChildEditPage';

// 공통 페이지 (로그인)
import LoginPage from '../pages/auth/LoginPage';

import SignupPage from '../pages/auth/SignupPage';
import AuthLayout from '../components/common/AuthLayout';

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: PATH.LOGIN,
        element: <LoginPage />,
      },
      {
        path: PATH.SIGNUP,
        element: <SignupPage />,
      },
    ],
  },

  // 1. 교사 경로 그룹
  {
    path: PATH.TEACHER.ROOT,
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'schedule', element: <SchedulePage /> },
      { path: 'students', element: <StudentListPage /> },
      { path: 'students/:id', element: <StudentDetailPage /> },
      { path: 'notice', element: <NoticePage /> },
      { path: 'notice/edit', element: <NoticeEditPage /> },
      { path: 'notice/edit/:id', element: <NoticeEditPage /> },
      { path: 'observation', element: <ObservationPage /> },
    ],
  },

  // 2. 학부모 경로 그룹
  {
    path: PATH.PARENT.ROOT,
    element: <AppLayout />,
    children: [
      { index: true, element: <ParentHomePage /> },
      { path: 'notices', element: <ParentNoticePage /> },
      { path: 'child/edit', element: <ChildEditPage /> },
    ],
  },

  {
    path: '*',
    element: <Navigate to={PATH.LOGIN} replace />,
  },
]);

export default router;
