'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/app/store/authStore';
import { Skeleton } from '@/app/components/common/Skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({ children, fallback, redirectTo = '/auth/login' }: ProtectedRouteProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { isAuthenticated, setSession, setLoading } = useAuthStore();

  useEffect(() => {
    // 세션 상태를 Zustand 스토어에 동기화
    if (status !== 'loading') {
      setSession(session);
      setLoading(false);
    }
  }, [session, status, setSession, setLoading]);

  useEffect(() => {
    // 인증되지 않은 경우 리다이렉트
    if (status === 'unauthenticated') {
      const currentPath = window.location.pathname;
      const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
      router.push(redirectUrl);
    }
  }, [status, router, redirectTo]);

  // 로딩 중
  if (status === 'loading') {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full space-y-4">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">로딩 중...</h3>
              <p className="text-sm text-gray-500">사용자 인증을 확인하고 있습니다.</p>
            </div>
            {/* 스켈레톤 UI */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>
      )
    );
  }

  // 인증되지 않은 경우
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="bg-white shadow-lg rounded-lg p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">로그인이 필요합니다</h3>
            <p className="text-sm text-gray-500 mb-4">이 페이지에 접근하려면 로그인이 필요합니다.</p>
            <button
              onClick={() => router.push(redirectTo)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              로그인하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 인증된 경우 자식 컴포넌트 렌더링
  if (status === 'authenticated' && isAuthenticated) {
    return <>{children}</>;
  }

  // 기본 fallback
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500">페이지를 로드하고 있습니다...</p>
      </div>
    </div>
  );
}
