import React from 'react';

// 기본 스켈레톤 컴포넌트
interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', width, height }) => {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} style={style} />;
};

// 텍스트 라인 스켈레톤
export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}> = ({ lines = 1, className = '', lastLineWidth = '75%' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} className="h-4" width={index === lines - 1 ? lastLineWidth : '100%'} />
      ))}
    </div>
  );
};

// 원형 스켈레톤 (아바타용)
export const SkeletonCircle: React.FC<{ size?: number; className?: string }> = ({ size = 40, className = '' }) => {
  return <Skeleton className={`rounded-full ${className}`} width={size} height={size} />;
};

// 카드 스켈레톤
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`p-4 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <SkeletonText lines={1} className="w-1/3" />
        <Skeleton className="h-6 w-16" />
      </div>
      <SkeletonText lines={3} />
    </div>
  );
};

// 오늘의 성과 스켈레톤
export const TodayStatsSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* 수입, 건수, 시간 */}
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex justify-between items-center">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      ))}

      {/* 목표 달성률 */}
      <div className="pt-2 space-y-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-8" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
};

// AI 핫스팟 스켈레톤
export const HotspotSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* 지도 영역 */}
      <Skeleton className="h-32 w-full rounded-lg" />

      {/* 핫스팟 리스트 */}
      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between p-2">
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
};

// 시간대별 예측 스켈레톤
export const PredictionSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-48" />

      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-2 w-16 rounded-full" />
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 공지사항 스켈레톤
export const AnnouncementSkeleton: React.FC = () => {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="p-3 space-y-2">
          <div className="flex items-start gap-3">
            <SkeletonCircle size={8} className="mt-2" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
