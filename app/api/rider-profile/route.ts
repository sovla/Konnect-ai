import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';
import { RiderSettingsResponseSchema } from '@/app/types/dto/settings.dto';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 라이더 프로필과 사용자 정보 조회
    const riderProfile = await prisma.riderProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!riderProfile) {
      return NextResponse.json({ error: '라이더 프로필을 찾을 수 없습니다.' }, { status: 404 });
    }

    // workingHours JSON 파싱
    const workingHours =
      typeof riderProfile.workingHours === 'string' ? JSON.parse(riderProfile.workingHours) : riderProfile.workingHours;

    // settings.dto.ts의 RiderProfileResponseSchema에 맞게 데이터 변환
    const riderData = {
      id: riderProfile.id,
      dailyGoal: riderProfile.dailyGoal,
      monthlyGoal: riderProfile.monthlyGoal,
      preferredAreas: riderProfile.preferredAreas,
      vehicleType: riderProfile.vehicleType, // enum 그대로 사용
      minOrderAmount: riderProfile.minOrderAmount,
      workingHours: workingHours,
      maxDistance: riderProfile.maxDistance,
      autoAccept: riderProfile.autoAccept,
      pushNewOrder: riderProfile.pushNewOrder,
      pushGoalAchieve: riderProfile.pushGoalAchieve,
      pushPromotion: riderProfile.pushPromotion,
      emailSummary: riderProfile.emailSummary,
      emailMarketing: riderProfile.emailMarketing,
    };

    // 라이더 통계 데이터 (추가 정보)
    const riderStats = {
      totalDeliveries: riderProfile.totalDeliveries,
      totalEarnings: 0, // 실제로는 배달 데이터에서 계산해야 함
      averageRating: riderProfile.averageRating,
      acceptanceRate: riderProfile.acceptanceRate,
      avgDeliveryTime: riderProfile.avgDeliveryTime,
      onlineTime: riderProfile.onlineTime,
      isOnline: riderProfile.isOnline,
    };

    const response = {
      success: true,
      data: {
        riderProfile: riderData,
        riderStats: riderStats,
      },
    };

    // settings.dto.ts의 RiderSettingsResponseSchema로 검증
    const validatedResponse = RiderSettingsResponseSchema.parse(response);

    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error('라이더 프로필 조회 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
