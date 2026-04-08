export const PATH = {
  ROOT: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',

  // 교사 전용 경로
  TEACHER: {
    ROOT: '/teacher',
    SCHEDULE: '/teacher/schedule',
    STUDENTS: '/teacher/students',
    STUDENT_DETAIL: '/teacher/students/:id',
    NOTICE: '/teacher/notice',
    NOTICE_EDIT: '/teacher/notice/edit/:id',
    OBSERVATION: '/teacher/observation',
  },

  // 학부모 전용 경로
  PARENT: {
    ROOT: '/parent',
    NOTICES: '/parent/notices',
    EDIT_CHILD: '/parent/child/edit',
  },
} as const;
