import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';

// zod 스키마 정의
const UpdateProfileSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요.').max(50, '이름은 최대 50자까지 가능합니다.').optional(),
  email: z
    .email({ message: '올바른 이메일 형식을 입력해주세요.' })
    .max(255, '이메일은 최대 255자까지 가능합니다.')
    .optional(),
  phone: z
    .string()
    .regex(/^010-\d{4}-\d{4}$/, '올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)')
    .optional()
    .nullable(),
});

// GET /api/settings/profile - 사용자 프로필 조회
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 사용자 프로필 조회
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        riderProfile: {
          select: {
            joinDate: true,
            totalDeliveries: true,
            averageRating: true,
            acceptanceRate: true,
            vehicleType: true,
          },
        },
      },
    });

    if (!user) {
      return Response.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    return Response.json({
      user,
      message: '사용자 프로필을 조회했습니다.',
    });
  } catch (error) {
    console.error('사용자 프로필 조회 실패:', error);
    return Response.json({ error: '사용자 프로필 조회에 실패했습니다.' }, { status: 500 });
  }
}

// PUT /api/settings/profile - 사용자 프로필 업데이트
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();

    // zod validation
    const validationResult = UpdateProfileSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        {
          error: '잘못된 요청 데이터입니다.',
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const { name, email, phone } = validationResult.data;

    // 사용자 존재 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!existingUser) {
      return Response.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 이메일 중복 확인 (현재 사용자 제외)
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email: email,
          id: { not: session.user.id },
        },
      });

      if (emailExists) {
        return Response.json({ error: '이미 사용 중인 이메일입니다.' }, { status: 400 });
      }
    }

    // 업데이트할 데이터 준비
    const updateData: Partial<{
      name: string;
      email: string;
      phone: string | null;
      emailVerified: Date | null;
    }> = {};

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;

    // 이메일이 변경되면 이메일 인증 상태를 초기화
    if (email !== undefined && email !== existingUser.email) {
      updateData.email = email;
      updateData.emailVerified = null;
    }

    // 사용자 프로필 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        emailVerified: true,
        updatedAt: true,
      },
    });

    return Response.json({
      user: updatedUser,
      message: '사용자 프로필이 업데이트되었습니다.',
      emailChanged: email !== undefined && email !== existingUser.email,
    });
  } catch (error) {
    console.error('사용자 프로필 업데이트 실패:', error);
    return Response.json({ error: '사용자 프로필 업데이트에 실패했습니다.' }, { status: 500 });
  }
}
