export const PATH = {
  ROOT: '/',
  LOGIN: '/login',

  // 교사 전용 경로
  TEACHER: {
    ROOT: '/teacher',
    SCHEDULE: '/teacher/schedule',
    ATTENDANCE: '/teacher/attendance',
    NOTICE: '/teacher/notice',
    OBSERVATION: '/teacher/observation',
  },

  // 학부모 전용 경로
  PARENT: {
    ROOT: '/parent',
    NOTICES: '/parent/notices',
  },
} as const;
