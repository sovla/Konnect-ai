import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

// 배달 데이터 생성 요청 스키마
const BatchGenerateRequestSchema = z.object({
  riderId: z.string().optional(), // 특정 라이더, 없으면 모든 라이더
  count: z.number().min(1).max(100).default(10), // 생성할 데이터 개수
  startDate: z.string().optional(), // 시작 날짜 (YYYY-MM-DD)
  endDate: z.string().optional(), // 종료 날짜 (YYYY-MM-DD)
  dateRange: z.enum(['today', 'week', 'month']).optional(), // 날짜 범위
});

// 서울 지역 기반 주소 데이터
const SEOUL_ADDRESSES = [
  { address: '서울특별시 강남구 역삼동', lat: 37.5009, lng: 127.0368 },
  { address: '서울특별시 강남구 삼성동', lat: 37.514, lng: 127.0565 },
  { address: '서울특별시 강남구 청담동', lat: 37.5228, lng: 127.058 },
  { address: '서울특별시 서초구 서초동', lat: 37.4837, lng: 127.0324 },
  { address: '서울특별시 서초구 반포동', lat: 37.5048, lng: 127.0107 },
  { address: '서울특별시 마포구 홍대입구', lat: 37.5565, lng: 126.924 },
  { address: '서울특별시 마포구 합정동', lat: 37.5499, lng: 126.9135 },
  { address: '서울특별시 종로구 명동', lat: 37.5636, lng: 126.9827 },
  { address: '서울특별시 중구 을지로', lat: 37.5663, lng: 126.991 },
  { address: '서울특별시 용산구 한남동', lat: 37.5346, lng: 127.0023 },
  { address: '서울특별시 송파구 잠실동', lat: 37.5133, lng: 127.1028 },
  { address: '서울특별시 강동구 천호동', lat: 37.5407, lng: 127.124 },
  { address: '서울특별시 영등포구 여의도동', lat: 37.5219, lng: 126.9245 },
  { address: '서울특별시 구로구 구로동', lat: 37.4954, lng: 126.8872 },
  { address: '서울특별시 관악구 신림동', lat: 37.4841, lng: 126.9299 },
  { address: '서울특별시 동작구 사당동', lat: 37.4769, lng: 126.9813 },
  { address: '서울특별시 성동구 성수동', lat: 37.5446, lng: 127.0557 },
  { address: '서울특별시 광진구 건대입구', lat: 37.5401, lng: 127.0698 },
  { address: '서울특별시 성북구 정릉동', lat: 37.6066, lng: 127.011 },
  { address: '서울특별시 강북구 미아동', lat: 37.6027, lng: 127.0255 },
  { address: '서울특별시 도봉구 창동', lat: 37.6533, lng: 127.047 },
  { address: '서울특별시 노원구 상계동', lat: 37.6543, lng: 127.0658 },
  { address: '서울특별시 중랑구 면목동', lat: 37.5804, lng: 127.089 },
  { address: '서울특별시 동대문구 휘경동', lat: 37.5912, lng: 127.0463 },
  { address: '서울특별시 서대문구 홍제동', lat: 37.5859, lng: 126.9438 },
  { address: '서울특별시 은평구 응암동', lat: 37.6026, lng: 126.9154 },
  { address: '서울특별시 금천구 가산동', lat: 37.4814, lng: 126.8816 },
  { address: '서울특별시 양천구 목동', lat: 37.5267, lng: 126.8745 },
  { address: '서울특별시 강서구 화곡동', lat: 37.5415, lng: 126.8402 },
  { address: '서울특별시 구로구 신도림동', lat: 37.5084, lng: 126.891 },
];

// 부산 지역 기반 주소 데이터
const BUSAN_ADDRESSES = [
  // 해운대구
  { address: '부산광역시 해운대구 해운대해수욕장', lat: 35.1588, lng: 129.1603 },
  { address: '부산광역시 해운대구 센텀시티', lat: 35.1695, lng: 129.1312 },
  { address: '부산광역시 해운대구 좌동', lat: 35.1764, lng: 129.1748 },
  { address: '부산광역시 해운대구 반여동', lat: 35.1919, lng: 129.1264 },

  // 부산진구
  { address: '부산광역시 부산진구 서면', lat: 35.1579, lng: 129.0594 },
  { address: '부산광역시 부산진구 전포동', lat: 35.1545, lng: 129.0636 },
  { address: '부산광역시 부산진구 부전동', lat: 35.1634, lng: 129.06 },
  { address: '부산광역시 부산진구 양정동', lat: 35.1693, lng: 129.0351 },

  // 동래구
  { address: '부산광역시 동래구 온천동', lat: 35.2107, lng: 129.0835 },
  { address: '부산광역시 동래구 명륜동', lat: 35.2052, lng: 129.0817 },
  { address: '부산광역시 동래구 사직동', lat: 35.1949, lng: 129.0716 },
  { address: '부산광역시 동래구 수민동', lat: 35.2013, lng: 129.0927 },

  // 남구
  { address: '부산광역시 남구 경성대·부경대역', lat: 35.1372, lng: 129.1013 },
  { address: '부산광역시 남구 대연동', lat: 35.1357, lng: 129.0974 },
  { address: '부산광역시 남구 용호동', lat: 35.1261, lng: 129.1138 },
  { address: '부산광역시 남구 문현동', lat: 35.1398, lng: 129.084 },

  // 중구
  { address: '부산광역시 중구 국제시장', lat: 35.0986, lng: 129.0297 },
  { address: '부산광역시 중구 남포동', lat: 35.0971, lng: 129.0288 },
  { address: '부산광역시 중구 중앙동', lat: 35.1041, lng: 129.0364 },
  { address: '부산광역시 중구 영주동', lat: 35.1078, lng: 129.0353 },

  // 서구
  { address: '부산광역시 서구 부산역', lat: 35.1156, lng: 129.0405 },
  { address: '부산광역시 서구 아미동', lat: 35.1294, lng: 129.0194 },
  { address: '부산광역시 서구 토성동', lat: 35.119, lng: 129.0242 },
  { address: '부산광역시 서구 서대신동', lat: 35.1242, lng: 129.0153 },

  // 북구
  { address: '부산광역시 북구 화명동', lat: 35.2323, lng: 129.0109 },
  { address: '부산광역시 북구 구포동', lat: 35.2061, lng: 128.9951 },
  { address: '부산광역시 북구 덕천동', lat: 35.2143, lng: 129.0026 },
  { address: '부산광역시 북구 만덕동', lat: 35.2403, lng: 129.0285 },

  // 사하구
  { address: '부산광역시 사하구 하단동', lat: 35.1062, lng: 128.9687 },
  { address: '부산광역시 사하구 감천동', lat: 35.0974, lng: 129.0094 },
  { address: '부산광역시 사하구 괴정동', lat: 35.1274, lng: 128.9848 },
  { address: '부산광역시 사하구 당리동', lat: 35.1172, lng: 128.9736 },

  // 금정구
  { address: '부산광역시 금정구 부산대학교', lat: 35.2336, lng: 129.0834 },
  { address: '부산광역시 금정구 장전동', lat: 35.2307, lng: 129.0846 },
  { address: '부산광역시 금정구 금정산성', lat: 35.2462, lng: 129.0254 },
  { address: '부산광역시 금정구 부곡동', lat: 35.2169, lng: 129.0934 },

  // 강서구
  { address: '부산광역시 강서구 김해공항', lat: 35.1795, lng: 128.9384 },
  { address: '부산광역시 강서구 대저동', lat: 35.2116, lng: 128.981 },
  { address: '부산광역시 강서구 가락동', lat: 35.2089, lng: 128.9989 },
  { address: '부산광역시 강서구 명지동', lat: 35.1333, lng: 128.9214 },

  // 연제구
  { address: '부산광역시 연제구 연산동', lat: 35.1774, lng: 129.0796 },
  { address: '부산광역시 연제구 거제동', lat: 35.1883, lng: 129.0699 },
  { address: '부산광역시 연제구 연제동', lat: 35.1814, lng: 129.0747 },

  // 수영구
  { address: '부산광역시 수영구 광안리해수욕장', lat: 35.1532, lng: 129.1184 },
  { address: '부산광역시 수영구 민락동', lat: 35.1574, lng: 129.1275 },
  { address: '부산광역시 수영구 수영동', lat: 35.1613, lng: 129.1127 },
  { address: '부산광역시 수영구 망미동', lat: 35.1713, lng: 129.1033 },

  // 사상구
  { address: '부산광역시 사상구 주례동', lat: 35.1967, lng: 128.9931 },
  { address: '부산광역시 사상구 덕포동', lat: 35.1808, lng: 128.9835 },
  { address: '부산광역시 사상구 모라동', lat: 35.1913, lng: 128.9689 },
  { address: '부산광역시 사상구 삼락동', lat: 35.195, lng: 128.9582 },

  // 기장군
  { address: '부산광역시 기장군 일광해수욕장', lat: 35.2632, lng: 129.2339 },
  { address: '부산광역시 기장군 기장읍', lat: 35.2446, lng: 129.2224 },
  { address: '부산광역시 기장군 정관읍', lat: 35.3127, lng: 129.181 },
  { address: '부산광역시 기장군 장안읍', lat: 35.3224, lng: 129.2491 },

  // 영도구
  { address: '부산광역시 영도구 남항동', lat: 35.0729, lng: 129.0686 },
  { address: '부산광역시 영도구 영선동', lat: 35.0891, lng: 129.0679 },
  { address: '부산광역시 영도구 봉래동', lat: 35.0953, lng: 129.0368 },
  { address: '부산광역시 영도구 청학동', lat: 35.0596, lng: 129.0719 },

  // 동구
  { address: '부산광역시 동구 초량동', lat: 35.1182, lng: 129.035 },
  { address: '부산광역시 동구 범일동', lat: 35.1349, lng: 129.0588 },
  { address: '부산광역시 동구 수정동', lat: 35.1265, lng: 129.0423 },
  { address: '부산광역시 동구 좌천동', lat: 35.1314, lng: 129.0454 },
];

// 전체 주소 배열 (서울 + 부산)
const ALL_ADDRESSES = [...SEOUL_ADDRESSES, ...BUSAN_ADDRESSES];

// 랜덤 선택 함수
const randomChoice = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// 날짜 범위 내 랜덤 날짜 생성
const randomDateInRange = (startDate: Date, endDate: Date): Date => {
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime);
};

// 배달 시간 계산 (거리 기반)
const calculateDeliveryTime = (
  pickupLat: number,
  pickupLng: number,
  dropoffLat: number,
  dropoffLng: number,
): number => {
  // 간단한 거리 계산 (실제로는 지도 API 사용)
  const distance = Math.sqrt(Math.pow(pickupLat - dropoffLat, 2) + Math.pow(pickupLng - dropoffLng, 2));

  // 거리에 따른 배달 시간 (15분 ~ 45분)
  const baseTime = 15;
  const additionalTime = Math.min(distance * 10000, 30); // 최대 30분 추가
  return Math.round(baseTime + additionalTime);
};

// 배달 수익 계산
const calculateEarnings = (
  distance: number,
  timeOfDay: number,
): { base: number; promo: number; tip: number; total: number } => {
  // 기본료 계산 (3000원 ~ 8000원)
  const baseEarnings = Math.round(3000 + distance * 2000 + Math.random() * 2000);

  // 프로모션 수익 (피크 시간대 보너스)
  const isPeakTime = (timeOfDay >= 11 && timeOfDay <= 13) || (timeOfDay >= 17 && timeOfDay <= 21);
  const promoEarnings = isPeakTime ? Math.round(Math.random() * 2000) : 0;

  // 팁 수익 (20% 확률)
  const tipEarnings = Math.random() < 0.2 ? Math.round(Math.random() * 3000) : 0;

  const total = baseEarnings + promoEarnings + tipEarnings;

  return { base: baseEarnings, promo: promoEarnings, tip: tipEarnings, total };
};

// 배달 데이터 생성 함수
const generateDeliveryData = (riderId: string, targetDate: Date) => {
  const pickup = randomChoice(ALL_ADDRESSES);
  const dropoff = randomChoice(ALL_ADDRESSES);

  // 배달 완료 시간 (오전 9시 ~ 오후 10시)
  const completedAt = new Date(targetDate);
  completedAt.setHours(9 + Math.floor(Math.random() * 13), Math.floor(Math.random() * 60));

  const deliveryTime = calculateDeliveryTime(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
  const earnings = calculateEarnings(
    Math.sqrt(Math.pow(pickup.lat - dropoff.lat, 2) + Math.pow(pickup.lng - dropoff.lng, 2)),
    completedAt.getHours(),
  );

  // 평점 (4.0 ~ 5.0, 가중치로 4.5 이상이 더 많음)
  const rating = Math.random() < 0.8 ? 4.5 + Math.random() * 0.5 : 4.0 + Math.random() * 0.5;

  return {
    riderId,
    date: targetDate,
    completedAt,
    pickupAddress: pickup.address,
    pickupLat: pickup.lat,
    pickupLng: pickup.lng,
    dropoffAddress: dropoff.address,
    dropoffLat: dropoff.lat,
    dropoffLng: dropoff.lng,
    baseEarnings: earnings.base,
    promoEarnings: earnings.promo,
    tipEarnings: earnings.tip,
    totalEarnings: earnings.total,
    rating: Math.round(rating * 10) / 10,
    deliveryTime,
  };
};

// 날짜 범위 계산
const getDateRange = (dateRange?: string, startDate?: string, endDate?: string) => {
  if (startDate && endDate) {
    return {
      start: startOfDay(new Date(startDate)),
      end: endOfDay(new Date(endDate)),
    };
  }

  const today = new Date();

  switch (dateRange) {
    case 'today':
      return {
        start: startOfDay(today),
        end: endOfDay(today),
      };
    case 'week':
      return {
        start: startOfDay(subDays(today, 7)),
        end: endOfDay(today),
      };
    case 'month':
      return {
        start: startOfDay(subDays(today, 30)),
        end: endOfDay(today),
      };
    default:
      return {
        start: startOfDay(subDays(today, 7)),
        end: endOfDay(today),
      };
  }
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { riderId, count, startDate, endDate, dateRange } = BatchGenerateRequestSchema.parse(body);

    // 날짜 범위 계산
    const { start, end } = getDateRange(dateRange, startDate, endDate);

    // 라이더 목록 조회
    let targetRiders: string[] = [];

    if (riderId) {
      // 특정 라이더 지정
      const rider = await prisma.riderProfile.findUnique({
        where: { id: riderId },
      });

      if (!rider) {
        return NextResponse.json({ error: '라이더를 찾을 수 없습니다.' }, { status: 404 });
      }

      targetRiders = [riderId];
    } else {
      // 모든 라이더
      const riders = await prisma.riderProfile.findMany({
        select: { id: true },
      });

      targetRiders = riders.map((rider) => rider.id);
    }

    if (targetRiders.length === 0) {
      return NextResponse.json({ error: '대상 라이더가 없습니다.' }, { status: 400 });
    }

    // 배달 데이터 생성
    const deliveriesToCreate = [];

    for (const riderProfileId of targetRiders) {
      for (let i = 0; i < count; i++) {
        const randomDate = randomDateInRange(start, end);
        const deliveryData = generateDeliveryData(riderProfileId, randomDate);
        deliveriesToCreate.push(deliveryData);
      }
    }

    // 데이터베이스에 배달 데이터 저장
    const createdDeliveries = await prisma.delivery.createMany({
      data: deliveriesToCreate,
      skipDuplicates: true,
    });

    // 라이더 프로필 통계 업데이트
    for (const riderProfileId of targetRiders) {
      const riderDeliveries = await prisma.delivery.findMany({
        where: { riderId: riderProfileId },
        select: { rating: true },
      });

      const totalDeliveries = riderDeliveries.length;
      const averageRating =
        totalDeliveries > 0 ? riderDeliveries.reduce((sum, delivery) => sum + delivery.rating, 0) / totalDeliveries : 0;

      await prisma.riderProfile.update({
        where: { id: riderProfileId },
        data: {
          totalDeliveries,
          averageRating,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `${createdDeliveries.count}개의 배달 데이터가 생성되었습니다.`,
      data: {
        totalCreated: createdDeliveries.count,
        targetRiders: targetRiders.length,
        dateRange: {
          start: format(start, 'yyyy-MM-dd'),
          end: format(end, 'yyyy-MM-dd'),
        },
      },
    });
  } catch (error) {
    console.error('배달 데이터 생성 오류:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: '잘못된 요청 데이터입니다.', details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: '배달 데이터 생성에 실패했습니다.' }, { status: 500 });
  }
}
