import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';
import { RiderProfileResponseSchema } from '@/app/types/dto';

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

    // 온라인 시간을 HH:MM 형식으로 변환
    const onlineMinutes = riderProfile.onlineTime;
    const onlineHours = Math.floor(onlineMinutes / 60);
    const onlineMinutesRemainder = onlineMinutes % 60;
    const onlineTimeFormatted = `${onlineHours.toString().padStart(2, '0')}:${onlineMinutesRemainder
      .toString()
      .padStart(2, '0')}`;

    // Mock API 형식에 맞게 데이터 변환
    const riderData = {
      id: riderProfile.id,
      name: riderProfile.user.name,
      dailyGoal: riderProfile.dailyGoal,
      monthlyGoal: riderProfile.monthlyGoal,
      joinDate: riderProfile.joinDate.toISOString().split('T')[0], // YYYY-MM-DD 형식
      totalDeliveries: riderProfile.totalDeliveries,
      averageRating: riderProfile.averageRating,
      acceptanceRate: riderProfile.acceptanceRate,
      avgDeliveryTime: riderProfile.avgDeliveryTime,
      preferredAreas: riderProfile.preferredAreas,
      vehicleType: riderProfile.vehicleType.toLowerCase(),
      isOnline: riderProfile.isOnline,
      onlineTime: onlineTimeFormatted,
    };

    // 플랫폼 평균 데이터 조회 (최신 데이터)
    const platformStats = await prisma.platformStats.findFirst({
      orderBy: { date: 'desc' },
      select: {
        avgAcceptanceRate: true,
        avgDeliveryTime: true,
        avgDailyEarnings: true,
        avgMonthlyEarnings: true,
        avgRating: true,
        avgDeliveriesPerDay: true,
      },
    });

    // 플랫폼 평균 데이터가 없으면 기본값 사용
    const platformAverages = {
      acceptanceRate: platformStats?.avgAcceptanceRate || 92,
      avgDeliveryTime: platformStats?.avgDeliveryTime || 21,
      avgDailyEarnings: platformStats?.avgDailyEarnings || 120000,
      avgMonthlyEarnings: platformStats?.avgMonthlyEarnings || 3200000,
      avgRating: platformStats?.avgRating || 4.6,
      avgDeliveriesPerDay: platformStats?.avgDeliveriesPerDay || 28,
    };

    const response = {
      success: true,
      data: {
        rider: riderData,
        platformAverages: platformAverages,
      },
    };

    // dto 스키마로 응답 검증
    const validatedResponse = RiderProfileResponseSchema.parse(response);

    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error('라이더 프로필 조회 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
