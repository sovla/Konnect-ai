import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';
import { Theme, Language } from '@/app/generated/prisma';
import {
  UpdateUserSettingsRequestSchema,
  UserSettingsResponseSchema,
  type UserSettingsResponse,
} from '@/app/types/dto';

// GET /api/settings - 사용자 설정 조회
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

    // 라이더 프로필과 설정 정보 조회
    const riderProfile = await prisma.riderProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        userSettings: true,
      },
    });

    if (!riderProfile) {
      return Response.json(
        {
          success: false,
          error: '라이더 프로필을 찾을 수 없습니다.',
        },
        { status: 404 },
      );
    }

    // UserSettings가 없으면 기본값으로 생성
    let userSettings = riderProfile.userSettings;
    if (!userSettings) {
      userSettings = await prisma.userSettings.create({
        data: {
          riderProfileId: riderProfile.id,
          theme: Theme.LIGHT,
          language: Language.KOREAN,
          mapDefaultZoom: 12,
          mapDefaultLat: 37.5665, // 서울 기본값
          mapDefaultLng: 126.978,
          mapTrafficLayer: true,
          mapTransitLayer: false,
          privacyAccepted: false,
          termsAccepted: false,
        },
      });
    }

    const responseData: UserSettingsResponse = {
      success: true,
      message: '사용자 설정을 조회했습니다.',
      data: {
        userSettings: {
          id: userSettings.id,
          theme: userSettings.theme,
          language: userSettings.language,
          mapDefaultZoom: userSettings.mapDefaultZoom,
          mapDefaultLat: userSettings.mapDefaultLat,
          mapDefaultLng: userSettings.mapDefaultLng,
          mapTrafficLayer: userSettings.mapTrafficLayer,
          mapTransitLayer: userSettings.mapTransitLayer,
          privacyAccepted: userSettings.privacyAccepted,
          termsAccepted: userSettings.termsAccepted,
          privacyDate: userSettings.privacyDate,
          termsDate: userSettings.termsDate,
          createdAt: userSettings.createdAt,
          updatedAt: userSettings.updatedAt,
        },
      },
    };

    // 응답 검증
    const validatedResponse = UserSettingsResponseSchema.parse(responseData);
    return Response.json(validatedResponse);
  } catch (error) {
    console.error('사용자 설정 조회 실패:', error);
    return Response.json(
      {
        success: false,
        error: '사용자 설정 조회에 실패했습니다.',
      },
      { status: 500 },
    );
  }
}

// PUT /api/settings - 사용자 설정 업데이트
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
    const validationResult = UpdateUserSettingsRequestSchema.safeParse(body);
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

    // 라이더 프로필 조회
    const riderProfile = await prisma.riderProfile.findUnique({
      where: { userId: session.user.id },
      include: { userSettings: true },
    });

    if (!riderProfile) {
      return Response.json(
        {
          success: false,
          error: '라이더 프로필을 찾을 수 없습니다.',
        },
        { status: 404 },
      );
    }

    // UserSettings 업데이트 또는 생성
    const userSettings = await prisma.userSettings.upsert({
      where: { riderProfileId: riderProfile.id },
      update: {
        ...updateData,
        updatedAt: new Date(),
      },
      create: {
        riderProfileId: riderProfile.id,
        theme: updateData.theme || Theme.LIGHT,
        language: updateData.language || Language.KOREAN,
        mapDefaultZoom: updateData.mapDefaultZoom || 12,
        mapDefaultLat: updateData.mapDefaultLat || 37.5665,
        mapDefaultLng: updateData.mapDefaultLng || 126.978,
        mapTrafficLayer: updateData.mapTrafficLayer ?? true,
        mapTransitLayer: updateData.mapTransitLayer ?? false,
        privacyAccepted: updateData.privacyAccepted ?? false,
        termsAccepted: updateData.termsAccepted ?? false,
      },
    });

    const responseData: UserSettingsResponse = {
      success: true,
      message: '사용자 설정이 업데이트되었습니다.',
      data: {
        userSettings: {
          id: userSettings.id,
          theme: userSettings.theme,
          language: userSettings.language,
          mapDefaultZoom: userSettings.mapDefaultZoom,
          mapDefaultLat: userSettings.mapDefaultLat,
          mapDefaultLng: userSettings.mapDefaultLng,
          mapTrafficLayer: userSettings.mapTrafficLayer,
          mapTransitLayer: userSettings.mapTransitLayer,
          privacyAccepted: userSettings.privacyAccepted,
          termsAccepted: userSettings.termsAccepted,
          privacyDate: userSettings.privacyDate,
          termsDate: userSettings.termsDate,
          createdAt: userSettings.createdAt,
          updatedAt: userSettings.updatedAt,
        },
      },
    };

    // 응답 검증
    const validatedResponse = UserSettingsResponseSchema.parse(responseData);
    return Response.json(validatedResponse);
  } catch (error) {
    console.error('사용자 설정 업데이트 실패:', error);
    return Response.json(
      {
        success: false,
        error: '사용자 설정 업데이트에 실패했습니다.',
      },
      { status: 500 },
    );
  }
}
