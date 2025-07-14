import { useSession, signOut } from 'next-auth/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  // 로그아웃 뮤테이션
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await signOut({
        redirect: false,
        callbackUrl: '/auth/login',
      });
    },
    onSuccess: () => {
      // 모든 쿼리 캐시 클리어
      queryClient.clear();

      // 로그인 페이지로 리다이렉트
      router.push('/auth/login');
    },
    onError: (error) => {
      console.error('로그아웃 실패:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    },
  });

  // 사용자 정보 포맷팅
  const user = session?.user
    ? {
        id: session.user.id,
        name: session.user.name || '사용자',
        email: session.user.email || '',
        phone: session.user.phone || '',
        riderProfile: session.user.riderProfile || null,
      }
    : null;

  // 라이더 정보
  const riderInfo = user?.riderProfile
    ? {
        riderId: `DR-${String(user.riderProfile.id).padStart(3, '0')}`,
        vehicleType: user.riderProfile.vehicleType,
        isOnline: user.riderProfile.isOnline,
        averageRating: user.riderProfile.averageRating,
        totalDeliveries: user.riderProfile.totalDeliveries,
      }
    : null;

  return {
    // 상태
    user,
    riderInfo,
    isAuthenticated: !!session,
    isLoading: status === 'loading',

    // 함수
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,

    // 원본 세션 (필요시)
    session,
  };
}

// 알림 관련 훅
export function useNotifications() {
  // 실제로는 API에서 가져와야 하지만 현재는 Mock 데이터
  const notifications = [
    {
      id: 1,
      type: 'promotion',
      title: '새로운 프로모션이 시작되었습니다!',
      time: '2분 전',
      color: 'blue',
    },
    {
      id: 2,
      type: 'prediction',
      title: '해운대 지역 콜량 증가 예측',
      time: '10분 전',
      color: 'green',
    },
    {
      id: 3,
      type: 'achievement',
      title: '일일 수익 목표 75% 달성!',
      time: '1시간 전',
      color: 'orange',
    },
  ];

  return {
    notifications,
    unreadCount: notifications.length,
  };
}
