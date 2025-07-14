import { NextResponse } from 'next/server';
import { TodayStatsResponseSchema } from '@/app/types/dto';

const todayStats = {
  date: '2025-01-14',
  totalEarnings: 26800,
  completedDeliveries: 5,
  onlineTime: '10:15:30',
  goalProgress: 17.9,
  avgEarningsPerDelivery: 5360,
  acceptanceRate: 100,
  currentStreak: 12,
};

export async function GET() {
  const response = {
    success: true,
    data: todayStats,
  };

  // dto 스키마로 응답 검증
  const validatedResponse = TodayStatsResponseSchema.parse(response);

  return NextResponse.json(validatedResponse);
}
