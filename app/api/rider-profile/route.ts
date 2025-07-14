import { NextResponse } from 'next/server';

const riderProfile = {
  id: 'rider-001',
  name: '김딜버',
  dailyGoal: 150000,
  monthlyGoal: 4000000,
  joinDate: '2024-07-01',
  totalDeliveries: 2847,
  averageRating: 4.8,
  acceptanceRate: 94,
  avgDeliveryTime: 21,
  preferredAreas: ['해운대구', '부산진구', '연제구'],
  vehicleType: 'motorcycle',
  isOnline: true,
  onlineTime: '08:30',
};

const platformAverages = {
  acceptanceRate: 92,
  avgDeliveryTime: 21,
  avgDailyEarnings: 120000,
  avgMonthlyEarnings: 3200000,
  avgRating: 4.6,
  avgDeliveriesPerDay: 28,
};

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      rider: riderProfile,
      platformAverages: platformAverages,
    },
  });
}
