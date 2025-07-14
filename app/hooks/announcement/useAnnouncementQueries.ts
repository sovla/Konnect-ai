import { useQuery } from '@tanstack/react-query';
import { getAnnouncements } from '@/app/apis';

// Query Keys 상수 정의
export const ANNOUNCEMENT_QUERY_KEYS = {
  ANNOUNCEMENTS: 'announcements',
} as const;

// 공지사항 조회
export const useAnnouncements = (params?: { type?: string; active?: boolean }) => {
  return useQuery({
    queryKey: [ANNOUNCEMENT_QUERY_KEYS.ANNOUNCEMENTS, params],
    queryFn: () => getAnnouncements(params),
    // 공지사항은 5분간 fresh 상태 유지
    staleTime: 1000 * 60 * 5,
  });
};
