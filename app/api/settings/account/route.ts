import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// zod 스키마 정의
const DeleteAccountSchema = z.object({
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
  confirmation: z.literal('계정을 삭제하겠습니다'),
});

// DELETE /api/settings/account - 계정 삭제
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();

    // zod validation
    const validationResult = DeleteAccountSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        {
          error: '잘못된 요청 데이터입니다.',
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const { password } = validationResult.data;

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        password: true,
        riderProfile: {
          select: {
            id: true,
            totalDeliveries: true,
          },
        },
      },
    });

    if (!user || !user.password) {
      return Response.json({ error: '사용자를 찾을 수 없거나 비밀번호가 설정되지 않았습니다.' }, { status: 404 });
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return Response.json({ error: '비밀번호가 올바르지 않습니다.' }, { status: 400 });
    }

    // 계정 삭제 처리 (트랜잭션으로 안전하게 처리)
    await prisma.$transaction(async (tx) => {
      // 1. UserSettings 삭제 (있다면)
      if (user.riderProfile) {
        await tx.userSettings.deleteMany({
          where: { riderProfileId: user.riderProfile.id },
        });

        // 2. Delivery 레코드 삭제
        await tx.delivery.deleteMany({
          where: { riderId: user.riderProfile.id },
        });

        // 3. RiderProfile 삭제
        await tx.riderProfile.delete({
          where: { id: user.riderProfile.id },
        });
      }

      // 4. Sessions 삭제
      await tx.session.deleteMany({
        where: { userId: user.id },
      });

      // 5. Accounts 삭제
      await tx.account.deleteMany({
        where: { userId: user.id },
      });

      // 6. User 삭제
      await tx.user.delete({
        where: { id: user.id },
      });
    });

    // 성공 응답
    return Response.json({
      message: '계정이 성공적으로 삭제되었습니다.',
      deletedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('계정 삭제 실패:', error);
    return Response.json({ error: '계정 삭제에 실패했습니다.' }, { status: 500 });
  }
}

// GET /api/settings/account - 계정 삭제 정보 조회
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 사용자 계정과 관련 데이터 통계 조회
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        createdAt: true,
        riderProfile: {
          select: {
            totalDeliveries: true,
            joinDate: true,
            deliveries: {
              select: {
                id: true,
              },
            },
            userSettings: {
              select: {
                id: true,
              },
            },
          },
        },
        sessions: {
          select: {
            id: true,
          },
        },
        accounts: {
          select: {
            id: true,
            provider: true,
          },
        },
      },
    });

    if (!user) {
      return Response.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 삭제될 데이터 통계 정보
    const deletionInfo = {
      accountCreatedAt: user.createdAt,
      totalDeliveries: user.riderProfile?.totalDeliveries || 0,
      deliveryRecords: user.riderProfile?.deliveries.length || 0,
      activeSessions: user.sessions.length,
      connectedAccounts: user.accounts.length,
      hasUserSettings: !!user.riderProfile?.userSettings,
      dataToDelete: [
        '사용자 계정 정보',
        '라이더 프로필',
        '배달 내역 데이터',
        '사용자 설정',
        '세션 데이터',
        '연결된 계정 정보',
      ],
      warning: [
        '계정 삭제 후에는 복구가 불가능합니다.',
        '모든 배달 내역과 통계 데이터가 영구적으로 삭제됩니다.',
        '삭제된 계정으로는 다시 로그인할 수 없습니다.',
      ],
    };

    return Response.json({
      deletionInfo,
      message: '계정 삭제 정보를 조회했습니다.',
    });
  } catch (error) {
    console.error('계정 삭제 정보 조회 실패:', error);
    return Response.json({ error: '계정 삭제 정보 조회에 실패했습니다.' }, { status: 500 });
  }
}
