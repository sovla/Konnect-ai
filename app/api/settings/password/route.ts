import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';
import {
  ChangePasswordRequestSchema,
  ChangePasswordResponseSchema,
  type ChangePasswordResponse,
} from '@/app/types/dto';

// PUT /api/settings/password - 비밀번호 변경
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json(
        {
          success: false,
          error: '인증이 필요합니다.',
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    // zod validation
    const validationResult = ChangePasswordRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        {
          success: false,
          error: '잘못된 요청 데이터입니다.',
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const { currentPassword, newPassword } = validationResult.data;

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!user || !user.password) {
      return Response.json(
        {
          success: false,
          error: '사용자를 찾을 수 없거나 비밀번호가 설정되지 않았습니다.',
        },
        { status: 404 },
      );
    }

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return Response.json(
        {
          success: false,
          error: '현재 비밀번호가 올바르지 않습니다.',
        },
        { status: 400 },
      );
    }

    // 새 비밀번호가 현재 비밀번호와 동일한지 확인
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return Response.json(
        {
          success: false,
          error: '새 비밀번호는 현재 비밀번호와 달라야 합니다.',
        },
        { status: 400 },
      );
    }

    // 새 비밀번호 해시화
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // 사용자 비밀번호 업데이트
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date(),
      },
    });

    const responseData: ChangePasswordResponse = {
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.',
    };

    // 응답 검증
    const validatedResponse = ChangePasswordResponseSchema.parse(responseData);
    return Response.json(validatedResponse);
  } catch (error) {
    console.error('비밀번호 변경 실패:', error);
    return Response.json(
      {
        success: false,
        error: '비밀번호 변경에 실패했습니다.',
      },
      { status: 500 },
    );
  }
}
