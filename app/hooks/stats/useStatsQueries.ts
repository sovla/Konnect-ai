import { useQuery } from '@tanstack/react-query';
import { getTodayStats, getAnalytics } from '@/app/apis';

// Query Keys 상수 정의
export const STATS_QUERY_KEYS = {
  TODAY_STATS: 'todayStats',
  ANALYTICS: 'analytics',
} as const;

// 오늘의 성과 데이터 조회
export const useTodayStats = () => {
  return useQuery({
    queryKey: [STATS_QUERY_KEYS.TODAY_STATS],
    queryFn: getTodayStats,
    // 실시간 데이터이므로 30초마다 자동 갱신
    refetchInterval: 30000,
    // 컴포넌트 마운트 시 항상 최신 데이터 조회
    staleTime: 0,
  });
};

// 수익 분석 데이터 조회
export const useAnalytics = (type?: 'weekly' | 'monthly') => {
  return useQuery({
    queryKey: [STATS_QUERY_KEYS.ANALYTICS, type],
    queryFn: () => getAnalytics(type),
    // 분석 데이터는 하루에 한 번 정도만 갱신되므로 1시간간 fresh 상태 유지
    staleTime: 1000 * 60 * 60,
  });
};
