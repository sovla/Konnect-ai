import { z } from 'zod';
import { VehicleType } from '@/app/generated/prisma';
import { BaseResponseSchema } from './common.dto';

// 로그인
export const LoginRequestSchema = z.object({
  email: z.string().email('올바른 이메일 형식을 입력해주세요.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});

export const LoginResponseSchema = BaseResponseSchema;

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// 회원가입
export const RegisterRequestSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요.').max(50, '이름은 최대 50자까지 가능합니다.'),
  email: z.string().email('올바른 이메일 형식을 입력해주세요.').max(255, '이메일은 최대 255자까지 가능합니다.'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
  phone: z
    .string()
    .regex(/^010-\d{4}-\d{4}$/, '올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)')
    .optional()
    .nullable(),
  vehicleType: z.nativeEnum(VehicleType).optional(),
});

export const RegisterResponseSchema = BaseResponseSchema.extend({
  data: z
    .object({
      user: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        phone: z.string().nullable(),
      }),
      riderProfile: z.object({
        id: z.string(),
        dailyGoal: z.number(),
        monthlyGoal: z.number(),
        vehicleType: z.nativeEnum(VehicleType),
      }),
    })
    .optional(),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

// 온보딩
export const OnboardingRequestSchema = z.object({
  preferredAreas: z.array(z.string()).min(1, '최소 하나의 선호 지역을 선택해주세요.'),
  vehicleType: z.enum(VehicleType, {
    error: '운송 수단을 선택해주세요.',
  }),
  dailyGoal: z.number().min(0).optional(),
});

export const OnboardingResponseSchema = BaseResponseSchema.extend({
  data: z
    .object({
      profile: z.object({
        id: z.string(),
        preferredAreas: z.array(z.string()),
        vehicleType: z.nativeEnum(VehicleType),
        dailyGoal: z.number(),
        monthlyGoal: z.number(),
      }),
    })
    .optional(),
});

export type OnboardingRequest = z.infer<typeof OnboardingRequestSchema>;
export type OnboardingResponse = z.infer<typeof OnboardingResponseSchema>;

// 비밀번호 재설정
export const ResetPasswordRequestSchema = z.object({
  email: z.string().email('올바른 이메일 형식을 입력해주세요.'),
});

export const ResetPasswordResponseSchema = BaseResponseSchema;

export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
export type ResetPasswordResponse = z.infer<typeof ResetPasswordResponseSchema>;

// 로그아웃
export const LogoutResponseSchema = BaseResponseSchema;

export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;
