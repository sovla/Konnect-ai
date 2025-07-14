'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/app/store/authStore';
import { Skeleton } from '@/app/components/common/Skeleton';

interface RedirectIfAuthenticatedProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export default function RedirectIfAuthenticated({
  children,
  fallback,
  redirectTo = '/',
}: RedirectIfAuthenticatedProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    // 이미 인증된 경우 리다이렉트
    if (status === 'authenticated') {
      // URL에서 redirect 파라미터 확인
      const redirect = searchParams.get('redirect');
      const targetUrl =
        redirect && redirect !== '/auth/login' && redirect !== '/auth/register'
          ? decodeURIComponent(redirect)
          : redirectTo;

      router.push(targetUrl);
    }
  }, [status, router, redirectTo, searchParams]);

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

  // 이미 인증된 경우 리다이렉트 메시지 표시
  if (status === 'authenticated' && isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="bg-white shadow-lg rounded-lg p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">이미 로그인 되어 있습니다</h3>
            <p className="text-sm text-gray-500 mb-4">대시보드로 이동합니다...</p>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우 자식 컴포넌트 렌더링
  if (status === 'unauthenticated') {
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
