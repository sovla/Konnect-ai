import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';
import { DeliveriesResponseSchema, GetDeliveriesRequestSchema } from '@/app/types/dto';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // 요청 파라미터 검증
    const queryParams = {
      date: searchParams.get('date'),
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
    };

    const validatedParams = GetDeliveriesRequestSchema.parse(queryParams);

    // 라이더 프로필 조회
    const riderProfile = await prisma.riderProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!riderProfile) {
      return NextResponse.json({ error: '라이더 프로필을 찾을 수 없습니다.' }, { status: 404 });
    }

    // DB에서 배달 내역 조회
    const whereClause: {
      riderId: string;
      date?: {
        gte: Date;
        lt: Date;
      };
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

    const deliveries = await prisma.delivery.findMany({
      where: whereClause,
      orderBy: { completedAt: 'desc' },
      take: validatedParams.limit || undefined,
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

    const response = {
      success: true,
      data: formattedDeliveries,
      total: formattedDeliveries.length,
    };

    // dto 스키마로 응답 검증
    const validatedResponse = DeliveriesResponseSchema.parse(response);

    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error('배달 내역 조회 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
