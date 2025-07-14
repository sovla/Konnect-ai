// API 관련 상수
export const API_BASE_URL = '/api';

// 라우트 상수
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  MAP: '/map',
  ANALYTICS: '/analytics',
} as const;

// 색상 상수 (Tremor 차트와 호환)
export const COLORS = {
  PRIMARY: 'blue',
  SUCCESS: 'emerald',
  WARNING: 'amber',
  DANGER: 'red',
  INFO: 'cyan',
  NEUTRAL: 'gray',
} as const;

// 프로모션 타입별 색상
export const PROMOTION_COLORS = {
  promotion: COLORS.SUCCESS,
  notice: COLORS.INFO,
  incentive: COLORS.WARNING,
} as const;

// 우선순위별 색상
export const PRIORITY_COLORS = {
  high: COLORS.DANGER,
  medium: COLORS.WARNING,
  low: COLORS.NEUTRAL,
} as const;

// 차량 타입
export const VEHICLE_TYPES = {
  motorcycle: '오토바이',
  bicycle: '자전거',
  car: '자동차',
} as const;

// 상태 정보
export const STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  BUSY: 'busy',
} as const;

// 지도 설정
export const MAP_CONFIG = {
  DEFAULT_CENTER: {
    lat: 35.1596,
    lng: 129.1603,
  },
  DEFAULT_ZOOM: 14,
  MAX_ZOOM: 18,
  MIN_ZOOM: 10,
} as const;

// 날짜/시간 관련 상수
export const DATE_CONFIG = {
  // 프로젝트 기준 날짜 (개발 환경에서만 사용)
  DEMO_BASE_DATE: '2025-07-14',

  // 날짜 포맷
  FORMATS: {
    DATE: 'yyyy-MM-dd',
    DATETIME: 'yyyy-MM-dd HH:mm:ss',
    TIME: 'HH:mm',
    KOREAN_DATE: 'yyyy년 MM월 dd일',
    KOREAN_DATETIME: 'yyyy년 MM월 dd일 HH:mm',
  },

  // 운행 시간 범위
  OPERATION_HOURS: {
    START: 13,
    END: 22,
  },

  // 자동 새로고침 간격 (milliseconds)
  REFRESH_INTERVALS: {
    REAL_TIME: 30000, // 30초
    PREDICTIONS: 60000, // 1분
    GENERAL: 300000, // 5분
  },
} as const;

// 프리셋 날짜 범위 타입
export const DATE_PRESETS = {
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last7days',
  THIS_MONTH: 'thisMonth',
  THIS_WEEK: 'thisWeek',
  CUSTOM: 'custom',
} as const;

// 배달 관련 상수
export const DELIVERY_CONFIG = {
  // 기본 배달료
  BASE_FEE: 3500,

  // 평균 배달 시간 (분)
  AVG_DELIVERY_TIME: 25,

  // 목표 콜 수락률 (%)
  TARGET_ACCEPTANCE_RATE: 90,

  // 목표 평점
  TARGET_RATING: 4.8,
} as const;

// 대시보드 위젯 설정
export const WIDGET_CONFIG = {
  // 차트 높이
  CHART_HEIGHT: 300,

  // 미니 차트 높이
  MINI_CHART_HEIGHT: 150,

  // 카드 그리드 설정
  GRID_COLS: {
    MOBILE: 1,
    TABLET: 2,
    DESKTOP: 2,
  },
} as const;

// API 쿼리 키
export const QUERY_KEYS = {
  TODAY_STATS: 'todayStats',
  DELIVERIES: 'deliveries',
  RIDER_PROFILE: 'riderProfile',
  AI_PREDICTIONS: 'aiPredictions',
  ANNOUNCEMENTS: 'announcements',
  ANALYTICS: 'analytics',
} as const;

// 에러 메시지
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  SERVER_ERROR: '서버에 문제가 발생했습니다.',
  DATA_NOT_FOUND: '데이터를 찾을 수 없습니다.',
  INVALID_DATE: '올바르지 않은 날짜입니다.',
  LOCATION_ERROR: '위치 정보를 가져올 수 없습니다.',
} as const;
