import { z } from 'zod';
import { VehicleType } from '@/app/generated/prisma';
import { BaseResponseSchema } from './common.dto';

// 라이더 프로필 스키마
export const RiderProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  dailyGoal: z.number(),
  monthlyGoal: z.number(),
  joinDate: z.string(), // ISO 날짜 문자열
  totalDeliveries: z.number(),
  averageRating: z.number(),
  acceptanceRate: z.number(),
  avgDeliveryTime: z.number(), // 분 단위
  preferredAreas: z.array(z.string()),
  vehicleType: z.nativeEnum(VehicleType),
  isOnline: z.boolean(),
  onlineTime: z.string(), // "HH:MM" 형식 또는 시간(분 단위)
});

// 플랫폼 평균 데이터
export const PlatformAveragesSchema = z.object({
  acceptanceRate: z.number(),
  avgDeliveryTime: z.number(),
  avgDailyEarnings: z.number(),
  avgMonthlyEarnings: z.number(),
  avgRating: z.number(),
  avgDeliveriesPerDay: z.number(),
});

// 라이더 성과 비교
export const RiderPerformanceComparisonSchema = z.object({
  rider: RiderProfileSchema,
  platformAverages: PlatformAveragesSchema,
  performanceRating: z.object({
    overall: z.enum(['below_average', 'average', 'above_average', 'excellent']),
    acceptanceRate: z.enum(['below_average', 'average', 'above_average', 'excellent']),
    deliveryTime: z.enum(['below_average', 'average', 'above_average', 'excellent']),
    rating: z.enum(['below_average', 'average', 'above_average', 'excellent']),
  }),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
});

// 라이더 랭킹 정보
export const RiderRankingSchema = z.object({
  currentRank: z.number(),
  totalRiders: z.number(),
  percentile: z.number(), // 상위 몇 퍼센트인지
  category: z.enum(['deliveries', 'earnings', 'rating', 'acceptance_rate']),
  thisMonth: z.object({
    rank: z.number(),
    change: z.number(), // 지난달 대비 순위 변화
  }),
  regional: z.object({
    rank: z.number(),
    region: z.string(),
    totalInRegion: z.number(),
  }),
});

// 라이더 배지/성취 시스템
export const RiderBadgeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  category: z.enum(['performance', 'milestone', 'consistency', 'special']),
  earnedAt: z.date(),
  level: z.enum(['bronze', 'silver', 'gold', 'platinum']).optional(),
});

// 온라인 상태 업데이트
export const UpdateOnlineStatusRequestSchema = z.object({
  isOnline: z.boolean(),
  location: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
});

// 목표 설정 요청
export const UpdateGoalsRequestSchema = z.object({
  dailyGoal: z.number().min(0).optional(),
  monthlyGoal: z.number().min(0).optional(),
});

// 라이더 프로필 응답들
export const RiderProfileResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    rider: RiderProfileSchema,
    platformAverages: PlatformAveragesSchema,
  }),
});

export const RiderPerformanceResponseSchema = BaseResponseSchema.extend({
  data: RiderPerformanceComparisonSchema,
});

export const RiderRankingResponseSchema = BaseResponseSchema.extend({
  data: z.array(RiderRankingSchema),
});

export const RiderBadgesResponseSchema = BaseResponseSchema.extend({
  data: z.array(RiderBadgeSchema),
});

// 실시간 통계 업데이트
export const RealTimeStatsSchema = z.object({
  totalEarningsToday: z.number(),
  deliveriesToday: z.number(),
  avgDeliveryTime: z.number(),
  currentStreak: z.number(),
  onlineTime: z.number(), // 분 단위
  lastDeliveryAt: z.date().optional(),
  estimatedDailyEarnings: z.number(), // 현재 페이스 기준 예상 수익
});

export const RealTimeStatsResponseSchema = BaseResponseSchema.extend({
  data: RealTimeStatsSchema,
});

// 타입 내보내기
export type RiderProfile = z.infer<typeof RiderProfileSchema>;
export type PlatformAverages = z.infer<typeof PlatformAveragesSchema>;
export type RiderPerformanceComparison = z.infer<typeof RiderPerformanceComparisonSchema>;
export type RiderRanking = z.infer<typeof RiderRankingSchema>;
export type RiderBadge = z.infer<typeof RiderBadgeSchema>;
export type UpdateOnlineStatusRequest = z.infer<typeof UpdateOnlineStatusRequestSchema>;
export type UpdateGoalsRequest = z.infer<typeof UpdateGoalsRequestSchema>;
export type RiderProfileResponse = z.infer<typeof RiderProfileResponseSchema>;
export type RiderPerformanceResponse = z.infer<typeof RiderPerformanceResponseSchema>;
export type RiderRankingResponse = z.infer<typeof RiderRankingResponseSchema>;
export type RiderBadgesResponse = z.infer<typeof RiderBadgesResponseSchema>;
export type RealTimeStats = z.infer<typeof RealTimeStatsSchema>;
export type RealTimeStatsResponse = z.infer<typeof RealTimeStatsResponseSchema>;
