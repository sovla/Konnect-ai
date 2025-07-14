import { PrismaClient } from '@/app/generated/prisma';

// Prisma 클라이언트 전역 타입 선언
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma 클라이언트 인스턴스 생성
// 개발 환경에서는 핫 리로드로 인한 다중 인스턴스 방지를 위해 global에 저장
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
    errorFormat: 'pretty',
  });

// 개발 환경에서만 global에 저장
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// 프로세스 종료 시 연결 해제
// Node.js 런타임에서만 동작 (Edge Runtime 제외)
if (typeof process !== 'undefined' && process.on && typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}
// 데이터베이스 연결 테스트 함수
export async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ 데이터베이스 연결 성공');
    return true;
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error);
    return false;
  }
}

// 타입 익스포트 (편의용)
export type {
  User,
  RiderProfile,
  Delivery,
  Announcement,
  AIZone,
  AIZonePrediction,
  HeatmapPoint,
  AIRecommendation,
  PlatformStats,
  VehicleType,
  AnnouncementType,
  Priority,
  RecommendationType,
  Impact,
} from '@/app/generated/prisma';
