import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';

// 통계 기간 타입 정의
const StatsRequestSchema = z.object({
  period: z.enum(['all', '7days', 'month']).default('all'),
});

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = {
      period: searchParams.get('period') || 'all',
    };

    const validatedParams = StatsRequestSchema.parse(queryParams);

    // 라이더 프로필 조회
    const riderProfile = await prisma.riderProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!riderProfile) {
      // 라이더 프로필이 없는 경우 빈 통계 반환
      const response = {
        success: true,
        data: {
          totalEarnings: 0,
          totalBaseEarnings: 0,
          totalPromoEarnings: 0,
          totalTipEarnings: 0,
          totalDeliveries: 0,
          avgEarningsPerDelivery: 0,
          avgRating: 0,
          avgDeliveryTime: 0,
          totalDeliveryTime: 0,
        },
        period: validatedParams.period,
      };

      return NextResponse.json(response);
    }

    // 기간별 날짜 범위 설정
    const now = new Date();
    let startDate: Date | undefined;

    switch (validatedParams.period) {
      case '7days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'all':
      default:
        startDate = undefined;
        break;
    }

    // 기본 조건
    const whereClause: {
      riderId: string;
      date?: {
        gte: Date;
      };
    } = {
      riderId: riderProfile.id,
    };

    // 날짜 필터링
    if (startDate) {
      whereClause.date = {
        gte: startDate,
      };
    }

    // 통계 계산 (총 수익, 평균 등)
    const statsAggregation = await prisma.delivery.aggregate({
      where: whereClause,
      _sum: {
        totalEarnings: true,
        baseEarnings: true,
        promoEarnings: true,
        tipEarnings: true,
        deliveryTime: true,
      },
      _avg: {
        totalEarnings: true,
        rating: true,
        deliveryTime: true,
      },
      _count: {
        id: true,
      },
    });

    const response = {
      success: true,
      data: {
        totalEarnings: statsAggregation._sum.totalEarnings || 0,
        totalBaseEarnings: statsAggregation._sum.baseEarnings || 0,
        totalPromoEarnings: statsAggregation._sum.promoEarnings || 0,
        totalTipEarnings: statsAggregation._sum.tipEarnings || 0,
        totalDeliveries: statsAggregation._count.id || 0,
        avgEarningsPerDelivery: Math.round(statsAggregation._avg.totalEarnings || 0),
        avgRating: Number((statsAggregation._avg.rating || 0).toFixed(1)),
        avgDeliveryTime: Math.round(statsAggregation._avg.deliveryTime || 0),
        totalDeliveryTime: statsAggregation._sum.deliveryTime || 0,
      },
      period: validatedParams.period,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('배달 통계 조회 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
