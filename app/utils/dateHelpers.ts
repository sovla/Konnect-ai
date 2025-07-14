import {
  format,
  parseISO,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isValid,
  differenceInDays,
  differenceInHours,
  addDays,
  addHours,
  formatDistanceToNow,
  isToday,
  isYesterday,
  formatISO,
} from 'date-fns';
import { ko } from 'date-fns/locale';

// 프로젝트 기준 날짜 설정
// 개발/데모 환경에서는 고정 날짜, 프로덕션에서는 실제 현재 날짜 사용
export const PROJECT_BASE_DATE =
  process.env.NODE_ENV === 'development'
    ? new Date('2025-07-14') // 데모용 고정 날짜
    : new Date(); // 실제 현재 날짜

// 현재 날짜를 반환하는 함수 (환경에 따라 다름)
export const getCurrentDate = (): Date => {
  return process.env.NODE_ENV === 'development'
    ? new Date('2025-07-14') // 개발 환경: Mock 데이터와 일관성을 위한 고정 날짜
    : new Date(); // 프로덕션 환경: 실제 현재 날짜
};

// 환경 설정 확인 함수
export const isDevelopmentMode = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

// 데모 모드인지 확인 (환경변수로 제어 가능)
export const isDemoMode = (): boolean => {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || process.env.NODE_ENV === 'development';
};

// 날짜 포맷팅 함수들
export const formatDate = (date: Date | string, formatStr: string = 'yyyy-MM-dd'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isValid(dateObj) ? format(dateObj, formatStr) : '';
};

export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, 'yyyy-MM-dd HH:mm:ss');
};

export const formatTime = (date: Date | string): string => {
  return formatDate(date, 'HH:mm');
};

export const formatKoreanDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isValid(dateObj) ? format(dateObj, 'yyyy년 MM월 dd일', { locale: ko }) : '';
};

export const formatKoreanDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isValid(dateObj) ? format(dateObj, 'yyyy년 MM월 dd일 HH:mm', { locale: ko }) : '';
};

// 날짜 계산 함수들
export const getYesterday = (baseDate?: Date): Date => {
  return subDays(baseDate || getCurrentDate(), 1);
};

export const getLast7Days = (baseDate?: Date): Date => {
  return subDays(baseDate || getCurrentDate(), 7);
};

export const getThisMonthStart = (baseDate?: Date): Date => {
  return startOfMonth(baseDate || getCurrentDate());
};

export const getThisMonthEnd = (baseDate?: Date): Date => {
  return endOfMonth(baseDate || getCurrentDate());
};

export const getThisWeekStart = (baseDate?: Date): Date => {
  return startOfWeek(baseDate || getCurrentDate(), { weekStartsOn: 1 }); // 월요일 시작
};

export const getThisWeekEnd = (baseDate?: Date): Date => {
  return endOfWeek(baseDate || getCurrentDate(), { weekStartsOn: 1 });
};

// 날짜 범위 생성 함수
export interface DateRange {
  startDate: string;
  endDate: string;
}

export const createDateRange = (
  preset: 'yesterday' | 'last7days' | 'thisMonth' | 'thisWeek',
  baseDate?: Date,
): DateRange => {
  const today = baseDate || getCurrentDate();
  let startDate: Date;
  let endDate = today;

  switch (preset) {
    case 'yesterday':
      startDate = getYesterday(today);
      endDate = today;
      break;
    case 'last7days':
      startDate = getLast7Days(today);
      break;
    case 'thisMonth':
      startDate = getThisMonthStart(today);
      break;
    case 'thisWeek':
      startDate = getThisWeekStart(today);
      break;
    default:
      startDate = today;
  }

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
};

// 시간 관련 함수들
export const getCurrentHour = (baseDate?: Date): number => {
  return (baseDate || getCurrentDate()).getHours();
};

export const getCurrentTime = (baseDate?: Date): string => {
  return formatTime(baseDate || getCurrentDate());
};

export const addHoursToDate = (date: Date | string, hours: number): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return addHours(dateObj, hours);
};

export const addDaysToDate = (date: Date | string, days: number): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return addDays(dateObj, days);
};

// 상대적 시간 표시
export const getRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (isToday(dateObj)) {
    return '오늘';
  }

  if (isYesterday(dateObj)) {
    return '어제';
  }

  return formatDistanceToNow(dateObj, {
    addSuffix: true,
    locale: ko,
  });
};

// 날짜 차이 계산
export const getDaysDifference = (date1: Date | string, date2: Date | string): number => {
  const dateObj1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const dateObj2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return differenceInDays(dateObj2, dateObj1);
};

export const getHoursDifference = (date1: Date | string, date2: Date | string): number => {
  const dateObj1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const dateObj2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return differenceInHours(dateObj2, dateObj1);
};

// 날짜 유효성 검사
export const isValidDate = (date: unknown): date is Date => {
  return date instanceof Date && isValid(date);
};

export const isValidDateString = (dateString: string): boolean => {
  return isValid(parseISO(dateString));
};

// ISO 문자열 변환
export const toISOString = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatISO(dateObj);
};

// 시간대별 슬롯 생성 (지도 필터용)
export const generateTimeSlots = (startHour: number = 13, endHour: number = 22): { value: number; label: string }[] => {
  const slots = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    slots.push({
      value: hour,
      label: `${hour.toString().padStart(2, '0')}:00`,
    });
  }
  return slots;
};

// 온라인 시간 포맷팅 (HH:MM:SS)
export const formatOnlineTime = (hours: number, minutes: number = 0, seconds: number = 0): string => {
  const h = Math.floor(hours).toString().padStart(2, '0');
  const m = Math.floor(minutes).toString().padStart(2, '0');
  const s = Math.floor(seconds).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

// 디버그용: 현재 사용 중인 날짜 정보 출력
export const getDateInfo = () => {
  return {
    currentDate: getCurrentDate(),
    isDemo: isDemoMode(),
    isDev: isDevelopmentMode(),
    formattedDate: formatKoreanDate(getCurrentDate()),
  };
};
