import { MonthlyAnalysis } from '@/app/types';
import { NextResponse } from 'next/server';

const weeklyStats = [
  { date: '2025-01-08', earnings: 145000, deliveries: 32 },
  { date: '2025-01-09', earnings: 132000, deliveries: 28 },
  { date: '2025-01-10', earnings: 156000, deliveries: 35 },
  { date: '2025-01-11', earnings: 178000, deliveries: 38 },
  { date: '2025-01-12', earnings: 165000, deliveries: 33 },
  { date: '2025-01-13', earnings: 189000, deliveries: 41 },
  { date: '2025-01-14', earnings: 26800, deliveries: 5 },
];

const monthlyAnalysis: MonthlyAnalysis = {
  currentMonth: {
    month: '2025-01',
    totalEarnings: 2341000,
    totalDeliveries: 487,
    workingDays: 14,
    avgDailyEarnings: 167214,
    goalProgress: 58.5,
    earningsBreakdown: {
      base: 1756000,
      promo: 425000,
      tip: 160000,
    },
  },
  lastMonth: {
    month: '2024-12',
    totalEarnings: 3890000,
    totalDeliveries: 824,
    workingDays: 26,
    avgDailyEarnings: 149615,
  },
  dayOfWeekStats: [
    { day: '월', avgEarnings: 142000, avgDeliveries: 28 },
    { day: '화', avgEarnings: 138000, avgDeliveries: 27 },
    { day: '수', avgEarnings: 145000, avgDeliveries: 29 },
    { day: '목', avgEarnings: 155000, avgDeliveries: 31 },
    { day: '금', avgEarnings: 168000, avgDeliveries: 34 },
    { day: '토', avgEarnings: 185000, avgDeliveries: 38 },
    { day: '일', avgEarnings: 172000, avgDeliveries: 36 },
  ],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'weekly', 'monthly'

  switch (type) {
    case 'weekly':
      return NextResponse.json({
        success: true,
        data: weeklyStats,
      });
    case 'monthly':
      return NextResponse.json({
        success: true,
        data: monthlyAnalysis,
      });
    default:
      return NextResponse.json({
        success: true,
        data: {
          weekly: weeklyStats,
          monthly: monthlyAnalysis,
        },
      });
  }
}
