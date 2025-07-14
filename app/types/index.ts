// TypeScript 타입 정의들의 export를 관리하는 파일

// 공통 타입들
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

// 라이더 관련 타입들
export interface Rider {
  id: string;
  name: string;
  phone: string;
  vehicle: 'motorcycle' | 'bicycle' | 'car';
  rating: number;
  totalDeliveries: number;
}

// 배달 관련 타입들
export interface Delivery {
  id: string;
  riderId: string;
  orderTime: string;
  pickupTime?: string;
  deliveryTime?: string;
  status: 'pending' | 'picked_up' | 'delivered' | 'cancelled';
  fee: number;
  distance: number;
  coordinates: {
    pickup: { lat: number; lng: number };
    delivery: { lat: number; lng: number };
  };
}

// 대시보드 관련 타입들
export interface DashboardStats {
  todayEarnings: number;
  todayDeliveries: number;
  averageRating: number;
  totalDistance: number;
}

// 지도 관련 타입들
export interface HeatmapData {
  lat: number;
  lng: number;
  intensity: number;
}

export interface PredictionZone {
  id: string;
  coordinates: { lat: number; lng: number }[];
  expectedOrders: number;
  timeSlot: string;
  color: string;
} 