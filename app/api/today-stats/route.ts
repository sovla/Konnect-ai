import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';
import { TodayStatsResponseSchema } from '@/app/types/dto';
import { getCurrentDate, formatDate } from '@/app/utils/dateHelpers';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 라이더 프로필 조회
    const riderProfile = await prisma.riderProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!riderProfile) {
      return NextResponse.json({ error: '라이더 프로필을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 오늘 날짜 범위 설정 (dateHelpers 활용)
    const today = getCurrentDate();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // 오늘 배달 데이터 조회 및 통계 계산
    const todayDeliveries = await prisma.delivery.findMany({
      where: {
        riderId: riderProfile.id,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        totalEarnings: true,
        rating: true,
        deliveryTime: true,
      },
    });

    // 통계 계산
    const totalEarnings = todayDeliveries.reduce((sum, delivery) => sum + delivery.totalEarnings, 0);
    const completedDeliveries = todayDeliveries.length;
    const avgEarningsPerDelivery = completedDeliveries > 0 ? Math.round(totalEarnings / completedDeliveries) : 0;

    // 목표 달성률 계산 (라이더 프로필의 일일 목표 기준)
    const goalProgress =
      riderProfile.dailyGoal > 0 ? Math.round((totalEarnings / riderProfile.dailyGoal) * 100 * 10) / 10 : 0;

    // 수락률은 라이더 프로필에서 가져오기 (실시간 계산은 복잡하므로)
    const acceptanceRate = riderProfile.acceptanceRate;

    // 온라인 시간 계산 (단순화: 라이더 프로필의 onlineTime 사용)
    const onlineMinutes = riderProfile.onlineTime;
    const onlineHours = Math.floor(onlineMinutes / 60);
    const onlineMinutesRemainder = onlineMinutes % 60;
    const onlineTime = `${onlineHours.toString().padStart(2, '0')}:${onlineMinutesRemainder
      .toString()
      .padStart(2, '0')}:00`;

    // 현재 연속 성공 배달 수 (최근 배달들의 평점 4.0 이상)
    const recentDeliveries = await prisma.delivery.findMany({
      where: {
        riderId: riderProfile.id,
      },
      orderBy: { completedAt: 'desc' },
      take: 20, // 최근 20건 확인
      select: {
        rating: true,
      },
    });

    let currentStreak = 0;
    for (const delivery of recentDeliveries) {
      if (delivery.rating >= 4.0) {
        currentStreak++;
      } else {
        break;
      }
    }

    const todayStats = {
      date: formatDate(today), // YYYY-MM-DD 형식
      totalEarnings,
      completedDeliveries,
      onlineTime,
      goalProgress,
      avgEarningsPerDelivery,
      acceptanceRate,
      currentStreak,
    };

    const response = {
      success: true,
      data: todayStats,
    };

    // dto 스키마로 응답 검증
    const validatedResponse = TodayStatsResponseSchema.parse(response);

    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error('오늘 통계 조회 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
