import { z } from 'zod';
import { BaseResponseSchema } from './common.dto';

// 주간 통계
export const WeeklyStatSchema = z.object({
  date: z.string(),
  earnings: z.number(),
  deliveries: z.number(),
});

// 월간 분석 - 수익 세부사항
export const EarningsBreakdownSchema = z.object({
  base: z.number(),
  promo: z.number(),
  tip: z.number(),
});

// 월간 분석 - 월별 데이터
export const MonthlyDataSchema = z.object({
  month: z.string(), // "YYYY-MM" 형식
  totalEarnings: z.number(),
  totalDeliveries: z.number(),
  workingDays: z.number(),
  avgDailyEarnings: z.number(),
  goalProgress: z.number().optional(), // 현재 월만 포함
  earningsBreakdown: EarningsBreakdownSchema.optional(), // 현재 월만 포함
});

// 요일별 통계
export const DayOfWeekStatSchema = z.object({
  day: z.string(), // "월", "화", etc.
  avgEarnings: z.number(),
  avgDeliveries: z.number(),
});

// 월간 분석
export const MonthlyAnalysisSchema = z.object({
  currentMonth: MonthlyDataSchema.extend({
    goalProgress: z.number(),
    earningsBreakdown: EarningsBreakdownSchema,
  }),
  lastMonth: MonthlyDataSchema,
  dayOfWeekStats: z.array(DayOfWeekStatSchema),
});

// 분석 조회 요청 (null 값을 허용하도록 수정)
export const GetAnalyticsRequestSchema = z.object({
  type: z.enum(['weekly', 'monthly']).nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});

// 주간 분석 응답
export const WeeklyAnalyticsResponseSchema = BaseResponseSchema.extend({
  data: z.array(WeeklyStatSchema),
});

// 월간 분석 응답
export const MonthlyAnalyticsResponseSchema = BaseResponseSchema.extend({
  data: MonthlyAnalysisSchema,
});

// 전체 분석 응답
export const AnalyticsResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    weekly: z.array(WeeklyStatSchema).optional(),
    monthly: MonthlyAnalysisSchema.optional(),
  }),
});

// 시간대별 분석 (추가)
export const HourlyAnalysisSchema = z.object({
  hour: z.number().min(0).max(23),
  avgEarnings: z.number(),
  avgDeliveries: z.number(),
  orderFrequency: z.number(), // 주문 빈도
});

// 지역별 분석 (추가)
export const AreaAnalysisSchema = z.object({
  area: z.string(),
  totalEarnings: z.number(),
  totalDeliveries: z.number(),
  avgEarningsPerDelivery: z.number(),
  avgDeliveryTime: z.number(),
});

// 성과 요약
export const PerformanceSummarySchema = z.object({
  period: z.string(), // "이번 주", "이번 달", etc.
  totalEarnings: z.number(),
  totalDeliveries: z.number(),
  avgRating: z.number(),
  acceptanceRate: z.number(),
  onTimeRate: z.number(),
  bestDay: z.object({
    date: z.string(),
    earnings: z.number(),
    deliveries: z.number(),
  }),
  improvements: z.array(
    z.object({
      metric: z.string(),
      change: z.number(), // 백분율 변화
      trend: z.enum(['up', 'down', 'stable']),
    }),
  ),
});

// 타입 내보내기
export type WeeklyStat = z.infer<typeof WeeklyStatSchema>;
export type EarningsBreakdown = z.infer<typeof EarningsBreakdownSchema>;
export type MonthlyData = z.infer<typeof MonthlyDataSchema>;
export type DayOfWeekStat = z.infer<typeof DayOfWeekStatSchema>;
export type MonthlyAnalysis = z.infer<typeof MonthlyAnalysisSchema>;
export type GetAnalyticsRequest = z.infer<typeof GetAnalyticsRequestSchema>;
export type WeeklyAnalyticsResponse = z.infer<typeof WeeklyAnalyticsResponseSchema>;
export type MonthlyAnalyticsResponse = z.infer<typeof MonthlyAnalyticsResponseSchema>;
export type AnalyticsResponse = z.infer<typeof AnalyticsResponseSchema>;
export type HourlyAnalysis = z.infer<typeof HourlyAnalysisSchema>;
export type AreaAnalysis = z.infer<typeof AreaAnalysisSchema>;
export type PerformanceSummary = z.infer<typeof PerformanceSummarySchema>;
