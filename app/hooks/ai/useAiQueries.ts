import { useQuery } from '@tanstack/react-query';
import { getAIPredictions } from '@/app/apis';
import { AIPredictionType } from '@/app/types';

// Query Keys 상수 정의
export const AI_QUERY_KEYS = {
  AI_PREDICTIONS: 'aiPredictions',
} as const;

// AI 예측 데이터 조회 - 조건부 타입으로 타입 안전성 보장
export const useAIPredictions = <T extends AIPredictionType | undefined>(type?: T) => {
  return useQuery({
    queryKey: [AI_QUERY_KEYS.AI_PREDICTIONS, type],
    queryFn: () => getAIPredictions(type),
    // AI 예측은 1분마다 갱신
    refetchInterval: 60000,
    staleTime: 1000 * 30, // 30초간 fresh
  });
};
