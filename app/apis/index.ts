// API 함수들의 export를 관리하는 파일

import {
  AIPredictionResponse,
  AIPredictionType,
  AnalyticsResponse,
  AnalyticsType,
  Announcement,
  ApiResponse,
  TodayStats,
} from '@/app/types';
import { DeliveriesResponse, RiderSettingsResponse } from '@/app/types/dto';
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

// 배달 내역 조회 (검색, 페이지네이션 지원)
export const getDeliveries = async (params?: { date?: string; limit?: number; page?: number; search?: string }) => {
  const searchParams = new URLSearchParams();
  if (params?.date) searchParams.append('date', params.date);
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.search) searchParams.append('search', params.search);

  return apiClient.get<DeliveriesResponse>(`/deliveries?${searchParams.toString()}`);
};

// 라이더 프로필 조회
export const getRiderProfile = async () => {
  return apiClient.get<RiderSettingsResponse>('/rider-profile');
};

// 오늘의 통계 조회
export const getTodayStats = async () => {
  return apiClient.get<ApiResponse<TodayStats>>('/today-stats');
};

// AI 예측 데이터 조회 - 조건부 타입으로 타입 안전성 보장

export const getAIPredictions = async <T extends AIPredictionType | undefined>(
  type?: T,
): Promise<AIPredictionResponse<T>> => {
  const searchParams = new URLSearchParams();
  if (type) searchParams.append('type', type);

  return apiClient.get(`/ai-predictions?${searchParams.toString()}`) as Promise<AIPredictionResponse<T>>;
};

// 공지사항 조회
export const getAnnouncements = async (params?: { type?: string; active?: boolean }) => {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.append('type', params.type);
  if (params?.active !== undefined) searchParams.append('active', params.active.toString());

  return apiClient.get<ApiResponse<Announcement[]>>(`/announcements?${searchParams.toString()}`);
};

// 수익 분석 데이터 조회
export const getAnalytics = async <T extends AnalyticsType | undefined>(type?: T): Promise<AnalyticsResponse<T>> => {
  const searchParams = new URLSearchParams();
  if (type) searchParams.append('type', type);

  return apiClient.get(`/analytics?${searchParams.toString()}`) as Promise<AnalyticsResponse<T>>;
};
