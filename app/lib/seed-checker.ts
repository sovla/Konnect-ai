import { prisma } from './prisma';

/**
 * 데이터베이스에 기본 데이터가 있는지 확인하고 없으면 시드 데이터를 생성합니다.
 * 프로젝트 시작시 자동으로 호출됩니다.
 */
export async function ensureSeedData() {
  try {
    console.log('🔍 데이터베이스 시드 데이터 확인 중...');

    // 1. 사용자 데이터 확인
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('👤 사용자 데이터가 없습니다. 시드 데이터를 생성합니다...');
      await createSeedData();
      return;
    }

    // 2. 라이더 프로필 확인
    const riderCount = await prisma.riderProfile.count();
    if (riderCount === 0) {
      console.log('🚴 라이더 프로필 데이터가 없습니다. 시드 데이터를 생성합니다...');
      await createSeedData();
      return;
    }

    // 3. AI 구역 데이터 확인
    const aiZoneCount = await prisma.aIZone.count();
    if (aiZoneCount === 0) {
      console.log('🤖 AI 구역 데이터가 없습니다. 시드 데이터를 생성합니다...');
      await createSeedData();
      return;
    }

    // 4. 공지사항 데이터 확인
    const announcementCount = await prisma.announcement.count();
    if (announcementCount === 0) {
      console.log('📢 공지사항 데이터가 없습니다. 시드 데이터를 생성합니다...');
      await createSeedData();
      return;
    }

    console.log('✅ 모든 기본 데이터가 이미 존재합니다.');
  } catch (error) {
    console.error('❌ 시드 데이터 확인 중 오류 발생:', error);
    // 에러가 발생해도 애플리케이션 실행을 중단하지 않습니다
  }
}

/**
 * 시드 데이터를 생성하는 함수
 * prisma/seed.ts의 로직을 별도 함수로 분리
 */
async function createSeedData() {
  try {
    console.log('🌱 시드 데이터 생성을 시작합니다...');

    // 1. 기본 사용자 및 라이더 프로필 생성
    const user = await prisma.user.create({
      data: {
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
            vehicleType: 'MOTORCYCLE',
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

    // 2. 샘플 배달 내역 생성 (일부만)
    const sampleDeliveries = [
      {
        id: 'delivery-sample-001',
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
        riderId: user.riderProfile!.id,
      },
      {
        id: 'delivery-sample-002',
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
        riderId: user.riderProfile!.id,
      },
    ];

    await prisma.delivery.createMany({
      data: sampleDeliveries,
    });

    console.log('✅ 샘플 배달 내역 생성 완료');

    // 3. AI 예측 구역 생성
    const aiZones = [
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
    ];

    for (const zoneData of aiZones) {
      await prisma.aIZone.create({
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

    console.log('✅ AI 예측 구역 생성 완료');

    // 4. 히트맵 데이터 생성
    const heatmapPoints = [
      {
        id: 'heatmap-sample-1',
        lat: 35.169,
        lng: 129.129,
        weight: 0.8,
        recentOrders: 24,
        avgWaitTime: 8,
        hourlyTrend: '증가',
      },
      {
        id: 'heatmap-sample-2',
        lat: 35.158,
        lng: 129.059,
        weight: 0.9,
        recentOrders: 32,
        avgWaitTime: 5,
        hourlyTrend: '매우 증가',
      },
      {
        id: 'heatmap-sample-3',
        lat: 35.185,
        lng: 129.075,
        weight: 0.7,
        recentOrders: 18,
        avgWaitTime: 12,
        hourlyTrend: '감소',
      },
    ];

    await prisma.heatmapPoint.createMany({
      data: heatmapPoints.map((point) => ({
        ...point,
        timestamp: new Date(),
      })),
    });

    console.log('✅ 히트맵 데이터 생성 완료');

    // 5. 공지사항 생성
    const announcements = [
      {
        id: 'announce-sample-001',
        title: '🎉 주말 특별 프로모션',
        content: '토요일, 일요일 18:00~22:00 시간당 추가 1,000원!',
        type: 'PROMOTION' as const,
        priority: 'HIGH' as const,
        startDate: new Date('2025-01-11'),
        endDate: new Date('2025-01-19'),
        isActive: true,
      },
      {
        id: 'announce-sample-002',
        title: '💰 신규 인센티브 정책',
        content: '월 300건 이상 완료 시 보너스 10만원 지급',
        type: 'INCENTIVE' as const,
        priority: 'HIGH' as const,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
        isActive: true,
      },
    ];

    await prisma.announcement.createMany({
      data: announcements,
    });

    console.log('✅ 공지사항 생성 완료');

    // 6. 플랫폼 통계 생성
    await prisma.platformStats.create({
      data: {
        date: new Date('2025-01-14'),
        avgAcceptanceRate: 92.0,
        avgDeliveryTime: 21,
        avgDailyEarnings: 120000,
        avgMonthlyEarnings: 3200000,
        avgRating: 4.6,
        avgDeliveriesPerDay: 28,
      },
    });

    console.log('✅ 플랫폼 통계 생성 완료');

    console.log('🎉 모든 시드 데이터 생성이 완료되었습니다!');
  } catch (error) {
    console.error('❌ 시드 데이터 생성 중 오류 발생:', error);
    throw error;
  }
}
