/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  Child,
  AttendanceRecord,
  ScheduleItem,
  Notice,
  ObservationLog,
  DashboardStats,
  ActivityTimeline,
  MealPlan,
  CushionLevel,
} from '../types';
import {
  MOCK_CHILDREN,
  MOCK_ATTENDANCE,
  MOCK_SCHEDULES,
  MOCK_NOTICES,
  MOCK_OBSERVATIONS,
  MOCK_DASHBOARD_STATS,
  MOCK_ACTIVITY_TIMELINE,
  MOCK_MEAL_PLANS,
} from '../constants/mockData';

interface AppDataContextType {
  children: Child[];
  attendance: AttendanceRecord[];
  schedules: ScheduleItem[];
  notices: Notice[];
  observations: ObservationLog[];
  stats: DashboardStats;
  activities: ActivityTimeline[];
  meals: MealPlan[];

  // Actions
  markAttendance: (childId: string, status: AttendanceRecord['status']) => void;
  addNotice: (notice: Notice) => void;
  generateAINotice: (
    childId: string,
    keywords: string[],
    memo: string,
    cushionLevel: CushionLevel,
  ) => Promise<Notice>;
  generateBatchNotices: (
    childIds: string[],
    keywords: string[],
    memo: string,
    cushionLevel: CushionLevel,
  ) => Promise<Notice[]>;
  addObservation: (observation: ObservationLog) => void;
  generateAIObservation: (childId: string, photoFile?: File) => Promise<ObservationLog>;
  toggleScheduleComplete: (scheduleId: string) => void;
}

const AppDataContext = createContext<AppDataContextType | null>(null);

// AI 알림장 생성 프롬프트 (mock)
function generateNoticeContent(
  childName: string,
  keywords: string[],
  memo: string,
  cushionLevel: CushionLevel,
): string {
  const cushionPhrases = {
    soft: [
      '오늘도 사랑스러운',
      '멋지게 성장하고 있는',
      '항상 밝은 모습의',
    ],
    medium: ['', '오늘 하루도 잘 보낸', '열심히 활동한'],
    strong: ['', '', ''],
  };
  const phrases = cushionPhrases[cushionLevel];
  const intro = phrases[Math.floor(Math.random() * phrases.length)];

  const keywordSentences: Record<string, string[]> = {
    식사: [
      `${childName}이(가) 점심을 맛있게 잘 먹었답니다.`,
      `식사 시간에 골고루 먹으려고 노력하는 모습이 보였어요.`,
    ],
    수면: [
      `낮잠 시간에 편안하게 잘 쉬었어요.`,
      `충분한 휴식을 취한 후 오후 활동에 활발하게 참여했습니다.`,
    ],
    놀이: [
      `자유놀이 시간에 친구들과 즐겁게 놀았습니다.`,
      `상상력을 발휘하며 창의적인 놀이를 했어요.`,
    ],
    사회성: [
      `친구들과 사이좋게 어울리며 함께 활동했습니다.`,
      `다른 친구에게 먼저 다가가 도움을 주는 모습이 보였어요.`,
    ],
    양보: [
      `친구에게 장난감을 양보하는 멋진 모습을 보여주었답니다.`,
    ],
    야외활동: [
      `야외 활동에서 자연을 탐구하며 즐거운 시간을 보냈어요.`,
    ],
    협동: [
      `친구들과 힘을 합쳐 활동을 완성하는 모습이 인상적이었어요.`,
    ],
  };

  let body = '';
  keywords.forEach((kw) => {
    const sentences = keywordSentences[kw];
    if (sentences) {
      body += sentences[Math.floor(Math.random() * sentences.length)] + ' ';
    }
  });

  if (memo) {
    body += memo + ' ';
  }

  if (!body.trim()) {
    body = `${childName}이(가) 오늘 하루도 건강하게 잘 보냈습니다. `;
  }

  const content =
    (intro ? `${intro} ${childName}! ` : '') +
    body.trim() +
    '\n\n내일도 즐거운 하루 보내요! 😊';

  return content;
}

export function AppDataProvider({ children: childrenProp }: { children: ReactNode }) {
  const [childrenData] = useState<Child[]>(MOCK_CHILDREN);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);
  const [schedules, setSchedules] = useState<ScheduleItem[]>(MOCK_SCHEDULES);
  const [notices, setNotices] = useState<Notice[]>(MOCK_NOTICES);
  const [observations, setObservations] = useState<ObservationLog[]>(MOCK_OBSERVATIONS);
  const [stats, setStats] = useState<DashboardStats>(MOCK_DASHBOARD_STATS);
  const [activities] = useState<ActivityTimeline[]>(MOCK_ACTIVITY_TIMELINE);
  const [meals] = useState<MealPlan[]>(MOCK_MEAL_PLANS);

  const markAttendance = useCallback(
    (childId: string, status: AttendanceRecord['status']) => {
      setAttendance((prev) =>
        prev.map((a) =>
          a.childId === childId
            ? {
              ...a,
              status,
              arrivalTime:
                status === 'present'
                  ? new Date().toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })
                  : a.arrivalTime,
            }
            : a,
        ),
      );
      setStats((prev) => {
        const presentDelta = status === 'present' ? 1 : -1;
        return {
          ...prev,
          presentCount: prev.presentCount + presentDelta,
          absentCount: prev.absentCount - presentDelta,
        };
      });
    },
    [],
  );

  const addNotice = useCallback((notice: Notice) => {
    setNotices((prev) => [notice, ...prev]);
  }, []);

  const generateAINotice = useCallback(
    async (
      childId: string,
      keywords: string[],
      memo: string,
      cushionLevel: CushionLevel,
    ): Promise<Notice> => {
      await new Promise((r) => setTimeout(r, 1200));
      const child = childrenData.find((c) => c.id === childId);
      const content = generateNoticeContent(
        child?.name ?? '아이',
        keywords,
        memo,
        cushionLevel,
      );
      const notice: Notice = {
        id: `n-${Date.now()}`,
        type: 'individual',
        childId,
        childName: child?.name,
        title: '오늘의 하루',
        content,
        date: new Date().toISOString().split('T')[0],
        isRead: false,
        isSent: false,
        keywords,
        cushionLevel,
      };
      setNotices((prev) => [notice, ...prev]);
      setStats((prev) => ({
        ...prev,
        noticeCompleted: prev.noticeCompleted + 1,
      }));
      return notice;
    },
    [childrenData],
  );

  const generateBatchNotices = useCallback(
    async (
      childIds: string[],
      keywords: string[],
      memo: string,
      cushionLevel: CushionLevel,
    ): Promise<Notice[]> => {
      await new Promise((r) => setTimeout(r, 2000));
      const newNotices: Notice[] = childIds.map((childId) => {
        const child = childrenData.find((c) => c.id === childId);
        return {
          id: `n-${Date.now()}-${childId}`,
          type: 'individual' as const,
          childId,
          childName: child?.name,
          title: '오늘의 하루',
          content: generateNoticeContent(
            child?.name ?? '아이',
            keywords,
            memo,
            cushionLevel,
          ),
          date: new Date().toISOString().split('T')[0],
          isRead: false,
          isSent: false,
          keywords,
          cushionLevel,
        };
      });
      setNotices((prev) => [...newNotices, ...prev]);
      setStats((prev) => ({
        ...prev,
        noticeCompleted: prev.noticeCompleted + newNotices.length,
      }));
      return newNotices;
    },
    [childrenData],
  );

  const addObservation = useCallback((observation: ObservationLog) => {
    setObservations((prev) => [observation, ...prev]);
  }, []);

  const generateAIObservation = useCallback(
    async (childId: string, photoFile?: File): Promise<ObservationLog> => {
      // Use photoFile to avoid unused var lint error if needed, or remove it from here
      void photoFile;
      await new Promise((r) => setTimeout(r, 1500));
      const child = childrenData.find((c) => c.id === childId);
      const observation: ObservationLog = {
        id: `obs-${Date.now()}`,
        childId,
        childName: child?.name ?? '아이',
        date: new Date().toISOString().split('T')[0],
        categories: [
          {
            name: '사회관계',
            analysis:
              '또래와의 상호작용에서 긍정적인 의사소통 능력이 관찰되었습니다.',
          },
          {
            name: '예술경험',
            analysis:
              '미술 활동에서 다양한 색상을 활용해 자유로운 표현을 시도했습니다.',
          },
          {
            name: '자연탐구',
            analysis:
              '주변 환경에 대한 관심이 높으며, 탐구하는 자세를 보였습니다.',
          },
        ],
        content: `${child?.name ?? '아이'}의 활동 사진을 바탕으로 AI가 분석한 관찰일지입니다. 자유놀이 시간에 또래 친구들과 적극적으로 상호작용하며, 사회성 발달이 잘 이루어지고 있는 것으로 관찰됩니다.`,
        isAIGenerated: true,
      };
      setObservations((prev) => [observation, ...prev]);
      setStats((prev) => ({
        ...prev,
        observationCompleted: prev.observationCompleted + 1,
      }));
      return observation;
    },
    [childrenData],
  );

  const toggleScheduleComplete = useCallback((scheduleId: string) => {
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === scheduleId ? { ...s, isCompleted: !s.isCompleted } : s,
      ),
    );
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        children: childrenData,
        attendance,
        schedules,
        notices,
        observations,
        stats,
        activities,
        meals,
        markAttendance,
        addNotice,
        generateAINotice,
        generateBatchNotices,
        addObservation,
        generateAIObservation,
        toggleScheduleComplete,
      }}
    >
      {childrenProp}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextType {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
