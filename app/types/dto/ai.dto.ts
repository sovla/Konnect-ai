import { z } from 'zod';
import { BaseResponseSchema, CoordinateSchema } from './common.dto';

// AI 예측 이유 스키마
export const PredictionReasonSchema = z.object({
  type: z.enum(['historical_data', 'restaurant_density', 'time_pattern', 'event', 'weather', 'traffic']),
  title: z.string(),
  description: z.string(),
  impact: z.enum(['low', 'medium', 'high']),
  confidence: z.number().min(0).max(100),
});

// 예측 지역 (폴리곤) 스키마
export const PredictionPolygonSchema = z.object({
  name: z.string(),
  coords: z.array(z.array(z.number()).length(2)), // [lat, lng] 배열의 배열
  expectedCalls: z.number().min(0),
  avgFee: z.number().min(0),
  confidence: z.number().min(0).max(100),
  reasons: z.array(PredictionReasonSchema),
});

// AI 예측 데이터 스키마
export const AIPredictionSchema = z.object({
  time: z.string(), // "HH:MM" 형식
  polygons: z.array(PredictionPolygonSchema),
});

// 히트맵 포인트 스키마
export const HeatmapPointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  weight: z.number().min(0).max(1), // 0-1 사이의 가중치
  recentOrders: z.number().min(0),
  avgWaitTime: z.number().min(0), // 분 단위
  hourlyTrend: z.enum(['rising', 'stable', 'falling']),
});

// 시간별 예측 스키마
export const HourlyPredictionSchema = z.object({
  hour: z.number().min(0).max(23),
  expectedOrders: z.number().min(0),
  avgEarnings: z.number().min(0),
  busyAreas: z.array(z.string()),
  confidence: z.number().min(0).max(100),
  recommendation: z.string(),
});

// AI 존 스키마
export const AIZoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  coordinates: z.array(CoordinateSchema), // 폴리곤 좌표들
  expectedCalls: z.number(),
  avgFee: z.number(),
  confidence: z.number().min(0).max(100),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// AI 추천사항 스키마
export const AIRecommendationSchema = z.object({
  id: z.string(),
  type: z.enum(['move_to_zone', 'stay_current', 'take_break', 'increase_radius']),
  title: z.string(),
  description: z.string(),
  impact: z.enum(['low', 'medium', 'high']),
  confidence: z.number().min(0).max(100),
  priority: z.enum(['low', 'medium', 'high']),
  validUntil: z.date(),
  actionRequired: z.boolean(),
});

// AI 예측 조회 요청
export const GetAIPredictionsRequestSchema = z.object({
  type: z.enum(['predictions', 'heatmap', 'hourly']).optional(),
  time: z.string().optional(), // "HH:MM" 형식
  area: z.string().optional(), // 특정 지역 필터
});

// AI 예측 응답들
export const AIPredictionsResponseSchema = BaseResponseSchema.extend({
  data: z.array(AIPredictionSchema),
});

export const HeatmapResponseSchema = BaseResponseSchema.extend({
  data: z.array(HeatmapPointSchema),
});

export const HourlyPredictionsResponseSchema = BaseResponseSchema.extend({
  data: z.array(HourlyPredictionSchema),
});

export const AIRecommendationsResponseSchema = BaseResponseSchema.extend({
  data: z.array(AIRecommendationSchema),
});

// 통합 AI 데이터 응답
export const AIDataResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    predictions: z.array(AIPredictionSchema).optional(),
    heatmap: z.array(HeatmapPointSchema).optional(),
    hourly: z.array(HourlyPredictionSchema).optional(),
    recommendations: z.array(AIRecommendationSchema).optional(),
  }),
});

// 타입 내보내기
export type PredictionReason = z.infer<typeof PredictionReasonSchema>;
export type PredictionPolygon = z.infer<typeof PredictionPolygonSchema>;
export type AIPrediction = z.infer<typeof AIPredictionSchema>;
export type HeatmapPoint = z.infer<typeof HeatmapPointSchema>;
export type HourlyPrediction = z.infer<typeof HourlyPredictionSchema>;
export type AIZone = z.infer<typeof AIZoneSchema>;
export type AIRecommendation = z.infer<typeof AIRecommendationSchema>;
export type GetAIPredictionsRequest = z.infer<typeof GetAIPredictionsRequestSchema>;
export type AIPredictionsResponse = z.infer<typeof AIPredictionsResponseSchema>;
export type HeatmapResponse = z.infer<typeof HeatmapResponseSchema>;
export type HourlyPredictionsResponse = z.infer<typeof HourlyPredictionsResponseSchema>;
export type AIRecommendationsResponse = z.infer<typeof AIRecommendationsResponseSchema>;
export type AIDataResponse = z.infer<typeof AIDataResponseSchema>;
