import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTodayStats,
  getDeliveries,
  getRiderProfile,
  getAIPredictions,
  getAnnouncements,
  getAnalytics,
} from '../apis';
import { AIPredictionType } from '@/app/types';

// Query Keys 상수 정의
export const QUERY_KEYS = {
  TODAY_STATS: 'todayStats',
  DELIVERIES: 'deliveries',
  RIDER_PROFILE: 'riderProfile',
  AI_PREDICTIONS: 'aiPredictions',
  ANNOUNCEMENTS: 'announcements',
  ANALYTICS: 'analytics',
} as const;

// 오늘의 성과 데이터 조회
export const useTodayStats = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.TODAY_STATS],
    queryFn: getTodayStats,
    // 실시간 데이터이므로 30초마다 자동 갱신
    refetchInterval: 30000,
    // 컴포넌트 마운트 시 항상 최신 데이터 조회
    staleTime: 0,
  });
};

// 배달 내역 조회
export const useDeliveries = (params?: { date?: string; limit?: number }) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DELIVERIES, params],
    queryFn: () => getDeliveries(params),
    // 배달 내역은 자주 변하지 않으므로 5분간 fresh 상태 유지
    staleTime: 1000 * 60 * 5,
    // params가 없으면 쿼리 실행하지 않음
    enabled: !!params,
  });
};

// 라이더 프로필 조회
export const useRiderProfile = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.RIDER_PROFILE],
    queryFn: getRiderProfile,
    // 프로필 정보는 자주 변하지 않으므로 10분간 fresh 상태 유지
    staleTime: 1000 * 60 * 10,
  });
};

// AI 예측 데이터 조회 - 조건부 타입으로 타입 안전성 보장
export const useAIPredictions = <T extends AIPredictionType | undefined>(type?: T) => {
  return useQuery({
    queryKey: [QUERY_KEYS.AI_PREDICTIONS, type],
    queryFn: () => getAIPredictions(type),
    // AI 예측은 1분마다 갱신
    refetchInterval: 60000,
    staleTime: 1000 * 30, // 30초간 fresh
  });
};

// 공지사항 조회
export const useAnnouncements = (params?: { type?: string; active?: boolean }) => {
  return useQuery({
    queryKey: [QUERY_KEYS.ANNOUNCEMENTS, params],
    queryFn: () => getAnnouncements(params),
    // 공지사항은 5분간 fresh 상태 유지
    staleTime: 1000 * 60 * 5,
  });
};

// 수익 분석 데이터 조회
export const useAnalytics = (type?: 'weekly' | 'monthly') => {
  return useQuery({
    queryKey: [QUERY_KEYS.ANALYTICS, type],
    queryFn: () => getAnalytics(type),
    // 분석 데이터는 하루에 한 번 정도만 갱신되므로 1시간간 fresh 상태 유지
    staleTime: 1000 * 60 * 60,
  });
};

// 데이터 강제 새로고침을 위한 훅
export const useRefreshData = () => {
  const queryClient = useQueryClient();

  const refreshTodayStats = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TODAY_STATS] });
  };

  const refreshDeliveries = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DELIVERIES] });
  };

  const refreshAIPredictions = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AI_PREDICTIONS] });
  };

  const refreshAll = () => {
    queryClient.invalidateQueries();
  };

  return {
    refreshTodayStats,
    refreshDeliveries,
    refreshAIPredictions,
    refreshAll,
  };
};

// 캐시된 데이터 프리페칭을 위한 훅
export const usePrefetchData = () => {
  const queryClient = useQueryClient();

  const prefetchDeliveries = (params?: { date?: string; limit?: number }) => {
    queryClient.prefetchQuery({
      queryKey: [QUERY_KEYS.DELIVERIES, params],
      queryFn: () => getDeliveries(params),
      staleTime: 1000 * 60 * 5,
    });
  };

  const prefetchAnalytics = (type?: 'weekly' | 'monthly') => {
    queryClient.prefetchQuery({
      queryKey: [QUERY_KEYS.ANALYTICS, type],
      queryFn: () => getAnalytics(type),
      staleTime: 1000 * 60 * 60,
    });
  };

  return {
    prefetchDeliveries,
    prefetchAnalytics,
  };
};

// 배달 완료 시 실행할 mutation (향후 API 연동용)
export const useCompleteDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // 실제 API 호출 대신 임시로 Promise 반환
      return new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      // 배달 완료 후 관련 데이터들 갱신
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TODAY_STATS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DELIVERIES] });
    },
    onError: (error) => {
      console.error('배달 완료 처리 중 오류:', error);
    },
  });
};

// 라이더 상태 변경 mutation (온라인/오프라인)
export const useToggleRiderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // 실제 API 호출 대신 임시로 Promise 반환
      return new Promise((resolve) => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      // 상태 변경 후 프로필 정보 갱신
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RIDER_PROFILE] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TODAY_STATS] });
    },
    onError: (error) => {
      console.error('라이더 상태 변경 중 오류:', error);
    },
  });
};
