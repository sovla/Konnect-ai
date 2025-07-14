import { NextResponse } from 'next/server';
import { DeliveriesResponseSchema, GetDeliveriesRequestSchema } from '@/app/types/dto';

// Mock 배달 내역 데이터
const deliveries = [
  {
    id: 'delivery-001',
    date: '2025-01-14',
    completedAt: '12:30',
    pickup: {
      address: '해운대구 우동',
      lat: 35.16,
      lng: 129.16,
    },
    dropoff: {
      address: '해운대구 좌동',
      lat: 35.17,
      lng: 129.17,
    },
    earnings: {
      base: 3500,
      promo: 500,
      tip: 0,
      total: 4000,
    },
    rating: 5,
    deliveryTime: 18,
  },
  {
    id: 'delivery-002',
    date: '2025-01-14',
    completedAt: '13:15',
    pickup: {
      address: '해운대구 재송동',
      lat: 35.18,
      lng: 129.12,
    },
    dropoff: {
      address: '해운대구 센텀시티',
      lat: 35.169,
      lng: 129.129,
    },
    earnings: {
      base: 4000,
      promo: 1000,
      tip: 2000,
      total: 7000,
    },
    rating: 5,
    deliveryTime: 25,
  },
  {
    id: 'delivery-003',
    date: '2025-01-14',
    completedAt: '14:45',
    pickup: {
      address: '부산진구 서면',
      lat: 35.158,
      lng: 129.059,
    },
    dropoff: {
      address: '부산진구 범천동',
      lat: 35.162,
      lng: 129.052,
    },
    earnings: {
      base: 3800,
      promo: 0,
      tip: 1000,
      total: 4800,
    },
    rating: 4,
    deliveryTime: 22,
  },
  {
    id: 'delivery-004',
    date: '2025-01-14',
    completedAt: '16:20',
    pickup: {
      address: '연제구 거제동',
      lat: 35.19,
      lng: 129.082,
    },
    dropoff: {
      address: '연제구 연산동',
      lat: 35.185,
      lng: 129.075,
    },
    earnings: {
      base: 3200,
      promo: 300,
      tip: 0,
      total: 3500,
    },
    rating: 5,
    deliveryTime: 15,
  },
  {
    id: 'delivery-005',
    date: '2025-01-14',
    completedAt: '18:30',
    pickup: {
      address: '수영구 망미동',
      lat: 35.155,
      lng: 129.115,
    },
    dropoff: {
      address: '수영구 수영동',
      lat: 35.145,
      lng: 129.112,
    },
    earnings: {
      base: 4200,
      promo: 800,
      tip: 1500,
      total: 6500,
    },
    rating: 5,
    deliveryTime: 20,
  },
  {
    id: 'delivery-006',
    date: '2025-01-13',
    completedAt: '11:45',
    pickup: {
      address: '해운대구 좌동',
      lat: 35.17,
      lng: 129.17,
    },
    dropoff: {
      address: '해운대구 우동',
      lat: 35.16,
      lng: 129.16,
    },
    earnings: {
      base: 3600,
      promo: 400,
      tip: 2000,
      total: 6000,
    },
    rating: 5,
    deliveryTime: 19,
  },
  {
    id: 'delivery-007',
    date: '2025-01-13',
    completedAt: '19:15',
    pickup: {
      address: '남구 대연동',
      lat: 35.135,
      lng: 129.095,
    },
    dropoff: {
      address: '남구 용호동',
      lat: 35.125,
      lng: 129.105,
    },
    earnings: {
      base: 4500,
      promo: 1200,
      tip: 0,
      total: 5700,
    },
    rating: 4,
    deliveryTime: 28,
  },
  {
    id: 'delivery-008',
    date: '2025-01-12',
    completedAt: '12:10',
    pickup: {
      address: '사상구 학장동',
      lat: 35.175,
      lng: 128.995,
    },
    dropoff: {
      address: '사상구 모라동',
      lat: 35.185,
      lng: 128.985,
    },
    earnings: {
      base: 3900,
      promo: 600,
      tip: 1000,
      total: 5500,
    },
    rating: 5,
    deliveryTime: 24,
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // 요청 파라미터 검증
  const queryParams = {
    date: searchParams.get('date'),
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
  };

  const validatedParams = GetDeliveriesRequestSchema.parse(queryParams);

  let filteredDeliveries = deliveries;

  // 날짜 필터링
  if (validatedParams.date) {
    filteredDeliveries = deliveries.filter((delivery) => delivery.date === validatedParams.date);
  }

  // 제한 수 적용
  if (validatedParams.limit) {
    filteredDeliveries = filteredDeliveries.slice(0, validatedParams.limit);
  }

  const response = {
    success: true,
    data: filteredDeliveries,
    total: filteredDeliveries.length,
  };

  // dto 스키마로 응답 검증
  const validatedResponse = DeliveriesResponseSchema.parse(response);

  return NextResponse.json(validatedResponse);
}
