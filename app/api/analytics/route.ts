import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';
import {
  WeeklyAnalyticsResponseSchema,
  MonthlyAnalyticsResponseSchema,
  AnalyticsResponseSchema,
  GetAnalyticsRequestSchema,
} from '@/app/types/dto';
import { getLast7Days, getThisMonthStart, getThisMonthEnd, formatDate } from '@/app/utils/dateHelpers';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // 요청 파라미터 검증
    const queryParams = {
      type: searchParams.get('type'),
    };

    const validatedParams = GetAnalyticsRequestSchema.parse(queryParams);

    // 라이더 프로필 조회
    const riderProfile = await prisma.riderProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!riderProfile) {
      return NextResponse.json({ error: '라이더 프로필을 찾을 수 없습니다.' }, { status: 404 });
    }

    switch (validatedParams.type) {
      case 'weekly': {
        // 지난 7일간의 데이터 조회 (dateHelpers 활용)
        const weekAgo = getLast7Days();

        const weeklyDeliveries = await prisma.delivery.findMany({
          where: {
            riderId: riderProfile.id,
            date: {
              gte: weekAgo,
            },
          },
          select: {
            date: true,
            totalEarnings: true,
          },
          orderBy: { date: 'asc' },
        });

        // 날짜별로 그룹화
        const dailyStats = new Map();

        weeklyDeliveries.forEach((delivery) => {
          const dateKey = formatDate(delivery.date);
          if (!dailyStats.has(dateKey)) {
            dailyStats.set(dateKey, { earnings: 0, deliveries: 0 });
          }
          const dayData = dailyStats.get(dateKey);
          dayData.earnings += delivery.totalEarnings;
          dayData.deliveries += 1;
        });

        // 지난 7일간 각 날짜별 데이터 생성 (dateHelpers 활용)
        const weeklyStats = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateKey = formatDate(date);
          const dayData = dailyStats.get(dateKey) || { earnings: 0, deliveries: 0 };

          weeklyStats.push({
            date: dateKey,
            earnings: dayData.earnings,
            deliveries: dayData.deliveries,
          });
        }

        const response = {
          success: true,
          data: weeklyStats,
        };
        const validatedResponse = WeeklyAnalyticsResponseSchema.parse(response);
        return NextResponse.json(validatedResponse);
      }

      case 'monthly': {
        // 현재 월과 지난 달 데이터 조회 (dateHelpers 활용)
        const currentMonth = getThisMonthStart();
        const nextMonth = getThisMonthEnd();
        nextMonth.setDate(nextMonth.getDate() + 1); // 다음 월 시작일
        const lastMonth = new Date(currentMonth);
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        // 현재 월 데이터
        const currentMonthDeliveries = await prisma.delivery.findMany({
          where: {
            riderId: riderProfile.id,
            date: {
              gte: currentMonth,
              lt: nextMonth,
            },
          },
          select: {
            baseEarnings: true,
            promoEarnings: true,
            tipEarnings: true,
            totalEarnings: true,
            date: true,
          },
        });

        // 지난 달 데이터
        const lastMonthDeliveries = await prisma.delivery.findMany({
          where: {
            riderId: riderProfile.id,
            date: {
              gte: lastMonth,
              lt: currentMonth,
            },
          },
          select: {
            totalEarnings: true,
            date: true,
          },
        });

        // 현재 월 통계 계산
        const currentMonthStats = {
          month: formatDate(currentMonth, 'yyyy-MM'),
          totalEarnings: currentMonthDeliveries.reduce((sum, d) => sum + d.totalEarnings, 0),
          totalDeliveries: currentMonthDeliveries.length,
          workingDays: new Set(currentMonthDeliveries.map((d) => formatDate(d.date))).size,
          avgDailyEarnings: 0,
          goalProgress: 0,
          earningsBreakdown: {
            base: currentMonthDeliveries.reduce((sum, d) => sum + d.baseEarnings, 0),
            promo: currentMonthDeliveries.reduce((sum, d) => sum + d.promoEarnings, 0),
            tip: currentMonthDeliveries.reduce((sum, d) => sum + d.tipEarnings, 0),
          },
        };

        currentMonthStats.avgDailyEarnings =
          currentMonthStats.workingDays > 0
            ? Math.round(currentMonthStats.totalEarnings / currentMonthStats.workingDays)
            : 0;

        currentMonthStats.goalProgress =
          riderProfile.monthlyGoal > 0
            ? Math.round((currentMonthStats.totalEarnings / riderProfile.monthlyGoal) * 100 * 10) / 10
            : 0;

        // 지난 달 통계 계산 (dateHelpers 활용)
        const lastMonthStats = {
          month: formatDate(lastMonth, 'yyyy-MM'),
          totalEarnings: lastMonthDeliveries.reduce((sum, d) => sum + d.totalEarnings, 0),
          totalDeliveries: lastMonthDeliveries.length,
          workingDays: new Set(lastMonthDeliveries.map((d) => formatDate(d.date))).size,
          avgDailyEarnings: 0,
        };

        lastMonthStats.avgDailyEarnings =
          lastMonthStats.workingDays > 0 ? Math.round(lastMonthStats.totalEarnings / lastMonthStats.workingDays) : 0;

        // 요일별 통계 (현재 월 기준)
        const dayOfWeekMap = new Map();
        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

        currentMonthDeliveries.forEach((delivery) => {
          const dayOfWeek = delivery.date.getDay();
          const dayName = dayNames[dayOfWeek];

          if (!dayOfWeekMap.has(dayName)) {
            dayOfWeekMap.set(dayName, { earnings: 0, deliveries: 0, count: 0 });
          }

          const dayData = dayOfWeekMap.get(dayName);
          dayData.earnings += delivery.totalEarnings;
          dayData.deliveries += 1;
        });

        // 요일별 평균 계산
        const dayOfWeekStats = dayNames.map((day) => {
          const dayData = dayOfWeekMap.get(day) || { earnings: 0, deliveries: 0, count: 0 };
          const dayCount = Math.max(1, Math.floor(currentMonthStats.workingDays / 7)); // 대략적인 요일별 일수

          return {
            day,
            avgEarnings: Math.round(dayData.earnings / dayCount),
            avgDeliveries: Math.round(dayData.deliveries / dayCount),
          };
        });

        const monthlyAnalysis = {
          currentMonth: currentMonthStats,
          lastMonth: lastMonthStats,
          dayOfWeekStats,
        };

        const response = {
          success: true,
          data: monthlyAnalysis,
        };
        const validatedResponse = MonthlyAnalyticsResponseSchema.parse(response);
        return NextResponse.json(validatedResponse);
      }

      default: {
        // 주간과 월간 데이터를 모두 조회하여 반환
        // 재귀 호출로 각각의 데이터를 가져온 후 합침
        const weeklyResponse = await GET(new Request(`${request.url}&type=weekly`));
        const monthlyResponse = await GET(new Request(`${request.url}&type=monthly`));

        const weeklyData = await weeklyResponse.json();
        const monthlyData = await monthlyResponse.json();

        const response = {
          success: true,
          data: {
            weekly: weeklyData.data,
            monthly: monthlyData.data,
          },
        };
        const validatedResponse = AnalyticsResponseSchema.parse(response);
        return NextResponse.json(validatedResponse);
      }
    }
  } catch (error) {
    console.error('분석 데이터 조회 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
