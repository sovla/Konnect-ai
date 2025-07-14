import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma, RiderProfile } from '@/app/lib/prisma';
import { UpdateProfileRequestSchema, ProfileResponseSchema, type ProfileResponse } from '@/app/types/dto';

// GET /api/settings/profile - 사용자 프로필 조회
export async function GET() {
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
      return Response.json(
        {
          success: false,
          error: '사용자를 찾을 수 없습니다.',
        },
        { status: 404 },
      );
    }

    const responseData: ProfileResponse = {
      success: true,
      message: '사용자 프로필을 조회했습니다.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          riderProfile: user.riderProfile as RiderProfile,
        },
      },
    };

    // 응답 검증
    const validatedResponse = ProfileResponseSchema.parse(responseData);
    return Response.json(validatedResponse);
  } catch (error) {
    console.error('사용자 프로필 조회 실패:', error);
    return Response.json(
      {
        success: false,
        error: '사용자 프로필 조회에 실패했습니다.',
      },
      { status: 500 },
    );
  }
}

// PUT /api/settings/profile - 사용자 프로필 업데이트
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
    const validationResult = UpdateProfileRequestSchema.safeParse(body);
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

    const updateData = validationResult.data;

    // 기존 사용자 조회
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!existingUser) {
      return Response.json(
        {
          success: false,
          error: '사용자를 찾을 수 없습니다.',
        },
        { status: 404 },
      );
    }

    // 이메일 변경 시 중복 검사
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: updateData.email },
      });

      if (emailExists) {
        return Response.json(
          {
            success: false,
            error: '이미 사용 중인 이메일 주소입니다.',
          },
          { status: 409 },
        );
      }
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

    const responseData: ProfileResponse = {
      success: true,
      message: '프로필이 업데이트되었습니다.',
      data: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          emailVerified: updatedUser.emailVerified,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
          riderProfile: updatedUser.riderProfile as RiderProfile,
        },
      },
    };

    // 응답 검증
    const validatedResponse = ProfileResponseSchema.parse(responseData);
    return Response.json(validatedResponse);
  } catch (error) {
    console.error('프로필 업데이트 실패:', error);
    return Response.json(
      {
        success: false,
        error: '프로필 업데이트에 실패했습니다.',
      },
      { status: 500 },
    );
  }
}
