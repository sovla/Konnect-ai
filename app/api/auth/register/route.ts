import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/app/lib/prisma';
import { VehicleType } from '@/app/generated/prisma';

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  vehicleType?: VehicleType;
}

export async function POST(request: Request) {
  try {
    const { name, email, password, phone, vehicleType }: RegisterRequest = await request.json();

    // 유효성 검증
    if (!name || !email || !password) {
      return NextResponse.json({ error: '이름, 이메일, 비밀번호는 필수 입력 항목입니다.' }, { status: 400 });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: '올바른 이메일 형식을 입력해주세요.' }, { status: 400 });
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      return NextResponse.json({ error: '비밀번호는 최소 6자 이상이어야 합니다.' }, { status: 400 });
    }

    // 기존 사용자 확인
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: '이미 등록된 이메일 주소입니다.' }, { status: 409 });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 12);

    // 사용자, 라이더 프로필, 앱 설정 생성 (트랜잭션)
    console.log('회원가입 시작');
    const result = await prisma.$transaction(async (tx) => {
      // 사용자 생성
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
        },
      });

      // 라이더 프로필 생성 (기본값 설정 포함)
      const riderProfile = await tx.riderProfile.create({
        data: {
          userId: user.id,
          vehicleType: vehicleType || VehicleType.MOTORCYCLE,
          preferredAreas: [], // 빈 배열로 초기화
          // 운행 목표 설정 (스키마 기본값 활용)
          dailyGoal: 100000, // 일일 목표 10만원
          monthlyGoal: 2500000, // 월간 목표 250만원
          // 운행 설정 기본값
          minOrderAmount: 5000, // 최소 주문금액 5천원
          workingHours: { start: 9, end: 21 }, // 선호 운행시간 9시-21시
          maxDistance: 5, // 최대 배달거리 5km
          autoAccept: false, // 자동 수락 비활성화
          // 알림 설정 기본값
          pushNewOrder: true, // 새 주문 알림 활성화
          pushGoalAchieve: true, // 목표 달성 알림 활성화
          pushPromotion: false, // 프로모션 알림 비활성화
          emailSummary: true, // 요약 이메일 활성화
          emailMarketing: false, // 마케팅 이메일 비활성화
        },
      });

      // 앱 환경 설정 생성
      const userSettings = await tx.userSettings.create({
        data: {
          riderProfileId: riderProfile.id,
          theme: 'LIGHT', // 라이트 테마 기본값
          language: 'KOREAN', // 한국어 기본값
          // 지도 설정 기본값 (스키마 기본값 활용)
          mapTrafficLayer: true, // 교통정보 레이어 활성화
          mapTransitLayer: false, // 대중교통 레이어 비활성화
          // 개인정보 동의는 회원가입시 현재 시각으로 설정
          privacyAccepted: true,
          termsAccepted: true,
          privacyDate: new Date(),
          termsDate: new Date(),
        },
      });

      return { user, riderProfile, userSettings };
    });

    return NextResponse.json(
      {
        success: true,
        message: '회원가입이 완료되었습니다.',
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('회원가입 에러:', error);

    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
