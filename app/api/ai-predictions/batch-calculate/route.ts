import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { RecommendationType, Impact } from '@/app/generated/prisma';
import { convertCoordinatesToAddress } from '@/app/utils/geminiUtils';

// 부산 지역 경계 상수
const BUSAN_BOUNDS = {
  latMin: 35.0,
  latMax: 35.4,
  lngMin: 128.9,
  lngMax: 129.3,
};

// 배달 데이터 타입 정의
interface DeliveryData {
  pickupLat: number;
  pickupLng: number;
  totalEarnings: number;
  deliveryTime: number;
  completedAt: Date;
  rating: number;
}

// 이미 계산된 데이터 확인 함수
async function checkIfDataExists(targetDate: Date) {
  const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const [aiZoneCount, predictionCount, heatmapCount, recommendationCount] = await Promise.all([
    prisma.aIZone.count({
      where: {
        updatedAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    }),
    prisma.aIZonePrediction.count({
      where: {
        predictionDate: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    }),
    prisma.heatmapPoint.count({
      where: {
        timestamp: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    }),
    prisma.aIRecommendation.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    }),
  ]);

  return {
    hasAIZones: aiZoneCount > 0,
    hasPredictions: predictionCount > 0,
    hasHeatmap: heatmapCount > 0,
    hasRecommendations: recommendationCount > 0,
  };
}

// 최적화된 배달 데이터 조회 함수
async function getDeliveryData(startDate: Date, endDate: Date) {
  return await prisma.delivery.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
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
}

// 배달 기록을 기반으로 AI 존 데이터 계산 및 업데이트
async function calculateAndUpdateAIZones(targetDate: Date, deliveries: DeliveryData[]) {
  // 지역별 그룹화 (0.005도 단위)
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

  // 최소 10건 이상의 배달이 있는 지역만 선택 (상위 15개로 줄임)
  const significantAreas = Array.from(areaStats.entries())
    .filter(([, stats]) => stats.orderCount >= 10)
    .sort(([, a], [, b]) => b.totalEarnings - a.totalEarnings)
    .slice(0, 15);

  let updatedCount = 0;

  // 기존 AI 존들을 한 번에 조회
  const existingZones = await prisma.aIZone.findMany({
    select: { id: true, name: true },
  });

  const existingZoneMap = new Map(existingZones.map((zone) => [zone.name, zone.id]));

  const zonesToUpdate = [];
  const zonesToCreate = [];

  for (const [, stats] of significantAreas) {
    const avgEarnings = stats.totalEarnings / stats.orderCount;
    const avgDeliveryTime = stats.totalDeliveryTime / stats.orderCount;
    const avgRating = stats.avgRating / stats.orderCount;

    const confidence = Math.min(
      0.95,
      Math.max(0.3, stats.orderCount * 0.01 + avgRating * 0.15 + (avgDeliveryTime < 20 ? 0.1 : 0.05)),
    );

    const radius = 0.0025;
    const coordinates = [
      [stats.lat - radius, stats.lng - radius],
      [stats.lat + radius, stats.lng - radius],
      [stats.lat + radius, stats.lng + radius],
      [stats.lat - radius, stats.lng + radius],
      [stats.lat - radius, stats.lng - radius],
    ];

    const zoneKey = `${stats.lat.toFixed(3)},${stats.lng.toFixed(3)}`;
    let zoneName = `고수익 지역 ${zoneKey}`;

    // Gemini API 호출 최소화 (상위 5개 지역만)
    const areaIndex = significantAreas.findIndex(([, s]) => s === stats);
    if (areaIndex < 5) {
      try {
        const addressName = await convertCoordinatesToAddress(stats.lat, stats.lng);
        zoneName = `${addressName} 고수익 지역`;
      } catch {
        // 에러 시 기본 이름 사용
      }
    }

    const zoneData = {
      name: zoneName,
      coordinates,
      expectedCalls: Math.round(stats.orderCount / 30),
      avgFee: Math.round(avgEarnings),
      confidence,
      isActive: true,
    };

    // 기존 존 확인
    const existingZoneId = Array.from(existingZoneMap.keys()).find((name) => name.includes(zoneKey));

    if (existingZoneId) {
      zonesToUpdate.push({
        id: existingZoneMap.get(existingZoneId)!,
        data: { ...zoneData, updatedAt: new Date() },
      });
    } else {
      zonesToCreate.push(zoneData);
    }
  }

  // 배치 업데이트/생성
  if (zonesToUpdate.length > 0) {
    await Promise.all(
      zonesToUpdate.map((zone) =>
        prisma.aIZone.update({
          where: { id: zone.id },
          data: zone.data,
        }),
      ),
    );
    updatedCount += zonesToUpdate.length;
  }

  if (zonesToCreate.length > 0) {
    await prisma.aIZone.createMany({
      data: zonesToCreate,
    });
    updatedCount += zonesToCreate.length;
  }

  return updatedCount;
}

// 시간대별 AI 존 예측 데이터 계산 (단순화)
async function calculateAndStoreHourlyPredictions(targetDate: Date, deliveries: DeliveryData[]) {
  const aiZones = await prisma.aIZone.findMany({
    where: { isActive: true },
    select: { id: true, coordinates: true },
  });

  if (aiZones.length === 0) return 0;

  // 기존 예측 데이터 삭제
  const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  await prisma.aIZonePrediction.deleteMany({
    where: {
      predictionDate: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  });

  const allPredictions = [];

  for (const zone of aiZones) {
    const zoneCoords = zone.coordinates as number[][];
    const zoneCenterLat = zoneCoords.reduce((sum, coord) => sum + coord[0], 0) / zoneCoords.length;
    const zoneCenterLng = zoneCoords.reduce((sum, coord) => sum + coord[1], 0) / zoneCoords.length;

    const hourlyStats = new Map<number, number>();

    deliveries.forEach((delivery) => {
      const distance = Math.sqrt(
        Math.pow(delivery.pickupLat - zoneCenterLat, 2) + Math.pow(delivery.pickupLng - zoneCenterLng, 2),
      );

      if (distance <= 0.005) {
        const hour = new Date(delivery.completedAt).getHours();
        hourlyStats.set(hour, (hourlyStats.get(hour) || 0) + 1);
      }
    });

    const predictions = Array.from(hourlyStats.entries())
      .filter(([, count]) => count >= 3) // 최소 3건 이상만
      .map(([hour, count]) => ({
        zoneId: zone.id,
        hour,
        expectedCalls: Math.round(count / 30),
        confidence: Math.min(0.95, Math.max(0.2, count * 0.01)),
        predictionDate: targetDate,
      }));

    allPredictions.push(...predictions);
  }

  if (allPredictions.length > 0) {
    await prisma.aIZonePrediction.createMany({
      data: allPredictions,
    });
  }

  return allPredictions.length;
}

// 히트맵 데이터 계산 및 업데이트 (단순화)
async function calculateAndUpdateHeatmapData(targetDate: Date) {
  const sevenDaysAgo = new Date(targetDate);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

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

  const heatmapStats = new Map<
    string,
    {
      lat: number;
      lng: number;
      orderCount: number;
      totalDeliveryTime: number;
    }
  >();

  deliveries.forEach((delivery) => {
    const lat = Math.round(delivery.pickupLat / 0.003) * 0.003;
    const lng = Math.round(delivery.pickupLng / 0.003) * 0.003;
    const pointKey = `${lat},${lng}`;

    if (!heatmapStats.has(pointKey)) {
      heatmapStats.set(pointKey, {
        lat,
        lng,
        orderCount: 0,
        totalDeliveryTime: 0,
      });
    }

    const stats = heatmapStats.get(pointKey)!;
    stats.orderCount += 1;
    stats.totalDeliveryTime += delivery.deliveryTime;
  });

  // 기존 히트맵 데이터 삭제
  const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  await prisma.heatmapPoint.deleteMany({
    where: {
      timestamp: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  });

  const heatmapData = Array.from(heatmapStats.entries())
    .filter(([, stats]) => stats.orderCount >= 5)
    .sort(([, a], [, b]) => b.orderCount - a.orderCount)
    .slice(0, 200)
    .map(([, stats]) => ({
      lat: stats.lat,
      lng: stats.lng,
      weight: Math.min(1, stats.orderCount / 15),
      recentOrders: stats.orderCount,
      avgWaitTime: Math.round(stats.totalDeliveryTime / stats.orderCount),
      hourlyTrend: '안정',
      timestamp: targetDate,
    }));

  if (heatmapData.length > 0) {
    await prisma.heatmapPoint.createMany({
      data: heatmapData,
    });
  }

  return heatmapData.length;
}

// AI 추천 생성 및 저장 (단순화)
async function generateAndStoreAIRecommendations(targetDate: Date) {
  const currentHour = new Date().getHours();

  const aiZones = await prisma.aIZone.findMany({
    where: { isActive: true },
    include: {
      predictions: {
        where: {
          predictionDate: {
            gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
            lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1),
          },
          hour: {
            in: [currentHour, (currentHour + 1) % 24],
          },
        },
      },
    },
    orderBy: { avgFee: 'desc' },
    take: 5, // 상위 5개만
  });

  // 기존 추천 삭제
  const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  await prisma.aIRecommendation.deleteMany({
    where: {
      createdAt: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  });

  const recommendations = [];

  for (const zone of aiZones) {
    const hourlyPrediction = zone.predictions.find((p) => p.hour === currentHour);

    if (hourlyPrediction && hourlyPrediction.expectedCalls > 3) {
      recommendations.push({
        zoneId: zone.id,
        type: RecommendationType.HISTORICAL_DATA,
        title: `${zone.name} 지역 추천`,
        description: `현재 시간대에 평균 ${
          hourlyPrediction.expectedCalls
        }건의 주문이 예상됩니다. 건당 평균 ${zone.avgFee.toLocaleString()}원`,
        impact:
          hourlyPrediction.expectedCalls > 8
            ? Impact.HIGH
            : hourlyPrediction.expectedCalls > 5
            ? Impact.MEDIUM
            : Impact.LOW,
        confidence: hourlyPrediction.confidence,
      });
    }
  }

  // 시간대별 기본 추천 (단순화)
  const bestZone = aiZones[0];
  if (bestZone) {
    const timeBasedRecommendations = [
      {
        hours: [11, 12, 13],
        title: '점심시간 추천',
        description: '11:30-13:30 시간대에는 오피스 밀집 지역을 추천합니다.',
      },
      {
        hours: [18, 19, 20],
        title: '저녁시간 추천',
        description: '18:00-20:00 시간대에는 주거 밀집 지역을 추천합니다.',
      },
      {
        hours: [22, 23, 0, 1],
        title: '야간시간 추천',
        description: '22:00-01:00 시간대에는 유흥가 근처를 추천합니다.',
      },
    ];

    const currentRecommendation = timeBasedRecommendations.find((rec) => rec.hours.includes(currentHour));
    if (currentRecommendation) {
      recommendations.push({
        zoneId: bestZone.id,
        type: RecommendationType.TIME_PATTERN,
        title: currentRecommendation.title,
        description: currentRecommendation.description,
        impact: Impact.MEDIUM,
        confidence: 0.8,
      });
    }
  }

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
    const endDate = date ? new Date(date) : new Date();
    endDate.setHours(0, 0, 0, 0);

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 7); // 7일로 단축
    startDate.setHours(0, 0, 0, 0);

    const results = [];

    // 30일 데이터를 한 번만 조회
    const thirtyDaysAgo = new Date(endDate);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const deliveryData = await getDeliveryData(thirtyDaysAgo, endDate);

    for (
      let currentDate = new Date(startDate);
      currentDate <= endDate;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      const targetDate = new Date(currentDate);

      // 이미 계산된 데이터 확인
      const existingData = await checkIfDataExists(targetDate);

      console.log(`${targetDate.toISOString()}의 데이터 확인:`, existingData);

      let aiZoneCount = 0;
      let hourlyPredictions = 0;
      let heatmapPoints = 0;
      let recommendations = 0;

      // 필요한 것만 계산
      const promises = [];

      if (!existingData.hasAIZones) {
        promises.push(calculateAndUpdateAIZones(targetDate, deliveryData).then((count) => (aiZoneCount = count)));
      }

      if (!existingData.hasPredictions) {
        promises.push(
          calculateAndStoreHourlyPredictions(targetDate, deliveryData).then((count) => (hourlyPredictions = count)),
        );
      }

      if (!existingData.hasHeatmap) {
        promises.push(calculateAndUpdateHeatmapData(targetDate).then((count) => (heatmapPoints = count)));
      }

      if (!existingData.hasRecommendations) {
        promises.push(generateAndStoreAIRecommendations(targetDate).then((count) => (recommendations = count)));
      }

      if (promises.length > 0) {
        await Promise.all(promises);
        console.log(
          `${targetDate.toISOString()} 배치 계산 완료: AI존 ${aiZoneCount}개, 예측 ${hourlyPredictions}건, 히트맵 ${heatmapPoints}개, 추천 ${recommendations}건`,
        );
      } else {
        console.log(`${targetDate.toISOString()} 데이터가 이미 존재하여 건너뜀`);
      }

      results.push({
        date: targetDate.toISOString(),
        aiZoneCount,
        hourlyPredictions,
        heatmapPoints,
        recommendations,
        skipped: promises.length === 0,
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

// 매일 자동 실행을 위한 GET 엔드포인트
export async function GET() {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    // 이미 계산된 데이터 확인
    const existingData = await checkIfDataExists(yesterday);

    if (
      existingData.hasAIZones &&
      existingData.hasPredictions &&
      existingData.hasHeatmap &&
      existingData.hasRecommendations
    ) {
      return NextResponse.json({
        success: true,
        message: '데이터가 이미 존재하여 건너뜀',
        data: {
          date: yesterday.toISOString(),
          skipped: true,
        },
      });
    }

    const thirtyDaysAgo = new Date(yesterday);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const deliveryData = await getDeliveryData(thirtyDaysAgo, yesterday);

    const promises = [];
    let aiZoneCount = 0;
    let hourlyPredictions = 0;
    let heatmapPoints = 0;
    let recommendations = 0;

    if (!existingData.hasAIZones) {
      promises.push(calculateAndUpdateAIZones(yesterday, deliveryData).then((count) => (aiZoneCount = count)));
    }
    if (!existingData.hasPredictions) {
      promises.push(
        calculateAndStoreHourlyPredictions(yesterday, deliveryData).then((count) => (hourlyPredictions = count)),
      );
    }
    if (!existingData.hasHeatmap) {
      promises.push(calculateAndUpdateHeatmapData(yesterday).then((count) => (heatmapPoints = count)));
    }
    if (!existingData.hasRecommendations) {
      promises.push(generateAndStoreAIRecommendations(yesterday).then((count) => (recommendations = count)));
    }

    await Promise.all(promises);

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
