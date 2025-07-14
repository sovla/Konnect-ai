import { z } from 'zod';
import { VehicleType, Theme, Language } from '@/app/generated/prisma';
import { BaseResponseSchema } from './common.dto';

// 사용자 프로필
export const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  emailVerified: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UpdateProfileRequestSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요.').max(50, '이름은 최대 50자까지 가능합니다.').optional(),
  email: z
    .string()
    .email('올바른 이메일 형식을 입력해주세요.')
    .max(255, '이메일은 최대 255자까지 가능합니다.')
    .optional(),
  phone: z
    .string()
    .regex(/^010-\d{4}-\d{4}$/, '올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)')
    .optional()
    .nullable(),
});

export const ProfileResponseSchema = BaseResponseSchema.extend({
  data: z
    .object({
      user: UserProfileSchema.extend({
        riderProfile: z
          .object({
            joinDate: z.date(),
            totalDeliveries: z.number(),
            averageRating: z.number(),
            acceptanceRate: z.number(),
            vehicleType: z.enum(VehicleType),
          })
          .optional(),
      }),
    })
    .optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;
export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;

// 라이더 설정
export const WorkingHoursSchema = z.object({
  start: z.number().min(0).max(23),
  end: z.number().min(0).max(23),
});

export const RiderProfileResponseSchema = z.object({
  id: z.string(),
  dailyGoal: z.number(),
  monthlyGoal: z.number(),
  preferredAreas: z.array(z.string()),
  vehicleType: z.enum(VehicleType),
  minOrderAmount: z.number(),
  workingHours: WorkingHoursSchema,
  maxDistance: z.number(),
  autoAccept: z.boolean(),
  pushNewOrder: z.boolean(),
  pushGoalAchieve: z.boolean(),
  pushPromotion: z.boolean(),
  emailSummary: z.boolean(),
  emailMarketing: z.boolean(),
});

export const RiderStatsResponseSchema = z.object({
  totalDeliveries: z.number(),
  totalEarnings: z.number(),
  averageRating: z.number(),
  acceptanceRate: z.number(),
  avgDeliveryTime: z.number(),
  onlineTime: z.number(),
  isOnline: z.boolean(),
});

export const UpdateRiderSettingsRequestSchema = z.object({
  dailyGoal: z.number().min(0).optional(),
  monthlyGoal: z.number().min(0).optional(),
  preferredAreas: z.array(z.string()).optional(),
  vehicleType: z.nativeEnum(VehicleType).optional(),
  minOrderAmount: z.number().min(0).optional(),
  workingHours: WorkingHoursSchema.optional(),
  maxDistance: z.number().min(1).max(50).optional(),
  autoAccept: z.boolean().optional(),
  pushNewOrder: z.boolean().optional(),
  pushGoalAchieve: z.boolean().optional(),
  pushPromotion: z.boolean().optional(),
  emailSummary: z.boolean().optional(),
  emailMarketing: z.boolean().optional(),
});

export const RiderSettingsResponseSchema = BaseResponseSchema.extend({
  data: z
    .object({
      riderProfile: RiderProfileResponseSchema,
      riderStats: RiderStatsResponseSchema,
    })
    .optional(),
});

export type WorkingHours = z.infer<typeof WorkingHoursSchema>;
export type RiderProfileResponse = z.infer<typeof RiderProfileResponseSchema>;
export type RiderStatsResponse = z.infer<typeof RiderStatsResponseSchema>;
export type UpdateRiderSettingsRequest = z.infer<typeof UpdateRiderSettingsRequestSchema>;
export type RiderSettingsResponse = z.infer<typeof RiderSettingsResponseSchema>;

// 앱 설정 (UserSettings)
export const UserSettingsSchema = z.object({
  id: z.string(),
  theme: z.nativeEnum(Theme),
  language: z.nativeEnum(Language),
  mapDefaultZoom: z.number().min(1).max(20),
  mapDefaultLat: z.number().min(-90).max(90),
  mapDefaultLng: z.number().min(-180).max(180),
  mapTrafficLayer: z.boolean(),
  mapTransitLayer: z.boolean(),
  privacyAccepted: z.boolean(),
  termsAccepted: z.boolean(),
  privacyDate: z.date().nullable(),
  termsDate: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UpdateUserSettingsRequestSchema = z.object({
  theme: z.nativeEnum(Theme).optional(),
  language: z.nativeEnum(Language).optional(),
  mapDefaultZoom: z.number().min(1).max(20).optional(),
  mapDefaultLat: z.number().min(-90).max(90).optional(),
  mapDefaultLng: z.number().min(-180).max(180).optional(),
  mapTrafficLayer: z.boolean().optional(),
  mapTransitLayer: z.boolean().optional(),
  privacyAccepted: z.boolean().optional(),
  termsAccepted: z.boolean().optional(),
});

export const UserSettingsResponseSchema = BaseResponseSchema.extend({
  data: z
    .object({
      userSettings: UserSettingsSchema,
    })
    .optional(),
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;
export type UpdateUserSettingsRequest = z.infer<typeof UpdateUserSettingsRequestSchema>;
export type UserSettingsResponse = z.infer<typeof UserSettingsResponseSchema>;

// 계정 삭제
export const DeleteAccountRequestSchema = z.object({
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
  confirmText: z.string().min(1, '확인 텍스트를 입력해주세요.'),
});

export const AccountStatsSchema = z.object({
  accountCreatedAt: z.date(),
  totalDeliveries: z.number(),
  deliveryRecords: z.number(),
  activeSessions: z.number(),
  connectedAccounts: z.number(),
  hasUserSettings: z.boolean(),
  dataToDelete: z.array(z.string()),
  warning: z.array(z.string()),
});

export const AccountResponseSchema = BaseResponseSchema.extend({
  data: z
    .object({
      stats: AccountStatsSchema,
    })
    .optional(),
});

export type DeleteAccountRequest = z.infer<typeof DeleteAccountRequestSchema>;
export type AccountStats = z.infer<typeof AccountStatsSchema>;
export type AccountResponse = z.infer<typeof AccountResponseSchema>;
