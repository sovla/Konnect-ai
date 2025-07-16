import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { AnnouncementType, Priority } from '@/app/generated/prisma';
import { AnnouncementsResponseSchema, GetAnnouncementsRequestSchema } from '@/app/types/dto';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // 요청 파라미터 검증
    const queryParams = {
      type: searchParams.get('type'),
      active: searchParams.get('active'), // 문자열로 처리
      priority: searchParams.get('priority'),
    };

    const validatedParams = GetAnnouncementsRequestSchema.parse(queryParams);

    // DB에서 공지사항 조회 조건 설정
    const whereClause: {
      type?: AnnouncementType;
      isActive?: boolean;
      priority?: Priority;
      startDate?: { lte: Date };
      endDate?: { gte: Date };
    } = {
      // 현재 유효한 공지사항만 조회 (시작일 <= 오늘 <= 종료일)
      // startDate: { lte: new Date() },
      // endDate: { gte: new Date() },
    };

    // 타입별 필터링
    if (validatedParams.type) {
      whereClause.type = validatedParams.type.toUpperCase() as AnnouncementType;
    }

    // 활성 상태 필터링
    if (validatedParams.active === 'true') {
      whereClause.isActive = true;
    } else if (validatedParams.active === 'false') {
      whereClause.isActive = false;
    }

    // 우선순위별 필터링
    if (validatedParams.priority) {
      whereClause.priority = validatedParams.priority.toUpperCase() as Priority;
    }

    const announcements = await prisma.announcement.findMany({
      where: whereClause,
      orderBy: [
        { priority: 'asc' }, // HIGH, MEDIUM, LOW 순서
        { startDate: 'desc' }, // 최신순
      ],
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        priority: true,
        startDate: true,
        endDate: true,
        isActive: true,
      },
    });

    // Mock API 형식에 맞게 데이터 변환
    const formattedAnnouncements = announcements.map((announcement) => ({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      type: announcement.type.toLowerCase(),
      priority: announcement.priority.toLowerCase(),
      startDate: announcement.startDate.toISOString().split('T')[0], // YYYY-MM-DD 형식
      endDate: announcement.endDate.toISOString().split('T')[0], // YYYY-MM-DD 형식
      isActive: announcement.isActive,
    }));

    const response = {
      success: true,
      data: formattedAnnouncements,
    };

    // dto 스키마로 응답 검증
    const validatedResponse = AnnouncementsResponseSchema.parse(response);

    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error('공지사항 조회 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
