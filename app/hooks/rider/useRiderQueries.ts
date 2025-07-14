import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRiderProfile } from '@/app/apis';
import { STATS_QUERY_KEYS } from '../stats/useStatsQueries';

// Query Keys 상수 정의
export const RIDER_QUERY_KEYS = {
  RIDER_PROFILE: 'riderProfile',
} as const;

// 라이더 프로필 조회
export const useRiderProfile = () => {
  return useQuery({
    queryKey: [RIDER_QUERY_KEYS.RIDER_PROFILE],
    queryFn: getRiderProfile,
    // 프로필 정보는 자주 변하지 않으므로 10분간 fresh 상태 유지
    staleTime: 1000 * 60 * 10,
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
      queryClient.invalidateQueries({ queryKey: [RIDER_QUERY_KEYS.RIDER_PROFILE] });
      queryClient.invalidateQueries({ queryKey: [STATS_QUERY_KEYS.TODAY_STATS] });
    },
    onError: (error) => {
      console.error('라이더 상태 변경 중 오류:', error);
    },
  });
};
