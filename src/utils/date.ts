/**
 * 날짜를 한국어 형식으로 포맷
 * @returns "2026년 4월 7일 화요일"
 */
export function formatDateKorean(dateInput: Date | string = new Date()): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = days[date.getDay()];
  return `${year}년 ${month}월 ${day}일 ${dayOfWeek}`;
}

/**
 * 시간을 "오전/오후 HH:MM" 형으로
 */
export function formatTimeKorean(timeInput: string): string {
  let h: number, m: number;
  
  if (timeInput.includes('T') || timeInput.includes('-')) {
    // ISO string or full date string
    const date = new Date(timeInput);
    h = date.getHours();
    m = date.getMinutes();
  } else {
    // HH:MM string
    [h, m] = timeInput.split(':').map(Number);
  }

  const period = h < 12 ? '오전' : '오후';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${period} ${hour12}:${String(m).padStart(2, '0')}`;
}

/**
 * 상대 시간 표시 (n분 전, n시간 전, …)
 */
export function getRelativeTime(timeStr: string): string {
  const now = new Date();
  const [h, m] = timeStr.split(':').map(Number);
  const target = new Date(now);
  target.setHours(h, m, 0, 0);

  const diff = now.getTime() - target.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 0) return '곧';
  if (minutes < 1) return '방금';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return '어제';
}

/**
 * YYYY-MM-DD 형식으로 반환 (로컬 타임존/KST 기준)
 */
export function formatDateISO(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 월의 일수를 계산
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * 월의 첫째 날 요일 인덱스 (0=일, 1=월 ...)
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}
