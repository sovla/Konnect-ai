import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';
import { VehicleType } from '@/app/generated/prisma';
import { z } from 'zod';

// zod 스키마 정의
const WorkingHoursSchema = z.object({
  start: z.number().min(0).max(23),
  end: z.number().min(0).max(23),
});

const UpdateRiderSettingsSchema = z.object({
  // 기본 목표 설정
  dailyGoal: z.number().min(0).optional(),
  monthlyGoal: z.number().min(0).optional(),

  // 운행 관련 설정
  preferredAreas: z.array(z.string()).optional(),
  vehicleType: z.nativeEnum(VehicleType).optional(),
  minOrderAmount: z.number().min(0).optional(),
  workingHours: WorkingHoursSchema.optional(),
  maxDistance: z.number().min(1).max(50).optional(),
  autoAccept: z.boolean().optional(),

  // 알림 설정
  pushNewOrder: z.boolean().optional(),
  pushGoalAchieve: z.boolean().optional(),
  pushPromotion: z.boolean().optional(),
  emailSummary: z.boolean().optional(),
  emailMarketing: z.boolean().optional(),
});

// API 응답 타입 정의
export interface RiderProfileResponse {
  id: string;
  dailyGoal: number;
  monthlyGoal: number;
  preferredAreas: string[];
  vehicleType: VehicleType;
  minOrderAmount: number;
  workingHours: { start: number; end: number };
  maxDistance: number;
  autoAccept: boolean;
  pushNewOrder: boolean;
  pushGoalAchieve: boolean;
  pushPromotion: boolean;
  emailSummary: boolean;
  emailMarketing: boolean;
}

export interface RiderStatsResponse {
  totalDeliveries: number;
  totalEarnings: number;
  averageRating: number;
  acceptanceRate: number;
  avgDeliveryTime: number;
  onlineTime: number;
  isOnline: boolean;
}

export interface GetRiderSettingsResponse {
  riderProfile: RiderProfileResponse;
  riderStats: RiderStatsResponse;
  message: string;
}

// GET /api/settings/rider - 라이더 설정 조회
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 라이더 프로필 조회
    const riderProfile = await prisma.riderProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        dailyGoal: true,
        monthlyGoal: true,
        preferredAreas: true,
        vehicleType: true,
        minOrderAmount: true,
        workingHours: true,
        maxDistance: true,
        autoAccept: true,
        pushNewOrder: true,
        pushGoalAchieve: true,
        pushPromotion: true,
        emailSummary: true,
        emailMarketing: true,
        // 통계 정보
        totalDeliveries: true,
        averageRating: true,
        acceptanceRate: true,
        avgDeliveryTime: true,
        onlineTime: true,
        isOnline: true,
      },
    });

    if (!riderProfile) {
      return Response.json({ error: '라이더 프로필을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 총 수익 계산 (모든 배달의 totalEarnings 합계)
    const earningsAggregation = await prisma.delivery.aggregate({
      where: { riderId: riderProfile.id },
      _sum: {
        totalEarnings: true,
      },
    });

    const totalEarnings = earningsAggregation._sum.totalEarnings || 0;

    // 응답 데이터 구성
    const responseData: GetRiderSettingsResponse = {
      riderProfile: {
        id: riderProfile.id,
        dailyGoal: riderProfile.dailyGoal,
        monthlyGoal: riderProfile.monthlyGoal,
        preferredAreas: riderProfile.preferredAreas,
        vehicleType: riderProfile.vehicleType,
        minOrderAmount: riderProfile.minOrderAmount,
        workingHours: riderProfile.workingHours as { start: number; end: number },
        maxDistance: riderProfile.maxDistance,
        autoAccept: riderProfile.autoAccept,
        pushNewOrder: riderProfile.pushNewOrder,
        pushGoalAchieve: riderProfile.pushGoalAchieve,
        pushPromotion: riderProfile.pushPromotion,
        emailSummary: riderProfile.emailSummary,
        emailMarketing: riderProfile.emailMarketing,
      },
      riderStats: {
        totalDeliveries: riderProfile.totalDeliveries,
        totalEarnings,
        averageRating: riderProfile.averageRating,
        acceptanceRate: riderProfile.acceptanceRate,
        avgDeliveryTime: riderProfile.avgDeliveryTime,
        onlineTime: riderProfile.onlineTime,
        isOnline: riderProfile.isOnline,
      },
      message: '라이더 설정을 조회했습니다.',
    };

    return Response.json(responseData);
  } catch (error) {
    console.error('라이더 설정 조회 실패:', error);
    return Response.json({ error: '라이더 설정 조회에 실패했습니다.' }, { status: 500 });
  }
}

// PUT /api/settings/rider - 라이더 설정 업데이트
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();

    // zod validation
    const validationResult = UpdateRiderSettingsSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        {
          error: '잘못된 요청 데이터입니다.',
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const {
      dailyGoal,
      monthlyGoal,
      preferredAreas,
      vehicleType,
      minOrderAmount,
      workingHours,
      maxDistance,
      autoAccept,
      pushNewOrder,
      pushGoalAchieve,
      pushPromotion,
      emailSummary,
      emailMarketing,
    } = validationResult.data;

    // 라이더 프로필 조회
    const existingProfile = await prisma.riderProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!existingProfile) {
      return Response.json({ error: '라이더 프로필을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 업데이트할 데이터 준비
    const updateData: Partial<{
      dailyGoal: number;
      monthlyGoal: number;
      preferredAreas: string[];
      vehicleType: VehicleType;
      minOrderAmount: number;
      workingHours: { start: number; end: number };
      maxDistance: number;
      autoAccept: boolean;
      pushNewOrder: boolean;
      pushGoalAchieve: boolean;
      pushPromotion: boolean;
      emailSummary: boolean;
      emailMarketing: boolean;
    }> = {};

    // 각 필드별로 업데이트 데이터 설정
    if (dailyGoal !== undefined) updateData.dailyGoal = dailyGoal;
    if (monthlyGoal !== undefined) updateData.monthlyGoal = monthlyGoal;
    if (preferredAreas !== undefined) updateData.preferredAreas = preferredAreas;
    if (vehicleType !== undefined) updateData.vehicleType = vehicleType;
    if (minOrderAmount !== undefined) updateData.minOrderAmount = minOrderAmount;
    if (workingHours !== undefined) updateData.workingHours = workingHours;
    if (maxDistance !== undefined) updateData.maxDistance = maxDistance;
    if (autoAccept !== undefined) updateData.autoAccept = autoAccept;
    if (pushNewOrder !== undefined) updateData.pushNewOrder = pushNewOrder;
    if (pushGoalAchieve !== undefined) updateData.pushGoalAchieve = pushGoalAchieve;
    if (pushPromotion !== undefined) updateData.pushPromotion = pushPromotion;
    if (emailSummary !== undefined) updateData.emailSummary = emailSummary;
    if (emailMarketing !== undefined) updateData.emailMarketing = emailMarketing;

    // 라이더 프로필 업데이트
    const updatedProfile = await prisma.riderProfile.update({
      where: { userId: session.user.id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        dailyGoal: true,
        monthlyGoal: true,
        preferredAreas: true,
        vehicleType: true,
        minOrderAmount: true,
        workingHours: true,
        maxDistance: true,
        autoAccept: true,
        pushNewOrder: true,
        pushGoalAchieve: true,
        pushPromotion: true,
        emailSummary: true,
        emailMarketing: true,
        updatedAt: true,
      },
    });

    return Response.json({
      riderProfile: updatedProfile,
      message: '라이더 설정이 업데이트되었습니다.',
    });
  } catch (error) {
    console.error('라이더 설정 업데이트 실패:', error);
    return Response.json({ error: '라이더 설정 업데이트에 실패했습니다.' }, { status: 500 });
  }
}
