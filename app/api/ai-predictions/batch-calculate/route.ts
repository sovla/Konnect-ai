import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { RecommendationType, Impact } from '@/app/generated/prisma';
import { convertCoordinatesToAddress, analyzeAreaCharacteristics } from '@/app/utils/geminiUtils';

// 배달 기록을 기반으로 AI 존 데이터 계산 및 업데이트
async function calculateAndUpdateAIZones(targetDate: Date) {
  const thirtyDaysAgo = new Date(targetDate);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 부산 지역 경계 (대략적인 범위)
  const BUSAN_BOUNDS = {
    latMin: 35.0,
    latMax: 35.4,
    lngMin: 128.9,
    lngMax: 129.3,
  };

  // 지난 30일간의 배달 데이터 조회 (부산 지역 한정)
  const deliveries = await prisma.delivery.findMany({
    where: {
      date: {
        gte: thirtyDaysAgo,
        lte: targetDate,
      },
      pickupLat: {
        gte: BUSAN_BOUNDS.latMin,
        lte: BUSAN_BOUNDS.latMax,
      },
      pickupLng: {
        gte: BUSAN_BOUNDS.lngMin,
        lte: BUSAN_BOUNDS.lngMax,
      },
    },
    select: {
      pickupLat: true,
      pickupLng: true,
      totalEarnings: true,
      deliveryTime: true,
      completedAt: true,
      rating: true,
    },
  });

  // 지역별 그룹화 (0.005도 단위로 더 세밀하게)
  const areaStats = new Map<
    string,
    {
      lat: number;
      lng: number;
      orderCount: number;
      totalEarnings: number;
      totalDeliveryTime: number;
      avgRating: number;
    }
  >();

  deliveries.forEach((delivery) => {
    const lat = Math.round(delivery.pickupLat / 0.005) * 0.005;
    const lng = Math.round(delivery.pickupLng / 0.005) * 0.005;
    const areaKey = `${lat},${lng}`;

    if (!areaStats.has(areaKey)) {
      areaStats.set(areaKey, {
        lat,
        lng,
        orderCount: 0,
        totalEarnings: 0,
        totalDeliveryTime: 0,
        avgRating: 0,
      });
    }

    const stats = areaStats.get(areaKey)!;
    stats.orderCount += 1;
    stats.totalEarnings += delivery.totalEarnings;
    stats.totalDeliveryTime += delivery.deliveryTime;
    stats.avgRating += delivery.rating;
  });

  // 최소 10건 이상의 배달이 있는 지역만 AI 존으로 생성
  const significantAreas = Array.from(areaStats.entries())
    .filter(([, stats]) => stats.orderCount >= 10)
    .sort(([, a], [, b]) => b.totalEarnings - a.totalEarnings)
    .slice(0, 20); // 상위 20개 지역만 선택

  let updatedCount = 0;

  for (const [, stats] of significantAreas) {
    const avgEarnings = stats.totalEarnings / stats.orderCount;
    const avgDeliveryTime = stats.totalDeliveryTime / stats.orderCount;
    const avgRating = stats.avgRating / stats.orderCount;

    // 신뢰도 계산 (주문 건수, 평균 평점, 배달 시간을 고려)
    const confidence = Math.min(
      0.95,
      Math.max(0.3, stats.orderCount * 0.01 + avgRating * 0.15 + (avgDeliveryTime < 20 ? 0.1 : 0.05)),
    );

    // 폴리곤 좌표 생성 (사각형 영역)
    const radius = 0.0025; // 약 250m 반경
    const coordinates = [
      [stats.lat - radius, stats.lng - radius],
      [stats.lat + radius, stats.lng - radius],
      [stats.lat + radius, stats.lng + radius],
      [stats.lat - radius, stats.lng + radius],
      [stats.lat - radius, stats.lng - radius], // 폴리곤 닫기
    ];

    // Gemini를 활용한 지역명 변환
    let zoneName = `고수익 지역 ${stats.lat.toFixed(3)},${stats.lng.toFixed(3)}`;
    try {
      const addressName = await convertCoordinatesToAddress(stats.lat, stats.lng);
      zoneName = `${addressName} 고수익 지역`;
    } catch (error) {
      console.warn('주소 변환 실패, 기본 이름 사용:', error);
    }

    // 기존 AI 존 업데이트 또는 새로 생성
    const existingZone = await prisma.aIZone.findFirst({
      where: {
        name: {
          contains: `${stats.lat.toFixed(3)},${stats.lng.toFixed(3)}`,
        },
      },
    });

    if (existingZone) {
      await prisma.aIZone.update({
        where: { id: existingZone.id },
        data: {
          name: zoneName, // 업데이트된 지역명 사용
          expectedCalls: Math.round(stats.orderCount / 30), // 일일 평균
          avgFee: Math.round(avgEarnings),
          confidence,
          isActive: true,
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.aIZone.create({
        data: {
          name: zoneName, // Gemini로 변환된 지역명 사용
          coordinates: coordinates,
          expectedCalls: Math.round(stats.orderCount / 30),
          avgFee: Math.round(avgEarnings),
          confidence,
          isActive: true,
        },
      });
    }

    updatedCount++;
  }

  return updatedCount;
}

// 시간대별 AI 존 예측 데이터 계산
async function calculateAndStoreHourlyPredictions(targetDate: Date) {
  const thirtyDaysAgo = new Date(targetDate);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 부산 지역 경계 (대략적인 범위)
  const BUSAN_BOUNDS = {
    latMin: 35.0,
    latMax: 35.4,
    lngMin: 128.9,
    lngMax: 129.3,
  };

  // 활성 AI 존들 조회
  const aiZones = await prisma.aIZone.findMany({
    where: { isActive: true },
  });

  if (aiZones.length === 0) {
    return 0;
  }

  // 지난 30일간의 배달 데이터를 시간대별로 분석 (부산 지역 한정)
  const deliveries = await prisma.delivery.findMany({
    where: {
      date: {
        gte: thirtyDaysAgo,
        lte: targetDate,
      },
      pickupLat: {
        gte: BUSAN_BOUNDS.latMin,
        lte: BUSAN_BOUNDS.latMax,
      },
      pickupLng: {
        gte: BUSAN_BOUNDS.lngMin,
        lte: BUSAN_BOUNDS.lngMax,
      },
    },
    select: {
      pickupLat: true,
      pickupLng: true,
      completedAt: true,
      totalEarnings: true,
    },
  });

  let totalPredictions = 0;

  for (const zone of aiZones) {
    const zoneCoords = zone.coordinates as number[][];
    const zoneCenterLat = zoneCoords.reduce((sum, coord) => sum + coord[0], 0) / zoneCoords.length;
    const zoneCenterLng = zoneCoords.reduce((sum, coord) => sum + coord[1], 0) / zoneCoords.length;

    // 시간대별 통계 계산
    const hourlyStats = new Map<number, { count: number; totalEarnings: number }>();

    deliveries.forEach((delivery) => {
      // 간단한 거리 계산으로 존 내부 판단 (실제로는 더 정교한 polygon 내부 판단 필요)
      const distance = Math.sqrt(
        Math.pow(delivery.pickupLat - zoneCenterLat, 2) + Math.pow(delivery.pickupLng - zoneCenterLng, 2),
      );

      if (distance <= 0.005) {
        // 약 500m 반경
        const hour = new Date(delivery.completedAt).getHours();

        if (!hourlyStats.has(hour)) {
          hourlyStats.set(hour, { count: 0, totalEarnings: 0 });
        }

        const stats = hourlyStats.get(hour)!;
        stats.count += 1;
        stats.totalEarnings += delivery.totalEarnings;
      }
    });

    // 기존 예측 데이터 삭제
    await prisma.aIZonePrediction.deleteMany({
      where: {
        zoneId: zone.id,
        predictionDate: {
          gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
          lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1),
        },
      },
    });

    // 시간대별 예측 데이터 생성
    const predictions = Array.from(hourlyStats.entries()).map(([hour, stats]) => {
      const avgOrdersPerHour = stats.count / 30; // 30일 평균
      const confidence = Math.min(0.95, Math.max(0.2, stats.count * 0.01));

      return {
        zoneId: zone.id,
        hour,
        expectedCalls: Math.round(avgOrdersPerHour),
        confidence,
        predictionDate: targetDate,
      };
    });

    if (predictions.length > 0) {
      await prisma.aIZonePrediction.createMany({
        data: predictions,
      });
      totalPredictions += predictions.length;
    }
  }

  return totalPredictions;
}

// 히트맵 데이터 계산 및 업데이트
async function calculateAndUpdateHeatmapData(targetDate: Date) {
  const sevenDaysAgo = new Date(targetDate);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 30);

  // 부산 지역 경계 (대략적인 범위)
  const BUSAN_BOUNDS = {
    latMin: 35.0,
    latMax: 35.4,
    lngMin: 128.9,
    lngMax: 129.3,
  };

  // 최근 7일간의 배달 데이터 조회 (부산 지역 한정)
  const deliveries = await prisma.delivery.findMany({
    where: {
      date: {
        gte: sevenDaysAgo,
        lte: targetDate,
      },
      pickupLat: {
        gte: BUSAN_BOUNDS.latMin,
        lte: BUSAN_BOUNDS.latMax,
      },
      pickupLng: {
        gte: BUSAN_BOUNDS.lngMin,
        lte: BUSAN_BOUNDS.lngMax,
      },
    },
    select: {
      pickupLat: true,
      pickupLng: true,
      deliveryTime: true,
      completedAt: true,
    },
  });

  // 히트맵 포인트 그룹화 (0.002도 단위로 세밀하게)
  const heatmapStats = new Map<
    string,
    {
      lat: number;
      lng: number;
      orderCount: number;
      totalDeliveryTime: number;
      hourlyOrders: number[];
    }
  >();

  deliveries.forEach((delivery) => {
    const lat = Math.round(delivery.pickupLat / 0.002) * 0.002;
    const lng = Math.round(delivery.pickupLng / 0.002) * 0.002;
    const pointKey = `${lat},${lng}`;
    const hour = new Date(delivery.completedAt).getHours();

    if (!heatmapStats.has(pointKey)) {
      heatmapStats.set(pointKey, {
        lat,
        lng,
        orderCount: 0,
        totalDeliveryTime: 0,
        hourlyOrders: new Array(24).fill(0),
      });
    }

    const stats = heatmapStats.get(pointKey)!;
    stats.orderCount += 1;
    stats.totalDeliveryTime += delivery.deliveryTime;
    stats.hourlyOrders[hour] += 1;
  });

  // 기존 히트맵 데이터 삭제
  await prisma.heatmapPoint.deleteMany({
    where: {
      timestamp: {
        gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
        lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1),
      },
    },
  });

  // 최소 3건 이상의 주문이 있는 포인트만 저장
  const significantPoints = Array.from(heatmapStats.entries())
    .filter(([, stats]) => stats.orderCount >= 3)
    .sort(([, a], [, b]) => b.orderCount - a.orderCount)
    .slice(0, 500); // 상위 500개 포인트만 선택

  const heatmapData = significantPoints.map(([, stats]) => {
    const weight = Math.min(1, stats.orderCount / 20); // 최대 가중치 1
    const avgWaitTime = Math.round(stats.totalDeliveryTime / stats.orderCount);

    // 시간대별 트렌드 계산
    const currentHour = new Date().getHours();
    const prevHour = currentHour > 0 ? currentHour - 1 : 23;

    const currentOrders = stats.hourlyOrders[currentHour];
    const prevOrders = stats.hourlyOrders[prevHour];

    let hourlyTrend = '안정';
    if (currentOrders > prevOrders * 1.2) {
      hourlyTrend = '증가';
    } else if (currentOrders < prevOrders * 0.8) {
      hourlyTrend = '감소';
    }

    return {
      lat: stats.lat,
      lng: stats.lng,
      weight,
      recentOrders: stats.orderCount,
      avgWaitTime,
      hourlyTrend,
      timestamp: targetDate,
    };
  });

  if (heatmapData.length > 0) {
    await prisma.heatmapPoint.createMany({
      data: heatmapData,
    });
  }

  return heatmapData.length;
}

// AI 추천 생성 및 저장
async function generateAndStoreAIRecommendations(targetDate: Date) {
  // 활성 AI 존들과 예측 데이터 조회
  const aiZones = await prisma.aIZone.findMany({
    where: { isActive: true },
    include: {
      predictions: {
        where: {
          predictionDate: {
            gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
            lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1),
          },
        },
      },
    },
    orderBy: { avgFee: 'desc' },
  });

  // 기존 추천 삭제
  await prisma.aIRecommendation.deleteMany({
    where: {
      createdAt: {
        gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
        lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1),
      },
    },
  });

  const recommendations = [];
  const currentHour = new Date().getHours();

  // 시간대별 추천 생성
  for (const zone of aiZones.slice(0, 5)) {
    // 상위 5개 존만 처리
    const hourlyPrediction = zone.predictions.find((p) => p.hour === currentHour);
    const nextHourPrediction = zone.predictions.find((p) => p.hour === (currentHour + 1) % 24);

    if (hourlyPrediction && hourlyPrediction.expectedCalls > 3) {
      const expectedCalls = hourlyPrediction.expectedCalls;

      // Gemini를 활용한 지역 특성 분석
      let description = `현재 시간대에 평균 ${expectedCalls}건의 주문이 예상됩니다. 건당 평균 ${zone.avgFee.toLocaleString()}원`;
      try {
        const zoneCoords = zone.coordinates as number[][];
        const zoneCenterLat = zoneCoords.reduce((sum, coord) => sum + coord[0], 0) / zoneCoords.length;
        const zoneCenterLng = zoneCoords.reduce((sum, coord) => sum + coord[1], 0) / zoneCoords.length;

        const analysis = await analyzeAreaCharacteristics(zoneCenterLat, zoneCenterLng, {
          avgEarnings: zone.avgFee,
          avgDeliveryTime: 20, // 기본값
          orderCount: expectedCalls,
          timePattern: `${currentHour}시 활성화`,
        });

        if (analysis && analysis.length > 0) {
          description = `${description}\n\n${analysis}`;
        }
      } catch (error) {
        console.warn('지역 분석 실패:', error);
      }

      recommendations.push({
        zoneId: zone.id,
        type: RecommendationType.HISTORICAL_DATA,
        title: `${zone.name} 지역 추천`,
        description,
        impact: expectedCalls > 8 ? Impact.HIGH : expectedCalls > 5 ? Impact.MEDIUM : Impact.LOW,
        confidence: hourlyPrediction.confidence,
      });
    }

    if (nextHourPrediction && nextHourPrediction.expectedCalls > (hourlyPrediction?.expectedCalls || 0)) {
      recommendations.push({
        zoneId: zone.id,
        type: RecommendationType.TIME_PATTERN,
        title: `${zone.name} 지역 다음 시간 추천`,
        description: `다음 시간대(${currentHour + 1}시)에 주문량이 증가할 것으로 예상됩니다. 미리 이동하세요!`,
        impact: Impact.MEDIUM,
        confidence: nextHourPrediction.confidence,
      });
    }
  }

  // 일반적인 패턴 기반 추천
  const currentTimeRecommendations = [
    {
      type: RecommendationType.TIME_PATTERN,
      title: '점심시간 추천',
      description: '11:30-13:30 시간대에는 오피스 밀집 지역을 추천합니다.',
      impact: Impact.HIGH,
      condition: () => currentHour >= 11 && currentHour <= 13,
    },
    {
      type: RecommendationType.TIME_PATTERN,
      title: '저녁시간 추천',
      description: '18:00-20:00 시간대에는 주거 밀집 지역을 추천합니다.',
      impact: Impact.HIGH,
      condition: () => currentHour >= 18 && currentHour <= 20,
    },
    {
      type: RecommendationType.TIME_PATTERN,
      title: '야간시간 추천',
      description: '22:00-01:00 시간대에는 유흥가 근처를 추천합니다.',
      impact: Impact.MEDIUM,
      condition: () => currentHour >= 22 || currentHour <= 1,
    },
  ];

  for (const rec of currentTimeRecommendations) {
    if (rec.condition()) {
      const bestZone = aiZones[0]; // 가장 수익성 높은 존
      if (bestZone) {
        recommendations.push({
          zoneId: bestZone.id,
          type: rec.type,
          title: rec.title,
          description: rec.description,
          impact: rec.impact,
          confidence: 0.8,
        });
      }
    }
  }

  // 추천 데이터 저장
  if (recommendations.length > 0) {
    await prisma.aIRecommendation.createMany({
      data: recommendations,
    });
  }

  return recommendations.length;
}

export async function POST(request: Request) {
  try {
    const { date } = await request.json();
    // 최근 한달간 데이터를 전부 처리 하도록 개선
    const endDate = date ? new Date(date) : new Date();

    endDate.setHours(0, 0, 0, 0);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);

    const results = [];

    while (startDate.getTime() < endDate.getTime()) {
      const targetDate = new Date(startDate);
      targetDate.setHours(0, 0, 0, 0);

      console.log(`AI 추천 배치 계산 시작: ${targetDate.toISOString()}`);

      // 병렬로 배치 계산 실행
      const [aiZoneCount, hourlyPredictions, heatmapPoints, recommendations] = await Promise.all([
        calculateAndUpdateAIZones(targetDate),
        calculateAndStoreHourlyPredictions(targetDate),
        calculateAndUpdateHeatmapData(targetDate),
        generateAndStoreAIRecommendations(targetDate),
      ]);

      console.log(
        `AI 추천 배치 계산 완료: AI존 ${aiZoneCount}개, 시간별 예측 ${hourlyPredictions}건, 히트맵 ${heatmapPoints}개, 추천 ${recommendations}건`,
      );

      results.push({
        date: targetDate.toISOString(),
        aiZoneCount,
        hourlyPredictions,
        heatmapPoints,
        recommendations,
      });
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('AI 추천 배치 계산 오류:', error);
    return NextResponse.json({ error: 'AI 추천 배치 계산 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 매일 자동 실행을 위한 GET 엔드포인트 (cron job용)
export async function GET() {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const [aiZoneCount, hourlyPredictions, heatmapPoints, recommendations] = await Promise.all([
      calculateAndUpdateAIZones(yesterday),
      calculateAndStoreHourlyPredictions(yesterday),
      calculateAndUpdateHeatmapData(yesterday),
      generateAndStoreAIRecommendations(yesterday),
    ]);

    return NextResponse.json({
      success: true,
      message: '일일 AI 추천 배치 계산이 완료되었습니다.',
      data: {
        date: yesterday.toISOString(),
        aiZones: aiZoneCount,
        hourlyPredictions,
        heatmapPoints,
        recommendations,
      },
    });
  } catch (error) {
    console.error('일일 AI 추천 배치 계산 오류:', error);
    return NextResponse.json({ error: '일일 AI 추천 배치 계산 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
