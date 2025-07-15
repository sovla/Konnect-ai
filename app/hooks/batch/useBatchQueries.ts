import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BatchSchedulerRequest,
  BatchSchedulerResponse,
  BatchLogsResponse,
  BatchJobType,
} from '@/app/types/dto/common.dto';

// 배치 스케줄러 실행 API
const executeBatchScheduler = async (data: BatchSchedulerRequest): Promise<BatchSchedulerResponse> => {
  const response = await fetch('/api/batch-scheduler', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '배치 스케줄러 실행에 실패했습니다.');
  }

  return response.json();
};

// 배치 로그 조회 API
const getBatchLogs = async (params: { type?: BatchJobType; limit?: number }): Promise<BatchLogsResponse> => {
  const searchParams = new URLSearchParams();
  if (params.type) searchParams.append('type', params.type);
  if (params.limit) searchParams.append('limit', params.limit.toString());

  const response = await fetch(`/api/batch-scheduler?${searchParams.toString()}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '배치 로그 조회에 실패했습니다.');
  }

  return response.json();
};

// 배치 스케줄러 실행 훅
export const useBatchScheduler = () => {
  const queryClient = useQueryClient();

  return useMutation<BatchSchedulerResponse, Error, BatchSchedulerRequest>({
    mutationFn: executeBatchScheduler,
    onSuccess: (data) => {
      console.log('배치 스케줄러 실행 성공:', data.message);

      // 배치 로그 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['batchLogs'] });

      // 관련 데이터 무효화
      queryClient.invalidateQueries({ queryKey: ['ai-predictions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (error) => {
      console.error('배치 스케줄러 실행 실패:', error.message);
    },
  });
};

// 배치 로그 조회 훅
export const useBatchLogs = (params: { type?: BatchJobType; limit?: number } = {}) => {
  return useQuery({
    queryKey: ['batchLogs', params],
    queryFn: () => getBatchLogs(params),
    refetchInterval: 30000, // 30초마다 자동 새로고침
    staleTime: 10000, // 10초 동안 캐시 유효
  });
};

// 편의 함수들
export const batchSchedulerHelpers = {
  // AI 추천 배치 실행
  runAiRecommendation: (immediate: boolean = true) => ({
    type: 'ai-recommendation' as const,
    immediate,
  }),

  // 데이터 정리 배치 실행
  runDataCleanup: (immediate: boolean = true) => ({
    type: 'data-cleanup' as const,
    immediate,
  }),

  // 분석 업데이트 배치 실행
  runAnalyticsUpdate: (immediate: boolean = true) => ({
    type: 'analytics-update' as const,
    immediate,
  }),
};
