// 프로젝트 전역 상수들

// API 관련
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

// 카카오맵 관련
export const KAKAO_MAP_API_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || '';

// 지도 기본 설정
export const DEFAULT_MAP_CENTER = {
  lat: 37.5665,
  lng: 126.978,
};

export const DEFAULT_MAP_LEVEL = 3;

// 색상 팔레트 (Tremor와 호환)
export const COLORS = {
  primary: '#3b82f6',
  secondary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
} as const;

// 차트 색상
export const CHART_COLORS = [
  '#3b82f6',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#f97316',
  '#84cc16',
] as const;

// 시간대 옵션
export const TIME_SLOTS = [
  { value: 'morning', label: '오전 (06:00-12:00)' },
  { value: 'afternoon', label: '오후 (12:00-18:00)' },
  { value: 'evening', label: '저녁 (18:00-24:00)' },
  { value: 'night', label: '새벽 (00:00-06:00)' },
] as const;

// 배달 상태
export const DELIVERY_STATUS = {
  PENDING: 'pending',
  PICKED_UP: 'picked_up',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

// 배달 상태 라벨
export const DELIVERY_STATUS_LABELS = {
  [DELIVERY_STATUS.PENDING]: '픽업 대기',
  [DELIVERY_STATUS.PICKED_UP]: '배달 중',
  [DELIVERY_STATUS.DELIVERED]: '배달 완료',
  [DELIVERY_STATUS.CANCELLED]: '취소됨',
} as const;
