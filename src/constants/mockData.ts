import type {
  Child,
  AttendanceRecord,
  ScheduleItem,
  Notice,
  ObservationLog,
  DashboardStats,
  ActivityTimeline,
  MealPlan,
} from '../types';

// ── 아이 목록 ──
export const MOCK_CHILDREN: Child[] = [
];

// ── 출석 기록 ──
export const MOCK_ATTENDANCE: AttendanceRecord[] = MOCK_CHILDREN.map(
  (child, i) => ({
    id: `att-${child.id}`,
    childId: child.id,
    date: '2026-04-07',
    status:
      i < 18 ? ('present' as const) : ('absent' as const),
    arrivalTime: i < 18 ? `09:${String(5 + i * 3).padStart(2, '0')}` : undefined,
    reason: i === 18 ? '체험학습' : i === 19 ? '병결' : undefined,
  }),
);

// ── 일정 ──
export const MOCK_SCHEDULES: ScheduleItem[] = [
];

// ── 알림장 ──
export const MOCK_NOTICES: Notice[] = [
];

// ── 관찰일지 ──
export const MOCK_OBSERVATIONS: ObservationLog[] = [
];

// ── 대시보드 통계 ──
export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalChildren: 20,
  presentCount: 18,
  absentCount: 2,
  noticeCompleted: 8,
  noticeTotal: 20,
  observationCompleted: 5,
  observationTotal: 20,
  medicationRequests: 1,
  allergyCount: 0, // :point_left:
};

// ── 활동 타임라인 ──
export const MOCK_ACTIVITY_TIMELINE: ActivityTimeline[] = [
];

// ── 식단 ──
export const MOCK_MEAL_PLANS: MealPlan[] = [
  {
    id: 'meal1',
    date: '2026-04-07',
    mealType: 'snack_am',
    menu: ['우유', '식빵', '딸기잼'],
    allergyWarnings: [
      {
        childId: 'c1',
        childName: '김민준',
        allergen: '우유',
        menuItem: '우유',
      },
      {
        childId: 'c7',
        childName: '한도윤',
        allergen: '밀가루',
        menuItem: '식빵',
      },
    ],
  },
  {
    id: 'meal2',
    date: '2026-04-07',
    mealType: 'lunch',
    menu: ['돈까스', '된장국', '깍두기', '쌀밥'],
    allergyWarnings: [
      {
        childId: 'c4',
        childName: '최하은',
        allergen: '계란',
        menuItem: '돈까스',
      },
      {
        childId: 'c7',
        childName: '한도윤',
        allergen: '밀가루',
        menuItem: '돈까스',
      },
    ],
  },
  {
    id: 'meal3',
    date: '2026-04-07',
    mealType: 'snack_pm',
    menu: ['떡볶이', '어묵국'],
    allergyWarnings: [
      {
        childId: 'c7',
        childName: '한도윤',
        allergen: '밀가루',
        menuItem: '떡볶이',
      },
    ],
  },
];

// ── 알림장 키워드 옵션 ──
export const NOTICE_KEYWORDS = [
  '식사',
  '수면',
  '놀이',
  '사회성',
  '언어발달',
  '배변',
  '기분/정서',
  '체육활동',
  '미술활동',
  '음악활동',
  '야외활동',
  '독서',
  '양보',
  '협동',
  '창의성',
  '집중력',
  '인사',
  '정리정돈',
];

// ── 쿠션어 레벨 설명 ──
export const CUSHION_LEVELS = [
  { value: 'soft' as const, label: '부드럽게', emoji: '🌸', description: '최대한 긍정적으로 표현' },
  { value: 'medium' as const, label: '보통', emoji: '🌿', description: '적절한 균형' },
  { value: 'strong' as const, label: '솔직하게', emoji: '💪', description: '상황을 명확하게 전달' },
];
