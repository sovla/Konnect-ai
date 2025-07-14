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

// API 함수들 예시:
// export { getDeliveries } from './deliveryApi';
// export { getRiderProfile } from './riderApi';
// export { getPredictionData } from './predictionApi';

export {}; 