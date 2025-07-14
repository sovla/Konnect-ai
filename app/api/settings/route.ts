import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';
import { Theme, Language } from '@/app/generated/prisma';
import { z } from 'zod';

// zod 스키마 정의
const UpdateUserSettingsSchema = z.object({
  theme: z.nativeEnum(Theme).optional(),
  language: z.nativeEnum(Language).optional(),
  mapDefaultZoom: z.number().min(1).max(20).optional(),
  mapDefaultLat: z.number().min(-90).max(90).optional(),
  mapDefaultLng: z.number().min(-180).max(180).optional(),
  mapTrafficLayer: z.boolean().optional(),
  mapTransitLayer: z.boolean().optional(),
  privacyAccepted: z.boolean().optional(),
  termsAccepted: z.boolean().optional(),
});

// GET /api/settings - 사용자 설정 조회
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 라이더 프로필과 설정 정보 조회
    const riderProfile = await prisma.riderProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        userSettings: true,
      },
    });

    if (!riderProfile) {
      return Response.json({ error: '라이더 프로필을 찾을 수 없습니다.' }, { status: 404 });
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

    return Response.json({
      userSettings,
      message: '사용자 설정을 조회했습니다.',
    });
  } catch (error) {
    console.error('사용자 설정 조회 실패:', error);
    return Response.json({ error: '사용자 설정 조회에 실패했습니다.' }, { status: 500 });
  }
}

// PUT /api/settings - 사용자 설정 업데이트
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();

    // zod validation
    const validationResult = UpdateUserSettingsSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        {
          error: '잘못된 요청 데이터입니다.',
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const {
      theme,
      language,
      mapDefaultZoom,
      mapDefaultLat,
      mapDefaultLng,
      mapTrafficLayer,
      mapTransitLayer,
      privacyAccepted,
      termsAccepted,
    } = validationResult.data;

    // 라이더 프로필 조회
    const riderProfile = await prisma.riderProfile.findUnique({
      where: { userId: session.user.id },
      include: { userSettings: true },
    });

    if (!riderProfile) {
      return Response.json({ error: '라이더 프로필을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 업데이트할 데이터 준비
    const updateData: Partial<{
      theme: Theme;
      language: Language;
      mapDefaultZoom: number;
      mapDefaultLat: number;
      mapDefaultLng: number;
      mapTrafficLayer: boolean;
      mapTransitLayer: boolean;
      privacyAccepted: boolean;
      termsAccepted: boolean;
      privacyDate: Date;
      termsDate: Date;
    }> = {};
    if (theme !== undefined) updateData.theme = theme;
    if (language !== undefined) updateData.language = language;
    if (mapDefaultZoom !== undefined) updateData.mapDefaultZoom = mapDefaultZoom;
    if (mapDefaultLat !== undefined) updateData.mapDefaultLat = mapDefaultLat;
    if (mapDefaultLng !== undefined) updateData.mapDefaultLng = mapDefaultLng;
    if (mapTrafficLayer !== undefined) updateData.mapTrafficLayer = mapTrafficLayer;
    if (mapTransitLayer !== undefined) updateData.mapTransitLayer = mapTransitLayer;
    if (privacyAccepted !== undefined) {
      updateData.privacyAccepted = privacyAccepted;
      if (privacyAccepted) updateData.privacyDate = new Date();
    }
    if (termsAccepted !== undefined) {
      updateData.termsAccepted = termsAccepted;
      if (termsAccepted) updateData.termsDate = new Date();
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
        theme: Theme.LIGHT,
        language: Language.KOREAN,
        mapDefaultZoom: 12,
        mapDefaultLat: 37.5665,
        mapDefaultLng: 126.978,
        mapTrafficLayer: true,
        mapTransitLayer: false,
        privacyAccepted: false,
        termsAccepted: false,
        ...updateData,
      },
    });

    return Response.json({
      userSettings,
      message: '사용자 설정이 업데이트되었습니다.',
    });
  } catch (error) {
    console.error('사용자 설정 업데이트 실패:', error);
    return Response.json({ error: '사용자 설정 업데이트에 실패했습니다.' }, { status: 500 });
  }
}
