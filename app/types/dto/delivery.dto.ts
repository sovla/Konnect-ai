import { z } from 'zod';
import { BaseResponseSchema, AddressSchema, PaginationSchema } from './common.dto';

// 배달 수익 스키마
export const EarningsSchema = z.object({
  base: z.number().min(0),
  promo: z.number().min(0).default(0),
  tip: z.number().min(0).default(0),
  total: z.number().min(0),
});

// 배달 데이터 스키마
export const DeliverySchema = z.object({
  id: z.string(),
  date: z.string(),
  completedAt: z.string(),
  pickup: AddressSchema,
  dropoff: AddressSchema,
  earnings: EarningsSchema,
  rating: z.number().min(1).max(5),
  deliveryTime: z.number().min(0), // 분 단위
});

// 배달 통계 스키마
export const DeliveryStatsSchema = z.object({
  totalEarnings: z.number(),
  totalBaseEarnings: z.number(),
  totalPromoEarnings: z.number(),
  totalTipEarnings: z.number(),
  totalDeliveries: z.number(),
  avgEarningsPerDelivery: z.number(),
  avgRating: z.number(),
  avgDeliveryTime: z.number(),
  totalDeliveryTime: z.number(),
});

// 배달 조회 요청 (검색 기능 추가)
export const GetDeliveriesRequestSchema = z.object({
  date: z.string().nullable().optional(),
  limit: z.number().min(1).max(100).nullable().optional(),
  page: z.number().min(1).nullable().optional(),
  search: z.string().nullable().optional(), // 주소 검색용
});

// 배달 조회 응답 (통계 정보 추가)
export const DeliveriesResponseSchema = BaseResponseSchema.extend({
  data: z.array(DeliverySchema),
  total: z.number().optional(),
  pagination: PaginationSchema.optional(),
  stats: DeliveryStatsSchema.optional(), // 통계 정보 추가
});

// 오늘 통계
export const TodayStatsSchema = z.object({
  date: z.string(),
  totalEarnings: z.number(),
  completedDeliveries: z.number(),
  onlineTime: z.string(), // "HH:MM:SS" 형식
  goalProgress: z.number(), // 퍼센트
  avgEarningsPerDelivery: z.number(),
  acceptanceRate: z.number(),
  currentStreak: z.number(), // 연속 수락 횟수
});

export const TodayStatsResponseSchema = BaseResponseSchema.extend({
  data: TodayStatsSchema,
});

// 배달 생성 요청 (실제 배달 완료 시)
export const CreateDeliveryRequestSchema = z.object({
  pickupAddress: z.string(),
  pickupLat: z.number(),
  pickupLng: z.number(),
  dropoffAddress: z.string(),
  dropoffLat: z.number(),
  dropoffLng: z.number(),
  baseEarnings: z.number().min(0),
  promoEarnings: z.number().min(0).default(0),
  tipEarnings: z.number().min(0).default(0),
  rating: z.number().min(1).max(5),
  deliveryTime: z.number().min(0), // 분 단위
});

export const CreateDeliveryResponseSchema = BaseResponseSchema.extend({
  data: z
    .object({
      delivery: DeliverySchema,
    })
    .optional(),
});

// 타입 내보내기
export type Earnings = z.infer<typeof EarningsSchema>;
export type Delivery = z.infer<typeof DeliverySchema>;
export type DeliveryStats = z.infer<typeof DeliveryStatsSchema>;
export type GetDeliveriesRequest = z.infer<typeof GetDeliveriesRequestSchema>;
export type DeliveriesResponse = z.infer<typeof DeliveriesResponseSchema>;
export type TodayStats = z.infer<typeof TodayStatsSchema>;
export type TodayStatsResponse = z.infer<typeof TodayStatsResponseSchema>;
export type CreateDeliveryRequest = z.infer<typeof CreateDeliveryRequestSchema>;
export type CreateDeliveryResponse = z.infer<typeof CreateDeliveryResponseSchema>;
