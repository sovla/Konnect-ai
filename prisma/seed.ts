import {
  PrismaClient,
  AnnouncementType,
  Priority,
  RecommendationType,
  Impact,
  VehicleType,
  type Prisma,
} from '../app/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 시드 데이터 생성을 시작합니다...');

  // 1. 기본 사용자 및 라이더 프로필 생성
  const user = await prisma.user.upsert({
    where: { email: 'kim.delivery@konnect.ai' },
    update: {},
    create: {
      email: 'kim.delivery@konnect.ai',
      password: 'hashedpassword', // 실제로는 bcrypt로 해시된 비밀번호
      name: '김딜버',
      phone: '010-1234-5678',
      riderProfile: {
        create: {
          dailyGoal: 150000,
          monthlyGoal: 4000000,
          joinDate: new Date('2024-07-01'),
          totalDeliveries: 2847,
          averageRating: 4.8,
          acceptanceRate: 94.0,
          avgDeliveryTime: 21,
          preferredAreas: ['해운대구', '부산진구', '연제구'],
          vehicleType: VehicleType.MOTORCYCLE,
          isOnline: true,
          onlineTime: 510, // 8시간 30분 = 510분
        },
      },
    },
    include: {
      riderProfile: true,
    },
  });

  console.log('✅ 사용자 및 라이더 프로필 생성 완료');

  // 2. 배달 내역 데이터 생성
  const deliveryData: Prisma.DeliveryCreateInput[] = [
    {
      id: 'delivery-sample-001',
      riderProfile: {
        connect: { id: user.riderProfile!.id },
      },
      date: new Date('2025-01-14T12:30:00'),
      completedAt: new Date('2025-01-14T12:30:00'),
      pickupAddress: '해운대구 우동',
      pickupLat: 35.16,
      pickupLng: 129.16,
      dropoffAddress: '해운대구 좌동',
      dropoffLat: 35.17,
      dropoffLng: 129.17,
      baseEarnings: 3500,
      promoEarnings: 500,
      tipEarnings: 0,
      totalEarnings: 4000,
      rating: 5.0,
      deliveryTime: 18,
    },
    {
      id: 'delivery-sample-002',
      riderProfile: {
        connect: { id: user.riderProfile!.id },
      },
      date: new Date('2025-01-14T13:15:00'),
      completedAt: new Date('2025-01-14T13:15:00'),
      pickupAddress: '해운대구 재송동',
      pickupLat: 35.18,
      pickupLng: 129.12,
      dropoffAddress: '해운대구 센텀시티',
      dropoffLat: 35.169,
      dropoffLng: 129.129,
      baseEarnings: 4000,
      promoEarnings: 1000,
      tipEarnings: 2000,
      totalEarnings: 7000,
      rating: 5.0,
      deliveryTime: 25,
    },
    {
      id: 'delivery-sample-003',
      riderProfile: {
        connect: { id: user.riderProfile!.id },
      },
      date: new Date('2025-01-14T14:45:00'),
      completedAt: new Date('2025-01-14T14:45:00'),
      pickupAddress: '부산진구 서면',
      pickupLat: 35.158,
      pickupLng: 129.059,
      dropoffAddress: '부산진구 범천동',
      dropoffLat: 35.162,
      dropoffLng: 129.052,
      baseEarnings: 3800,
      promoEarnings: 0,
      tipEarnings: 1000,
      totalEarnings: 4800,
      rating: 4.0,
      deliveryTime: 22,
    },
    {
      id: 'delivery-sample-004',
      riderProfile: {
        connect: { id: user.riderProfile!.id },
      },
      date: new Date('2025-01-14T16:20:00'),
      completedAt: new Date('2025-01-14T16:20:00'),
      pickupAddress: '연제구 거제동',
      pickupLat: 35.19,
      pickupLng: 129.082,
      dropoffAddress: '연제구 연산동',
      dropoffLat: 35.185,
      dropoffLng: 129.075,
      baseEarnings: 3200,
      promoEarnings: 300,
      tipEarnings: 0,
      totalEarnings: 3500,
      rating: 5.0,
      deliveryTime: 15,
    },
    {
      id: 'delivery-sample-005',
      riderProfile: {
        connect: { id: user.riderProfile!.id },
      },
      date: new Date('2025-01-14T18:30:00'),
      completedAt: new Date('2025-01-14T18:30:00'),
      pickupAddress: '수영구 망미동',
      pickupLat: 35.155,
      pickupLng: 129.115,
      dropoffAddress: '수영구 수영동',
      dropoffLat: 35.145,
      dropoffLng: 129.112,
      baseEarnings: 4200,
      promoEarnings: 800,
      tipEarnings: 1500,
      totalEarnings: 6500,
      rating: 5.0,
      deliveryTime: 20,
    },
  ];

  for (const delivery of deliveryData) {
    await prisma.delivery.upsert({
      where: { id: delivery.id },
      update: {},
      create: delivery,
    });
  }

  console.log('✅ 배달 내역 데이터 생성 완료');

  // 3. AI 예측 구역 데이터 생성
  const aiZonesData: Prisma.AIZoneCreateInput[] = [
    {
      name: '센텀시티 주변',
      coordinates: [
        [35.169, 129.129],
        [35.175, 129.135],
        [35.165, 129.14],
        [35.16, 129.125],
      ],
      expectedCalls: 8,
      avgFee: 4500,
      confidence: 0.85,
    },
    {
      name: '서면 상권',
      coordinates: [
        [35.158, 129.059],
        [35.162, 129.065],
        [35.155, 129.068],
        [35.152, 129.055],
      ],
      expectedCalls: 12,
      avgFee: 4200,
      confidence: 0.92,
    },
    {
      name: '해운대 해변가',
      coordinates: [
        [35.158, 129.16],
        [35.165, 129.168],
        [35.162, 129.175],
        [35.155, 129.165],
      ],
      expectedCalls: 6,
      avgFee: 3800,
      confidence: 0.78,
    },
    {
      name: '연산동 주거지역',
      coordinates: [
        [35.185, 129.075],
        [35.192, 129.085],
        [35.188, 129.09],
        [35.18, 129.078],
      ],
      expectedCalls: 15,
      avgFee: 4800,
      confidence: 0.95,
    },
    {
      name: '광안리 상권',
      coordinates: [
        [35.152, 129.118],
        [35.157, 129.125],
        [35.148, 129.128],
        [35.145, 129.115],
      ],
      expectedCalls: 10,
      avgFee: 5200,
      confidence: 0.88,
    },
  ];

  for (const zoneData of aiZonesData) {
    // 기존 구역이 있는지 확인
    let zone = await prisma.aIZone.findFirst({
      where: { name: zoneData.name },
    });

    // 없으면 새로 생성
    if (!zone) {
      zone = await prisma.aIZone.create({
        data: {
          name: zoneData.name,
          coordinates: zoneData.coordinates,
          expectedCalls: zoneData.expectedCalls,
          avgFee: zoneData.avgFee,
          confidence: zoneData.confidence,
          isActive: true,
        },
      });
    }

    // 시간별 예측 데이터 생성
    const hourlyData = [
      { hour: 13, expectedCalls: 3, confidence: 0.8 },
      { hour: 14, expectedCalls: 5, confidence: 0.85 },
      { hour: 15, expectedCalls: 4, confidence: 0.78 },
      { hour: 17, expectedCalls: 7, confidence: 0.82 },
      { hour: 18, expectedCalls: 12, confidence: 0.95 },
      { hour: 19, expectedCalls: 15, confidence: 0.98 },
      { hour: 20, expectedCalls: 10, confidence: 0.88 },
    ];

    for (const hourData of hourlyData) {
      const predictionData: Prisma.AIZonePredictionCreateInput = {
        zone: { connect: { id: zone.id } },
        hour: hourData.hour,
        expectedCalls: hourData.expectedCalls,
        confidence: hourData.confidence,
        predictionDate: new Date('2025-01-14'),
      };

      await prisma.aIZonePrediction.upsert({
        where: {
          zoneId_hour_predictionDate: {
            zoneId: zone.id,
            hour: hourData.hour,
            predictionDate: new Date('2025-01-14'),
          },
        },
        update: {},
        create: predictionData,
      });
    }

    // AI 추천 이유 생성
    const recommendations = [
      {
        type: RecommendationType.HISTORICAL_DATA,
        title: '과거 데이터 분석',
        description: `지난 4주간 이 시간대 평균 ${zoneData.expectedCalls}건의 주문이 발생했습니다.`,
        impact: Impact.HIGH,
        confidence: 0.92,
      },
      {
        type: RecommendationType.RESTAURANT_DENSITY,
        title: '음식점 밀집도',
        description: '반경 500m 내 24개의 음식점이 위치해 있습니다.',
        impact: Impact.MEDIUM,
        confidence: 0.88,
      },
    ];

    for (const rec of recommendations) {
      const recommendationData: Prisma.AIRecommendationCreateInput = {
        id: `${zone.id}-${rec.type}`,
        zone: { connect: { id: zone.id } },
        type: rec.type,
        title: rec.title,
        description: rec.description,
        impact: rec.impact,
        confidence: rec.confidence,
      };

      await prisma.aIRecommendation.upsert({
        where: { id: recommendationData.id },
        update: {},
        create: recommendationData,
      });
    }
  }

  console.log('✅ AI 예측 구역 데이터 생성 완료');

  // 4. 히트맵 데이터 생성
  const heatmapData: Prisma.HeatmapPointCreateInput[] = [
    { id: 'heatmap-1', lat: 35.169, lng: 129.129, weight: 0.8, recentOrders: 24, avgWaitTime: 8, hourlyTrend: '증가' },
    {
      id: 'heatmap-2',
      lat: 35.158,
      lng: 129.059,
      weight: 0.9,
      recentOrders: 32,
      avgWaitTime: 5,
      hourlyTrend: '매우 증가',
    },
    { id: 'heatmap-3', lat: 35.185, lng: 129.075, weight: 0.7, recentOrders: 18, avgWaitTime: 12, hourlyTrend: '감소' },
    { id: 'heatmap-4', lat: 35.152, lng: 129.118, weight: 0.6, recentOrders: 15, avgWaitTime: 6, hourlyTrend: '안정' },
    { id: 'heatmap-5', lat: 35.175, lng: 128.995, weight: 0.5, recentOrders: 12, avgWaitTime: 15, hourlyTrend: '감소' },
    { id: 'heatmap-6', lat: 35.135, lng: 129.095, weight: 0.4, recentOrders: 9, avgWaitTime: 10, hourlyTrend: '안정' },
    { id: 'heatmap-7', lat: 35.16, lng: 129.16, weight: 0.8, recentOrders: 22, avgWaitTime: 7, hourlyTrend: '증가' },
    { id: 'heatmap-8', lat: 35.17, lng: 129.17, weight: 0.7, recentOrders: 19, avgWaitTime: 9, hourlyTrend: '안정' },
  ];

  for (const point of heatmapData) {
    await prisma.heatmapPoint.upsert({
      where: { id: point.id },
      update: {},
      create: {
        ...point,
        timestamp: new Date(),
      },
    });
  }

  console.log('✅ 히트맵 데이터 생성 완료');

  // 5. 공지사항 데이터 생성
  const announcementsData: Prisma.AnnouncementCreateInput[] = [
    {
      id: 'announce-001',
      title: '🎉 주말 특별 프로모션',
      content: '토요일, 일요일 18:00~22:00 시간당 추가 1,000원!',
      type: AnnouncementType.PROMOTION,
      priority: Priority.HIGH,
      startDate: new Date('2025-01-11'),
      endDate: new Date('2025-01-19'),
      isActive: true,
    },
    {
      id: 'announce-002',
      title: '⚠️ 센텀시티 도로 공사',
      content: '센텀시티 일대 도로 공사로 인한 우회로 안내',
      type: AnnouncementType.NOTICE,
      priority: Priority.MEDIUM,
      startDate: new Date('2025-01-14'),
      endDate: new Date('2025-01-20'),
      isActive: true,
    },
    {
      id: 'announce-003',
      title: '💰 신규 인센티브 정책',
      content: '월 300건 이상 완료 시 보너스 10만원 지급',
      type: AnnouncementType.INCENTIVE,
      priority: Priority.HIGH,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
      isActive: true,
    },
  ];

  for (const announcement of announcementsData) {
    await prisma.announcement.upsert({
      where: { id: announcement.id },
      update: {},
      create: {
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        type: announcement.type as AnnouncementType,
        priority: announcement.priority as Priority,
        startDate: announcement.startDate,
        endDate: announcement.endDate,
        isActive: announcement.isActive,
      },
    });
  }

  console.log('✅ 공지사항 데이터 생성 완료');

  // 6. 플랫폼 통계 데이터 생성
  const platformStatsData: Prisma.PlatformStatsCreateInput = {
    date: new Date('2025-01-14'),
    avgAcceptanceRate: 92.0,
    avgDeliveryTime: 21,
    avgDailyEarnings: 120000,
    avgMonthlyEarnings: 3200000,
    avgRating: 4.6,
    avgDeliveriesPerDay: 28,
  };

  await prisma.platformStats.upsert({
    where: { date: platformStatsData.date },
    update: {},
    create: platformStatsData,
  });

  console.log('✅ 플랫폼 통계 데이터 생성 완료');

  console.log('🎉 모든 시드 데이터 생성이 완료되었습니다!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ 시드 데이터 생성 중 오류 발생:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
