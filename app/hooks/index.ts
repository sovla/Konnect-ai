// 커스텀 훅들의 export를 관리하는 파일

// === 새로운 분류별 hooks ===

// 통계 관련 훅들
export * from './stats';

// 배달 관련 훅들
export * from './delivery';

// 라이더 관련 훅들
export * from './rider';

// AI 관련 훅들
export * from './ai';

// 공지사항 관련 훅들
export * from './announcement';

// 설정 관련 훅들
export * from './settings';

// 유틸리티 관련 훅들 (Query 관련)
export * from './utils';

// 배치 관리 (신규 추가)
export * from './batch/useBatchQueries';
export { BATCH_QUERY_KEYS } from './batch/useBatchQueries';

// === 기존 유틸리티 hooks ===

// 유틸리티 훅들
export { useDebounce, useDebouncedValue } from './useDebounce';

// 지도 관련 훅들
export { useMapInteraction } from './useMapInteraction';

// 인증 관련 훅들
export { useAuth, useNotifications } from './useAuth';

// === 레거시 호환성을 위한 export (기존 useQueries에서 가져오던 것들) ===
// 새로운 import 경로 사용을 권장하지만, 기존 코드 호환성을 위해 유지

// 통계
export { useTodayStats, useAnalytics, STATS_QUERY_KEYS } from './stats';

// 배달
export { useDeliveries, useCompleteDelivery, DELIVERY_QUERY_KEYS } from './delivery';

// 라이더
export { useRiderProfile, useToggleRiderStatus, RIDER_QUERY_KEYS } from './rider';

// AI
export { useAIPredictions, AI_QUERY_KEYS } from './ai';

// 공지사항
export { useAnnouncements, ANNOUNCEMENT_QUERY_KEYS } from './announcement';

// 유틸리티
export { useRefreshData, usePrefetchData } from './utils';

// 기존 QUERY_KEYS를 위한 호환성 export (deprecated)
export const QUERY_KEYS = {
  TODAY_STATS: 'todayStats',
  DELIVERIES: 'deliveries',
  RIDER_PROFILE: 'riderProfile',
  AI_PREDICTIONS: 'aiPredictions',
  ANNOUNCEMENTS: 'announcements',
  ANALYTICS: 'analytics',
} as const;

// 향후 추가될 커스텀 훅들을 위한 공간
// export { useLocalStorage } from './useLocalStorage';
// export { useWindowSize } from './useWindowSize';
