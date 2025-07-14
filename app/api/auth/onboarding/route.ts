import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';
import { VehicleType } from '@/app/generated/prisma';

interface OnboardingRequest {
  preferredAreas: string[];
  vehicleType: VehicleType;
  dailyGoal?: number;
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { preferredAreas, vehicleType, dailyGoal }: OnboardingRequest = await request.json();

    // 유효성 검증
    if (!preferredAreas || preferredAreas.length === 0) {
      return NextResponse.json({ error: '최소 하나의 선호 지역을 선택해주세요.' }, { status: 400 });
    }

    if (!vehicleType) {
      return NextResponse.json({ error: '운송 수단을 선택해주세요.' }, { status: 400 });
    }

    // 라이더 프로필 업데이트
    const updatedProfile = await prisma.riderProfile.update({
      where: { userId: session.user.id },
      data: {
        preferredAreas,
        vehicleType,
        dailyGoal: dailyGoal || 50000, // 기본값: 50,000원
        monthlyGoal: dailyGoal ? dailyGoal * 30 : 1500000, // 기본값: 150만원
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: '온보딩이 완료되었습니다.',
        profile: updatedProfile,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('온보딩 에러:', error);

    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
