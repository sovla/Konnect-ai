import { z } from 'zod';

// ============================================
// 기본 필드 스키마들 (재활용 가능)
// ============================================

// 이름 필드
export const nameSchema = z
  .string()
  .min(2, '이름은 최소 2자 이상이어야 합니다')
  .max(20, '이름은 최대 20자까지 입력 가능합니다')
  .regex(/^[가-힣a-zA-Z\s]+$/, '이름은 한글, 영문, 공백만 입력 가능합니다');

// 이메일 필드
export const emailSchema = z
  .string()
  .email('올바른 이메일 형식을 입력해주세요')
  .min(1, '이메일은 필수 입력 항목입니다');

// 전화번호 필드 (선택사항)
export const phoneSchema = z
  .string()
  .optional()
  .refine((val) => !val || /^010-\d{4}-\d{4}$/.test(val), '전화번호는 010-0000-0000 형식으로 입력해주세요');

// 전화번호 필드 (필수)
export const phoneRequiredSchema = z
  .string()
  .regex(/^010-\d{4}-\d{4}$/, '전화번호는 010-0000-0000 형식으로 입력해주세요');

// 비밀번호 필드 (8글자 제한만)
export const passwordSchema = z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다');

// 복잡한 비밀번호 (주석처리된 추가 제약조건들)
export const complexPasswordSchema = z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다');
// .regex(/(?=.*[a-z])/, '소문자를 포함해야 합니다')
// .regex(/(?=.*[A-Z])/, '대문자를 포함해야 합니다')
// .regex(/(?=.*\d)/, '숫자를 포함해야 합니다')
// .regex(/(?=.*[@$!%*?&])/, '특수문자(@$!%*?&)를 포함해야 합니다');

// 차량 타입
export const vehicleTypeSchema = z.enum(['MOTORCYCLE', 'BICYCLE', 'CAR']);

// ============================================
// 완성된 폼 스키마들
// ============================================

// 로그인 폼
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

// 회원가입 폼
export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요'),
    phone: phoneSchema,
    vehicleType: vehicleTypeSchema.optional(),
    agreeToTerms: z.boolean().refine((val) => val, '이용약관에 동의해주세요'),
    agreeToPrivacy: z.boolean().refine((val) => val, '개인정보처리방침에 동의해주세요'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

// 비밀번호 재설정 폼
export const resetPasswordSchema = z.object({
  email: emailSchema,
});

// 온보딩 폼
export const onboardingSchema = z.object({
  preferredAreas: z.array(z.string()).min(1, '최소 1개 이상의 지역을 선택해주세요'),
  vehicleType: vehicleTypeSchema,
  dailyGoal: z
    .number()
    .min(0, '일일 목표는 0원 이상이어야 합니다')
    .max(1000000, '일일 목표는 100만원을 초과할 수 없습니다'),
});

// 프로필 설정 폼
export const profileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
});

// 비밀번호 변경 폼
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

// 라이더 설정 폼
export const riderSettingsSchema = z.object({
  // 운행 목표
  dailyGoal: z
    .number()
    .min(0, '일일 목표는 0원 이상이어야 합니다')
    .max(1000000, '일일 목표는 100만원을 초과할 수 없습니다'),
  monthlyGoal: z
    .number()
    .min(0, '월간 목표는 0원 이상이어야 합니다')
    .max(30000000, '월간 목표는 3000만원을 초과할 수 없습니다'),

  // 운행 설정
  minOrderAmount: z
    .number()
    .min(0, '최소 주문 금액은 0원 이상이어야 합니다')
    .max(50000, '최소 주문 금액은 5만원을 초과할 수 없습니다'),
  maxDistance: z
    .number()
    .min(1, '최대 배달 거리는 최소 1km 이상이어야 합니다')
    .max(50, '최대 배달 거리는 50km를 초과할 수 없습니다'),
  workingHours: z
    .object({
      start: z.number().min(0).max(23),
      end: z.number().min(0).max(23),
    })
    .refine((data) => data.start < data.end, { message: '종료 시간은 시작 시간보다 늦어야 합니다' }),
  autoAccept: z.boolean(),

  // 알림 설정
  pushNewOrder: z.boolean(),
  pushGoalAchieve: z.boolean(),
  pushPromotion: z.boolean(),
  emailSummary: z.boolean(),
  emailMarketing: z.boolean(),
});

// 앱 설정 폼
export const appSettingsSchema = z.object({
  theme: z.enum(['LIGHT', 'DARK', 'SYSTEM']),
  language: z.enum(['KOREAN', 'ENGLISH']),
  mapDefaultZoom: z.number().min(8, '줌 레벨은 최소 8 이상이어야 합니다').max(18, '줌 레벨은 최대 18 이하여야 합니다'),
  mapDefaultLat: z.number().min(-90, '위도는 -90도 이상이어야 합니다').max(90, '위도는 90도 이하여야 합니다'),
  mapDefaultLng: z.number().min(-180, '경도는 -180도 이상이어야 합니다').max(180, '경도는 180도 이하여야 합니다'),
  mapTrafficLayer: z.boolean(),
  mapTransitLayer: z.boolean(),
});

// ============================================
// TypeScript 타입들 (자동 생성)
// ============================================

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type OnboardingFormData = z.infer<typeof onboardingSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
export type RiderSettingsFormData = z.infer<typeof riderSettingsSchema>;
export type AppSettingsFormData = z.infer<typeof appSettingsSchema>;
