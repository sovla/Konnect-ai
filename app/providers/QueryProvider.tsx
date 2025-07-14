'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 데이터가 5분 동안 fresh 상태로 유지
            staleTime: 1000 * 60 * 5,
            // 캐시된 데이터를 10분 동안 보관
            gcTime: 1000 * 60 * 10,
            // 에러 발생 시 3번까지 재시도
            retry: 3,
            // 컴포넌트가 다시 포커스될 때 자동으로 refetch하지 않음
            refetchOnWindowFocus: false,
            // 네트워크 재연결 시 자동 refetch
            refetchOnReconnect: true,
          },
          mutations: {
            // mutation 에러 발생 시 2번까지 재시도
            retry: 2,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 개발 환경에서만 DevTools 표시 */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
