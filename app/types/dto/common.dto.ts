import { z } from 'zod';

// 공통 응답 스키마
export const BaseResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
});

export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  total: z.number().optional(),
});

export const DateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// 공통 타입들
export type BaseResponse = z.infer<typeof BaseResponseSchema>;

export type Pagination = z.infer<typeof PaginationSchema>;

export type DateRange = z.infer<typeof DateRangeSchema>;

// API 응답 래퍼
export interface ApiResponse<T = unknown> extends BaseResponse {
  data?: T;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 좌표 스키마
export const CoordinateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export type Coordinate = z.infer<typeof CoordinateSchema>;

// 주소 스키마
export const AddressSchema = z.object({
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
});

export type Address = z.infer<typeof AddressSchema>;
