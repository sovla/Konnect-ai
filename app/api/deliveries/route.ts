import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';
import { DeliveriesResponseSchema, GetDeliveriesRequestSchema } from '@/app/types/dto';
import { z } from 'zod';
import { Prisma } from '@/app/generated/prisma';

// 확장된 요청 스키마 (기간 필터 추가, 날짜/검색 제거)
const ExtendedGetDeliveriesRequestSchema = GetDeliveriesRequestSchema.extend({
  cursor: z.string().optional(),
  includeStats: z.boolean().optional(),
  period: z.enum(['all', '7days', 'month']).optional(),
}).omit({ date: true, search: true });

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // 요청 파라미터 검증
    const queryParams = {
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      cursor: searchParams.get('cursor') || undefined,
      includeStats: searchParams.get('includeStats') === 'true',
      period: (searchParams.get('period') as 'all' | '7days' | 'month') || 'all',
    };

    const validatedParams = ExtendedGetDeliveriesRequestSchema.parse(queryParams);

    // 라이더 프로필 조회
    const riderProfile = await prisma.riderProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!riderProfile) {
      // 라이더 프로필이 없는 경우 빈 데이터 반환
      const response = {
        success: true,
        data: [],
        total: 0,
        pagination: { page: 1, limit: 20, totalPages: 0, totalItems: 0, hasNext: false, hasPrev: false },
        cursor: { nextCursor: null, hasNext: false },
        stats: validatedParams.includeStats
          ? {
              totalEarnings: 0,
              totalBaseEarnings: 0,
              totalPromoEarnings: 0,
              totalTipEarnings: 0,
              totalDeliveries: 0,
              avgEarningsPerDelivery: 0,
              avgRating: 0,
              avgDeliveryTime: 0,
              totalDeliveryTime: 0,
            }
          : undefined,
      };
      return NextResponse.json(response);
    }

    // Prisma Where 조건
    const whereClause: Prisma.DeliveryWhereInput = {
      riderId: riderProfile.id,
    };

    // 기간 필터링
    if (validatedParams.period && validatedParams.period !== 'all') {
      const now = new Date();
      let startDate: Date;

      if (validatedParams.period === '7days') {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
      } else {
        // 'month'
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      whereClause.date = {
        gte: startDate,
      };
    }

    // 커서 기반 페이지네이션
    if (validatedParams.cursor) {
      whereClause.completedAt = {
        lt: new Date(validatedParams.cursor),
      };
    }

    // 페이지네이션 설정
    const limit = validatedParams.limit || 20;
    const page = validatedParams.page || 1;
    const offset = (page - 1) * limit;

    // 통계 정보 조회 (요청 시에만)
    let stats = undefined;
    if (validatedParams.includeStats) {
      const statsAggregation = await prisma.delivery.aggregate({
        where: whereClause,
        _sum: { totalEarnings: true, baseEarnings: true, promoEarnings: true, tipEarnings: true, deliveryTime: true },
        _avg: { totalEarnings: true, rating: true, deliveryTime: true },
        _count: { _all: true },
      });

      stats = {
        totalEarnings: statsAggregation._sum?.totalEarnings || 0,
        totalBaseEarnings: statsAggregation._sum?.baseEarnings || 0,
        totalPromoEarnings: statsAggregation._sum?.promoEarnings || 0,
        totalTipEarnings: statsAggregation._sum?.tipEarnings || 0,
        totalDeliveries: statsAggregation._count?._all || 0,
        avgEarningsPerDelivery: Math.round(statsAggregation._avg?.totalEarnings || 0),
        avgRating: Number((statsAggregation._avg?.rating || 0).toFixed(1)),
        avgDeliveryTime: Math.round(statsAggregation._avg?.deliveryTime || 0),
        totalDeliveryTime: statsAggregation._sum?.deliveryTime || 0,
      };
    }

    // 배달 내역 조회
    const deliveries = await prisma.delivery.findMany({
      where: whereClause,
      orderBy: { completedAt: 'desc' },
      skip: validatedParams.cursor ? 0 : offset,
      take: limit + 1,
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

    const hasNext = deliveries.length > limit;
    const actualDeliveries = hasNext ? deliveries.slice(0, limit) : deliveries;
    const nextCursor =
      hasNext && actualDeliveries.length > 0
        ? actualDeliveries[actualDeliveries.length - 1].completedAt.toISOString()
        : null;

    const formattedDeliveries = actualDeliveries.map((delivery) => ({
      id: delivery.id,
      date: delivery.date.toISOString().split('T')[0],
      completedAt: delivery.completedAt.toTimeString().slice(0, 5),
      pickup: { address: delivery.pickupAddress, lat: delivery.pickupLat, lng: delivery.pickupLng },
      dropoff: { address: delivery.dropoffAddress, lat: delivery.dropoffLat, lng: delivery.dropoffLng },
      earnings: {
        base: delivery.baseEarnings,
        promo: delivery.promoEarnings,
        tip: delivery.tipEarnings,
        total: delivery.totalEarnings,
      },
      rating: delivery.rating,
      deliveryTime: delivery.deliveryTime,
    }));

    const totalCount = validatedParams.cursor ? 0 : await prisma.delivery.count({ where: whereClause });
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
        hasNext: validatedParams.cursor ? hasNext : page < totalPages,
        hasPrev: page > 1,
      },
      cursor: { nextCursor, hasNext },
      ...(stats && { stats }),
    };

    const extendedResponseSchema = DeliveriesResponseSchema.extend({
      cursor: z.object({ nextCursor: z.string().nullable(), hasNext: z.boolean() }),
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
