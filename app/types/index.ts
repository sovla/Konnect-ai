// TypeScript 타입 정의들의 export를 관리하는 파일

// 공통 타입들
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

// 날짜 범위 타입 (dateHelpers와 공용)
export interface DateRange {
  startDate: string;
  endDate: string;
}

// 라이더 관련 타입들
export interface RiderProfile {
  id: string;
  name: string;
  dailyGoal: number;
  monthlyGoal: number;
  joinDate: string;
  totalDeliveries: number;
  averageRating: number;
  acceptanceRate: number;
  avgDeliveryTime: number;
  preferredAreas: string[];
  vehicleType: 'motorcycle' | 'bicycle' | 'car';
  isOnline: boolean;
  onlineTime: string;
}

export interface PlatformAverages {
  acceptanceRate: number;
  avgDeliveryTime: number;
  avgDailyEarnings: number;
  avgMonthlyEarnings: number;
  avgRating: number;
  avgDeliveriesPerDay: number;
}

// 배달 관련 타입들
export interface Delivery {
  id: string;
  date: string;
  completedAt: string;
  pickup: {
    address: string;
    lat: number;
    lng: number;
  };
  dropoff: {
    address: string;
    lat: number;
    lng: number;
  };
  earnings: {
    base: number;
    promo: number;
    tip: number;
    total: number;
  };
  rating: number;
  deliveryTime: number;
}

// 오늘의 통계 타입
export interface TodayStats {
  date: string;
  totalEarnings: number;
  completedDeliveries: number;
  onlineTime: string;
  goalProgress: number;
  avgEarningsPerDelivery: number;
  acceptanceRate: number;
  currentStreak: number;
}

// AI 예측 관련 타입들
export interface AIPolygon {
  name: string;
  coords: [number, number][];
  expectedCalls: number;
  avgFee: number;
  confidence: number;
}

export interface AIPrediction {
  time: string;
  polygons: AIPolygon[];
}

// 지도 관련 타입들
export interface HeatmapData {
  lat: number;
  lng: number;
  weight: number;
}

export interface HourlyPrediction {
  hour: number;
  expectedCalls: number;
  confidence: number;
}

// 공지사항 타입
export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'promotion' | 'notice' | 'incentive';
  priority: 'high' | 'medium' | 'low';
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// 수익 분석 타입들
export interface WeeklyStat {
  date: string;
  earnings: number;
  deliveries: number;
}

export interface DayOfWeekStat {
  day: string;
  avgEarnings: number;
  avgDeliveries: number;
}

export interface MonthlyAnalysis {
  currentMonth: {
    month: string;
    totalEarnings: number;
    totalDeliveries: number;
    workingDays: number;
    avgDailyEarnings: number;
    goalProgress: number;
    earningsBreakdown: {
      base: number;
      promo: number;
      tip: number;
    };
  };
  lastMonth: {
    month: string;
    totalEarnings: number;
    totalDeliveries: number;
    workingDays: number;
    avgDailyEarnings: number;
  };
  dayOfWeekStats: DayOfWeekStat[];
}

export type AIPredictionType = 'predictions' | 'heatmap' | 'hourly';

export type AIPredictionResponse<T extends AIPredictionType | undefined> = T extends 'predictions'
  ? ApiResponse<AIPrediction[]>
  : T extends 'heatmap'
  ? ApiResponse<HeatmapData[]>
  : T extends 'hourly'
  ? ApiResponse<HourlyPrediction[]>
  : ApiResponse<AIPrediction[]>;
