import { NextResponse } from 'next/server';
import { RiderProfileResponseSchema } from '@/app/types/dto';

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
  const response = {
    success: true,
    data: {
      rider: riderProfile,
      platformAverages: platformAverages,
    },
  };

  // dto 스키마로 응답 검증
  const validatedResponse = RiderProfileResponseSchema.parse(response);

  return NextResponse.json(validatedResponse);
}
