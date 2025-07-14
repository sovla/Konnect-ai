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

    // 사용자 및 라이더 프로필 생성 (트랜잭션)
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

      // 라이더 프로필 생성
      const riderProfile = await tx.riderProfile.create({
        data: {
          userId: user.id,
          vehicleType: vehicleType || VehicleType.MOTORCYCLE,
          preferredAreas: [], // 빈 배열로 초기화
        },
      });

      return { user, riderProfile };
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
