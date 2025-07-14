import { NextResponse } from 'next/server';
import { AnnouncementsResponseSchema, GetAnnouncementsRequestSchema } from '@/app/types/dto';

const announcements = [
  {
    id: 'announce-001',
    title: '🎉 주말 특별 프로모션',
    content: '토요일, 일요일 18:00~22:00 시간당 추가 1,000원!',
    type: 'promotion',
    priority: 'high',
    startDate: '2025-01-11',
    endDate: '2025-01-19',
    isActive: true,
  },
  {
    id: 'announce-002',
    title: '⚠️ 센텀시티 도로 공사',
    content: '센텀시티 일대 도로 공사로 인한 우회로 안내',
    type: 'notice',
    priority: 'medium',
    startDate: '2025-01-14',
    endDate: '2025-01-20',
    isActive: true,
  },
  {
    id: 'announce-003',
    title: '💰 신규 인센티브 정책',
    content: '월 300건 이상 완료 시 보너스 10만원 지급',
    type: 'incentive',
    priority: 'high',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    isActive: true,
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // 요청 파라미터 검증
  const queryParams = {
    type: searchParams.get('type'),
    active: searchParams.get('active'), // 문자열로 처리
    priority: searchParams.get('priority'),
  };

  const validatedParams = GetAnnouncementsRequestSchema.parse(queryParams);

  let filteredAnnouncements = announcements;

  // 타입별 필터링
  if (validatedParams.type) {
    filteredAnnouncements = announcements.filter((announce) => announce.type === validatedParams.type);
  }

  // 활성 상태 필터링
  if (validatedParams.active === 'true') {
    filteredAnnouncements = filteredAnnouncements.filter((announce) => announce.isActive === true);
  } else if (validatedParams.active === 'false') {
    filteredAnnouncements = filteredAnnouncements.filter((announce) => announce.isActive === false);
  }

  // 우선순위별 필터링
  if (validatedParams.priority) {
    filteredAnnouncements = filteredAnnouncements.filter((announce) => announce.priority === validatedParams.priority);
  }

  const response = {
    success: true,
    data: filteredAnnouncements,
  };

  // dto 스키마로 응답 검증
  const validatedResponse = AnnouncementsResponseSchema.parse(response);

  return NextResponse.json(validatedResponse);
}
