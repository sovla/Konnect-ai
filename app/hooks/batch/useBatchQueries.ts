import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/app/apis';

// Query Keys 상수 정의
export const BATCH_QUERY_KEYS = {
  BATCH_LOGS: 'batchLogs',
  BATCH_STATUS: 'batchStatus',
} as const;

// 배치 로그 조회 타입
interface BatchLog {
  id: string;
  timestamp: Date;
  type: string;
  status: 'running' | 'completed' | 'failed';
  result?: {
    success: boolean;
    data?: Record<string, unknown>;
    message?: string;
  };
  error?: string;
}

interface BatchLogsResponse {
  success: boolean;
  data: {
    logs: BatchLog[];
    total: number;
  };
}

// 배치 실행 요청 타입
interface BatchExecuteRequest {
  type: string;
  immediate?: boolean;
}

interface BatchExecuteResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

// 배치 로그 조회 훅
export const useBatchLogs = (type?: string, limit?: number) => {
  return useQuery({
    queryKey: [BATCH_QUERY_KEYS.BATCH_LOGS, type, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (limit) params.append('limit', limit.toString());

      return apiClient.get<BatchLogsResponse>(`/batch-scheduler?${params.toString()}`);
    },
    // 배치 로그는 자주 변경되므로 30초마다 갱신
    refetchInterval: 30000,
    staleTime: 1000 * 30,
  });
};

// AI 추천 배치 실행 훅
export const useExecuteAIRecommendationBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: BatchExecuteRequest) => {
      return apiClient.post<BatchExecuteResponse>('/batch-scheduler', request);
    },
    onSuccess: () => {
      // 배치 실행 후 로그 갱신
      queryClient.invalidateQueries({ queryKey: [BATCH_QUERY_KEYS.BATCH_LOGS] });
    },
    onError: (error) => {
      console.error('배치 실행 중 오류:', error);
    },
  });
};

// 배치 실행 상태 조회 훅 (실시간 모니터링)
export const useBatchStatus = (batchId?: string) => {
  const { data: batchLogs } = useBatchLogs();

  return useQuery({
    queryKey: [BATCH_QUERY_KEYS.BATCH_STATUS, batchId],
    queryFn: async () => {
      if (!batchId || !batchLogs) return null;

      const targetLog = batchLogs.data.logs.find((log) => log.id === batchId);
      return targetLog || null;
    },
    enabled: !!batchId && !!batchLogs,
    refetchInterval: (data) => {
      // 실행 중인 배치는 5초마다 갱신
      return (data as unknown as BatchLog)?.status === 'running' ? 5000 : false;
    },
  });
};

// 배치 관리 유틸리티 함수들
export const useBatchUtils = () => {
  const executeBatch = useExecuteAIRecommendationBatch();

  // AI 추천 배치 즉시 실행
  const executeAIRecommendationNow = () => {
    return executeBatch.mutate({
      type: 'ai-recommendation',
      immediate: true,
    });
  };

  // AI 추천 배치 백그라운드 실행
  const executeAIRecommendationBackground = () => {
    return executeBatch.mutate({
      type: 'ai-recommendation',
      immediate: false,
    });
  };

  // 배치 실행 상태 확인
  const isExecuting = executeBatch.isPending;
  const lastExecutionResult = executeBatch.data;
  const executionError = executeBatch.error;

  return {
    executeAIRecommendationNow,
    executeAIRecommendationBackground,
    isExecuting,
    lastExecutionResult,
    executionError,
  };
};

// 배치 모니터링 대시보드용 훅
export const useBatchDashboard = () => {
  const { data: batchLogs, isLoading } = useBatchLogs('ai-recommendation', 20);

  const stats = {
    totalRuns: batchLogs?.data.total || 0,
    recentRuns: batchLogs?.data.logs.slice(0, 5) || [],
    runningCount: batchLogs?.data.logs.filter((log) => log.status === 'running').length || 0,
    completedCount: batchLogs?.data.logs.filter((log) => log.status === 'completed').length || 0,
    failedCount: batchLogs?.data.logs.filter((log) => log.status === 'failed').length || 0,
  };

  const successRate = stats.totalRuns > 0 ? Math.round((stats.completedCount / stats.totalRuns) * 100) : 0;

  return {
    stats,
    successRate,
    isLoading,
    logs: batchLogs?.data.logs || [],
  };
};
