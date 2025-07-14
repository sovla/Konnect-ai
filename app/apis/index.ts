// API 함수들의 export를 관리하는 파일

import { API_BASE_URL } from '../constants';

// 기본 fetch 래퍼 함수
export const apiClient = {
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
  },

  post: async <T>(endpoint: string, data: unknown): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
  },
};

// 배달 내역 조회
export const getDeliveries = async (params?: { date?: string; limit?: number }) => {
  const searchParams = new URLSearchParams();
  if (params?.date) searchParams.append('date', params.date);
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  return apiClient.get(`/deliveries?${searchParams.toString()}`);
};

// 라이더 프로필 조회
export const getRiderProfile = async () => {
  return apiClient.get('/rider-profile');
};

// 오늘의 통계 조회
export const getTodayStats = async () => {
  return apiClient.get('/today-stats');
};

// AI 예측 데이터 조회
export const getAIPredictions = async (type?: 'predictions' | 'heatmap' | 'hourly') => {
  const searchParams = new URLSearchParams();
  if (type) searchParams.append('type', type);

  return apiClient.get(`/ai-predictions?${searchParams.toString()}`);
};

// 공지사항 조회
export const getAnnouncements = async (params?: { type?: string; active?: boolean }) => {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.append('type', params.type);
  if (params?.active !== undefined) searchParams.append('active', params.active.toString());

  return apiClient.get(`/announcements?${searchParams.toString()}`);
};

// 수익 분석 데이터 조회
export const getAnalytics = async (type?: 'weekly' | 'monthly') => {
  const searchParams = new URLSearchParams();
  if (type) searchParams.append('type', type);

  return apiClient.get(`/analytics?${searchParams.toString()}`);
};
