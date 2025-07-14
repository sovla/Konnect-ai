'use client';

import React, { Suspense, ReactNode, ErrorInfo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

// 로딩 컴포넌트
interface LoadingFallbackProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  skeleton?: ReactNode;
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = '데이터를 불러오는 중...',
  size = 'md',
  skeleton,
}) => {
  // 스켈레톤이 제공되면 스켈레톤을 사용
  if (skeleton) {
    return <>{skeleton}</>;
  }

  // 기본 로딩 스피너
  const sizeClasses = {
    sm: 'h-16',
    md: 'h-20',
    lg: 'h-32',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${sizeClasses[size]}`}>
      <Loader2 className={`${iconSizes[size]} animate-spin text-blue-500 mb-2`} />
      <span className="text-sm text-gray-500">{message}</span>
    </div>
  );
};

// 에러 컴포넌트
interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  message?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  message = '데이터를 불러오는데 실패했습니다',
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-20 p-4">
      <div className="flex items-center text-red-500 mb-3">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span className="text-sm font-medium">{message}</span>
      </div>

      <button
        onClick={resetErrorBoundary}
        className="flex items-center gap-2 px-3 py-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors"
      >
        <RefreshCw className="w-3 h-3" />
        다시 시도
      </button>

      {process.env.NODE_ENV === 'development' && (
        <details className="mt-2 text-xs text-gray-500">
          <summary className="cursor-pointer">에러 상세</summary>
          <pre className="mt-1 text-xs">{error.message}</pre>
        </details>
      )}
    </div>
  );
};

// 데이터 래퍼 컴포넌트 Props
interface DataWrapperProps {
  children: ReactNode;
  loadingMessage?: string;
  errorMessage?: string;
  loadingSize?: 'sm' | 'md' | 'lg';
  loadingSkeleton?: ReactNode;
  onError?: (error: Error) => void;
  onRetry?: () => void;
}

// 메인 데이터 래퍼 컴포넌트
export const DataWrapper: React.FC<DataWrapperProps> = ({
  children,
  loadingMessage,
  errorMessage,
  loadingSize = 'md',
  loadingSkeleton,
  onError,
  onRetry,
}) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error('DataWrapper Error:', error, errorInfo);
    onError?.(error);
  };

  const handleRetry = () => {
    onRetry?.();
  };

  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ErrorFallback
          error={error}
          resetErrorBoundary={() => {
            resetErrorBoundary();
            handleRetry();
          }}
          message={errorMessage}
        />
      )}
      onError={handleError}
      resetKeys={[children]}
    >
      <Suspense fallback={<LoadingFallback message={loadingMessage} size={loadingSize} skeleton={loadingSkeleton} />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

// React Query와 함께 사용하기 위한 특별한 래퍼
interface QueryWrapperProps<T> {
  query: {
    data: T | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
  children: (data: T) => ReactNode;
  loadingMessage?: string;
  errorMessage?: string;
  loadingSize?: 'sm' | 'md' | 'lg';
  loadingSkeleton?: ReactNode;
}

export function QueryWrapper<T>({
  query,
  children,
  loadingMessage,
  errorMessage,
  loadingSize = 'md',
  loadingSkeleton,
}: QueryWrapperProps<T>) {
  const { data, isLoading, error, refetch } = query;

  if (isLoading) {
    return <LoadingFallback message={loadingMessage} size={loadingSize} skeleton={loadingSkeleton} />;
  }

  if (error) {
    return <ErrorFallback error={error} resetErrorBoundary={refetch} message={errorMessage} />;
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-20 text-gray-500">
        <span className="text-sm">데이터가 없습니다</span>
      </div>
    );
  }

  return <>{children(data)}</>;
}

export default DataWrapper;
