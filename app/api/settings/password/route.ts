import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// zod 스키마 정의
const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요.'),
    newPassword: z
      .string()
      .min(8, '새 비밀번호는 최소 8자 이상이어야 합니다.')
      .max(50, '새 비밀번호는 최대 50자까지 가능합니다.')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        '새 비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다.',
      ),
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  });

// PUT /api/settings/password - 비밀번호 변경
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();

    // zod validation
    const validationResult = ChangePasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        {
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
      return Response.json({ error: '사용자를 찾을 수 없거나 비밀번호가 설정되지 않았습니다.' }, { status: 404 });
    }

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return Response.json({ error: '현재 비밀번호가 올바르지 않습니다.' }, { status: 400 });
    }

    // 새 비밀번호가 현재 비밀번호와 동일한지 확인
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return Response.json({ error: '새 비밀번호는 현재 비밀번호와 달라야 합니다.' }, { status: 400 });
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

    // 보안을 위해 다른 세션들을 무효화할 수도 있지만,
    // 현재는 성공 메시지만 반환
    return Response.json({
      message: '비밀번호가 성공적으로 변경되었습니다.',
    });
  } catch (error) {
    console.error('비밀번호 변경 실패:', error);
    return Response.json({ error: '비밀번호 변경에 실패했습니다.' }, { status: 500 });
  }
}
