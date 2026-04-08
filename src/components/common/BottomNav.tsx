import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  Calendar,
  UserCheck,
  MessageCircle,
  Camera,
  Home,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../hooks';
import { PATH } from '../../router/Path';

const TEACHER_TABS = [
  { path: PATH.TEACHER.ROOT, icon: LayoutGrid, label: '홈', end: true },
  { path: PATH.TEACHER.SCHEDULE, icon: Calendar, label: '일정' },
  { path: PATH.TEACHER.STUDENTS, icon: UserCheck, label: '원아 관리' },
  { path: PATH.TEACHER.NOTICE, icon: MessageCircle, label: '알림장' },
  { path: PATH.TEACHER.OBSERVATION, icon: Camera, label: '관찰일지' },
];

const PARENT_TABS = [
  { path: PATH.PARENT.ROOT, icon: Home, label: '홈', end: true },
  { path: PATH.PARENT.NOTICES, icon: FileText, label: '알림장' },
];

export default function BottomNav() {
  const { user } = useAuth();
  const tabs = user?.role === 'parent' ? PARENT_TABS : TEACHER_TABS;

  return (
    <nav className="h-20 bg-white/[0.95] backdrop-blur-2xl border-t border-slate-100 flex items-center justify-around absolute bottom-0 left-0 right-0 px-2 z-50">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          end={tab.end}
          className={({ isActive }) =>
            `flex flex-col items-center flex-1 py-2 transition-all relative no-underline ${
              isActive ? 'text-blue-600' : 'text-slate-300'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[3px] bg-blue-600 rounded-b-full" />
              )}
              <tab.icon size={20} strokeWidth={isActive ? 2.2 : 1.8} className={`transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-[9px] mt-[3px] ${isActive ? 'font-extrabold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
