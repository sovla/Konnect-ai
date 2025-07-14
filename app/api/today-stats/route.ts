import { NextResponse } from 'next/server';

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
  return NextResponse.json({
    success: true,
    data: todayStats,
  });
}
