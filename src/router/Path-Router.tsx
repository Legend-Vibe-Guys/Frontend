import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '../components/common/AppLayout';
import { PATH } from './Path';

// 교사용 페이지
import HomePage from '../pages/teacher/HomePage';
import SchedulePage from '../pages/teacher/SchedulePage';
import AttendancePage from '../pages/teacher/AttendancePage';
import NoticePage from '../pages/teacher/NoticePage';
import ObservationPage from '../pages/teacher/ObservationPage';

// 학부모용 페이지
import ParentHomePage from '../pages/parent/ParentHomePage';
import ParentNoticePage from '../pages/parent/ParentNoticePage';

// 공통 페이지 (로그인)
import LoginPage from '../pages/auth/LoginPage';

import SignupPage from '../pages/auth/SignupPage';

const router = createBrowserRouter([
  {
    path: PATH.LOGIN,
    element: <LoginPage />,
  },
  {
    path: PATH.SIGNUP,
    element: <SignupPage />,
  },

  // 1. 교사 경로 그룹
  {
    path: PATH.TEACHER.ROOT,
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'schedule', element: <SchedulePage /> },
      { path: 'attendance', element: <AttendancePage /> },
      { path: 'notice', element: <NoticePage /> },
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
    ],
  },

  {
    path: '*',
    element: <Navigate to={PATH.LOGIN} replace />,
  },
]);

export default router;
