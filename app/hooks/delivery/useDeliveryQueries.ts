import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { getDeliveries, getDeliveriesInfinite, getDeliveryStats } from '@/app/apis';
import { STATS_QUERY_KEYS } from '../stats/useStatsQueries';

// Query Keys 상수 정의
export const DELIVERY_QUERY_KEYS = {
  DELIVERIES: 'deliveries',
  DELIVERIES_INFINITE: 'deliveries-infinite',
  DELIVERY_STATS: 'delivery-stats',
} as const;

// 배달 내역 조회 (검색, 페이지네이션 지원)
export const useDeliveries = (params?: { date?: string; limit?: number; page?: number; search?: string }) => {
  return useQuery({
    queryKey: [DELIVERY_QUERY_KEYS.DELIVERIES, params],
    queryFn: () => getDeliveries(params),
    // 배달 내역은 자주 변하지 않으므로 5분간 fresh 상태 유지
    staleTime: 1000 * 60 * 5,
    // params가 없으면 쿼리 실행하지 않음
    enabled: !!params,
  });
};

// 배달 내역 조회 (infinity scroll용)
export const useDeliveriesInfinite = (params?: { period?: 'all' | '7days' | 'month'; limit?: number }) => {
  return useInfiniteQuery({
    queryKey: [DELIVERY_QUERY_KEYS.DELIVERIES_INFINITE, params],
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      getDeliveriesInfinite({
        ...params,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.cursor?.hasNext ? lastPage.cursor.nextCursor : undefined;
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
};

// 배달 통계 조회 (기간별)
export const useDeliveryStats = (period?: 'all' | '7days' | 'month') => {
  return useQuery({
    queryKey: [DELIVERY_QUERY_KEYS.DELIVERY_STATS, period],
    queryFn: () => getDeliveryStats({ period }),
    staleTime: 1000 * 60 * 5,
  });
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
      queryClient.invalidateQueries({ queryKey: [STATS_QUERY_KEYS.TODAY_STATS] });
      queryClient.invalidateQueries({ queryKey: [DELIVERY_QUERY_KEYS.DELIVERIES] });
      queryClient.invalidateQueries({ queryKey: [DELIVERY_QUERY_KEYS.DELIVERIES_INFINITE] });
      queryClient.invalidateQueries({ queryKey: [DELIVERY_QUERY_KEYS.DELIVERY_STATS] });
    },
    onError: (error) => {
      console.error('배달 완료 처리 중 오류:', error);
    },
  });
};
