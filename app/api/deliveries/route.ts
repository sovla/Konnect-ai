import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';
import { DeliveriesResponseSchema, GetDeliveriesRequestSchema } from '@/app/types/dto';
import { z } from 'zod';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // 요청 파라미터 검증 (null 값을 undefined로 변환)
    const queryParams = {
      date: searchParams.get('date') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      search: searchParams.get('search') || undefined,
    };

    const validatedParams = GetDeliveriesRequestSchema.parse(queryParams);

    // 라이더 프로필 조회
    const riderProfile = await prisma.riderProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!riderProfile) {
      // 라이더 프로필이 없는 경우 빈 데이터 반환 (404가 아님)
      const response = {
        success: true,
        data: [],
        total: 0,
        pagination: {
          page: 1,
          limit: 20,
          totalPages: 0,
          totalItems: 0,
          hasNext: false,
          hasPrev: false,
        },
        stats: {
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
      };

      return NextResponse.json(response);
    }

    // 기본 조건
    const whereClause: {
      riderId: string;
      date?: {
        gte: Date;
        lt: Date;
      };
      OR?: Array<{
        pickupAddress?: { contains: string; mode: 'insensitive' };
        dropoffAddress?: { contains: string; mode: 'insensitive' };
      }>;
    } = {
      riderId: riderProfile.id,
    };

    // 날짜 필터링
    if (validatedParams.date) {
      const targetDate = new Date(validatedParams.date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      whereClause.date = {
        gte: targetDate,
        lt: nextDay,
      };
    }

    // 검색 필터링 (출발지 또는 도착지 주소)
    if (validatedParams.search) {
      whereClause.OR = [
        { pickupAddress: { contains: validatedParams.search, mode: 'insensitive' } },
        { dropoffAddress: { contains: validatedParams.search, mode: 'insensitive' } },
      ];
    }

    // 페이지네이션 설정
    const page = validatedParams.page || 1;
    const limit = validatedParams.limit || 20;
    const offset = (page - 1) * limit;

    // 총 건수 조회 (통계용)
    const totalCount = await prisma.delivery.count({
      where: whereClause,
    });

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

    // 배달 내역 조회 (페이지네이션 적용)
    const deliveries = await prisma.delivery.findMany({
      where: whereClause,
      orderBy: { completedAt: 'desc' },
      skip: offset,
      take: limit,
      select: {
        id: true,
        date: true,
        completedAt: true,
        pickupAddress: true,
        pickupLat: true,
        pickupLng: true,
        dropoffAddress: true,
        dropoffLat: true,
        dropoffLng: true,
        baseEarnings: true,
        promoEarnings: true,
        tipEarnings: true,
        totalEarnings: true,
        rating: true,
        deliveryTime: true,
      },
    });

    // Mock API 형식에 맞게 데이터 변환
    const formattedDeliveries = deliveries.map((delivery) => ({
      id: delivery.id,
      date: delivery.date.toISOString().split('T')[0], // YYYY-MM-DD 형식
      completedAt: delivery.completedAt.toTimeString().slice(0, 5), // HH:MM 형식
      pickup: {
        address: delivery.pickupAddress,
        lat: delivery.pickupLat,
        lng: delivery.pickupLng,
      },
      dropoff: {
        address: delivery.dropoffAddress,
        lat: delivery.dropoffLat,
        lng: delivery.dropoffLng,
      },
      earnings: {
        base: delivery.baseEarnings,
        promo: delivery.promoEarnings,
        tip: delivery.tipEarnings,
        total: delivery.totalEarnings,
      },
      rating: delivery.rating,
      deliveryTime: delivery.deliveryTime,
    }));

    // 페이지네이션 정보
    const totalPages = Math.ceil(totalCount / limit);

    const response = {
      success: true,
      data: formattedDeliveries,
      total: totalCount,
      pagination: {
        page,
        limit,
        totalPages,
        totalItems: totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      // 통계 정보 추가
      stats: {
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
    };

    // dto 스키마로 응답 검증 (확장된 응답 구조)
    const extendedResponseSchema = DeliveriesResponseSchema.extend({
      stats: z
        .object({
          totalEarnings: z.number(),
          totalBaseEarnings: z.number(),
          totalPromoEarnings: z.number(),
          totalTipEarnings: z.number(),
          totalDeliveries: z.number(),
          avgEarningsPerDelivery: z.number(),
          avgRating: z.number(),
          avgDeliveryTime: z.number(),
          totalDeliveryTime: z.number(),
        })
        .optional(),
    });

    const validatedResponse = extendedResponseSchema.parse(response);

    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error('배달 내역 조회 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
