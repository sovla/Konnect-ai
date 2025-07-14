import { z } from 'zod';
import { AnnouncementType, Priority } from '@/app/generated/prisma';
import { BaseResponseSchema, PaginationSchema } from './common.dto';

// 공지사항 스키마
export const AnnouncementSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  type: z.nativeEnum(AnnouncementType),
  priority: z.nativeEnum(Priority),
  startDate: z.string(), // ISO 날짜 문자열
  endDate: z.string(), // ISO 날짜 문자열
  isActive: z.boolean(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// 공지사항 조회 요청
export const GetAnnouncementsRequestSchema = z.object({
  type: z.nativeEnum(AnnouncementType).optional(),
  active: z.boolean().optional(),
  priority: z.nativeEnum(Priority).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

// 공지사항 생성 요청
export const CreateAnnouncementRequestSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.').max(200, '제목은 최대 200자까지 가능합니다.'),
  content: z.string().min(1, '내용을 입력해주세요.').max(2000, '내용은 최대 2000자까지 가능합니다.'),
  type: z.nativeEnum(AnnouncementType),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  startDate: z.string().datetime('올바른 시작 날짜를 입력해주세요.'),
  endDate: z.string().datetime('올바른 종료 날짜를 입력해주세요.'),
  isActive: z.boolean().default(true),
});

// 공지사항 업데이트 요청
export const UpdateAnnouncementRequestSchema = CreateAnnouncementRequestSchema.partial();

// 공지사항 응답들
export const AnnouncementsResponseSchema = BaseResponseSchema.extend({
  data: z.array(AnnouncementSchema),
  pagination: PaginationSchema.omit({ page: true, limit: true }).optional(),
});

export const AnnouncementResponseSchema = BaseResponseSchema.extend({
  data: AnnouncementSchema.optional(),
});

// 공지사항 통계 (관리자용)
export const AnnouncementStatsSchema = z.object({
  total: z.number(),
  active: z.number(),
  inactive: z.number(),
  byType: z.record(z.nativeEnum(AnnouncementType), z.number()),
  byPriority: z.record(z.nativeEnum(Priority), z.number()),
  expiringSoon: z.number(), // 7일 이내 만료
});

export const AnnouncementStatsResponseSchema = BaseResponseSchema.extend({
  data: AnnouncementStatsSchema,
});

// 알림 읽음 처리 (사용자용)
export const MarkAnnouncementReadRequestSchema = z.object({
  announcementId: z.string(),
  userId: z.string(),
});

export const AnnouncementReadStatusSchema = z.object({
  announcementId: z.string(),
  userId: z.string(),
  readAt: z.date(),
});

// 사용자별 읽지 않은 공지사항 수
export const UnreadAnnouncementsCountResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    count: z.number(),
    announcements: z.array(AnnouncementSchema),
  }),
});

// 타입 내보내기
export type Announcement = z.infer<typeof AnnouncementSchema>;
export type GetAnnouncementsRequest = z.infer<typeof GetAnnouncementsRequestSchema>;
export type CreateAnnouncementRequest = z.infer<typeof CreateAnnouncementRequestSchema>;
export type UpdateAnnouncementRequest = z.infer<typeof UpdateAnnouncementRequestSchema>;
export type AnnouncementsResponse = z.infer<typeof AnnouncementsResponseSchema>;
export type AnnouncementResponse = z.infer<typeof AnnouncementResponseSchema>;
export type AnnouncementStats = z.infer<typeof AnnouncementStatsSchema>;
export type AnnouncementStatsResponse = z.infer<typeof AnnouncementStatsResponseSchema>;
export type MarkAnnouncementReadRequest = z.infer<typeof MarkAnnouncementReadRequestSchema>;
export type AnnouncementReadStatus = z.infer<typeof AnnouncementReadStatusSchema>;
export type UnreadAnnouncementsCountResponse = z.infer<typeof UnreadAnnouncementsCountResponseSchema>;
