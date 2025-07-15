import { useMutation, useQueryClient } from '@tanstack/react-query';

interface BatchGenerateRequest {
  riderId?: string;
  count?: number;
  startDate?: string;
  endDate?: string;
  dateRange?: 'today' | 'week' | 'month';
}

interface BatchGenerateResponse {
  success: boolean;
  message: string;
  data: {
    totalCreated: number;
    targetRiders: number;
    dateRange: {
      start: string;
      end: string;
    };
  };
}

// 배달 데이터 자동 생성 API 함수
const batchGenerateDeliveries = async (data: BatchGenerateRequest): Promise<BatchGenerateResponse> => {
  const response = await fetch('/api/deliveries/batch-generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '배달 데이터 생성에 실패했습니다.');
  }

  return response.json();
};

// 배달 데이터 자동 생성 훅
export const useDeliveryGenerate = () => {
  const queryClient = useQueryClient();

  return useMutation<BatchGenerateResponse, Error, BatchGenerateRequest>({
    mutationFn: batchGenerateDeliveries,
    onSuccess: (data) => {
      console.log('배달 데이터 생성 성공:', data.message);

      // 관련 쿼리 무효화하여 데이터 새로고침
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['today-stats'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (error) => {
      console.error('배달 데이터 생성 실패:', error.message);
    },
  });
};

// 편의 함수들
export const deliveryGenerateHelpers = {
  // 특정 라이더의 데이터 생성
  generateForRider: (riderId: string, count: number = 10, dateRange: 'today' | 'week' | 'month' = 'week') => ({
    riderId,
    count,
    dateRange,
  }),

  // 모든 라이더의 데이터 생성
  generateForAllRiders: (count: number = 10, dateRange: 'today' | 'week' | 'month' = 'week') => ({
    count,
    dateRange,
  }),

  // 특정 날짜 범위의 데이터 생성
  generateForDateRange: (startDate: string, endDate: string, count: number = 10, riderId?: string) => ({
    startDate,
    endDate,
    count,
    riderId,
  }),

  // 오늘 데이터 생성
  generateToday: (count: number = 5, riderId?: string) => ({
    count,
    dateRange: 'today' as const,
    riderId,
  }),

  // 이번 주 데이터 생성
  generateThisWeek: (count: number = 20, riderId?: string) => ({
    count,
    dateRange: 'week' as const,
    riderId,
  }),

  // 이번 달 데이터 생성
  generateThisMonth: (count: number = 100, riderId?: string) => ({
    count,
    dateRange: 'month' as const,
    riderId,
  }),
};
