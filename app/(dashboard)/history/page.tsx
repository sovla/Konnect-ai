'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import DashboardCard from '@/app/components/common/DashboardCard';
import DeliveryTable from '@/app/components/common/DeliveryTable';
import { useDeliveriesInfinite, useDeliveryStats } from '@/app/hooks/delivery/useDeliveryQueries';
import { formatCurrency } from '@/app/utils';
import { CalendarDays, Package, Clock, TrendingUp, Loader2 } from 'lucide-react';

export default function HistoryPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | '7days' | 'month'>('all');
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 배달 내역 조회 (무한 스크롤), 기간이 변경되면 쿼리 다시 실행
  const {
    data: deliveriesData,
    isLoading: isDeliveriesLoading,
    isError: isDeliveriesError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDeliveriesInfinite({
    period: selectedPeriod,
    limit: 100,
  });

  // 통계 정보 조회 (기간별)
  const { data: statsData, isLoading: isStatsLoading } = useDeliveryStats(selectedPeriod);

  const stats = statsData?.data || { totalDeliveries: 0, totalEarnings: 0, avgEarningsPerDelivery: 0, avgRating: 0 };

  // 모든 페이지의 배달 데이터를 하나의 배열로 합치기
  const allDeliveries = useMemo(() => deliveriesData?.pages.flatMap((page) => page.data) || [], [deliveriesData]);

  // 총 배달 건수는 통계 데이터에서 가져옴
  const totalDeliveriesCount = stats.totalDeliveries;

  // 무한 스크롤 Intersection Observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    const currentRef = loadMoreRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [handleObserver]);

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">운행 이력</h1>
            <p className="text-gray-600 mt-1">과거 배달 내역을 조회하고 분석해보세요</p>
          </div>

          {/* 기간 필터 */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedPeriod('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setSelectedPeriod('7days')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === '7days' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              최근 7일
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              이번 달
            </button>
          </div>
        </div>

        {/* 요약 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard title="총 배달 건수">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                {isStatsLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-blue-600">{totalDeliveriesCount}건</div>
                    <div className="text-sm text-gray-500">
                      {selectedPeriod === 'all' ? '전체 기간' : selectedPeriod === '7days' ? '최근 7일' : '이번 달'}
                    </div>
                  </>
                )}
              </div>
            </div>
          </DashboardCard>
          <DashboardCard title="총 수익">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                {isStatsLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalEarnings)}</div>
                    <div className="text-sm text-gray-500">
                      {selectedPeriod === 'all' ? '전체 기간' : selectedPeriod === '7days' ? '최근 7일' : '이번 달'}
                    </div>
                  </>
                )}
              </div>
            </div>
          </DashboardCard>
          <DashboardCard title="건당 평균 수익">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CalendarDays className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                {isStatsLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-purple-600">
                      {formatCurrency(stats.avgEarningsPerDelivery)}
                    </div>
                    <div className="text-sm text-gray-500">배달당 평균</div>
                  </>
                )}
              </div>
            </div>
          </DashboardCard>
          <DashboardCard title="평균 평점">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                {isStatsLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-orange-600">{stats.avgRating?.toFixed(1) || 0}점</div>
                    <div className="text-sm text-gray-500">고객 만족도</div>
                  </>
                )}
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* 배달 내역 상세 테이블 */}
        <DashboardCard title="배달 내역 상세">
          <div className="space-y-4">
            {isDeliveriesError && (
              <div className="text-center py-8 text-red-600">데이터를 불러오는 중 오류가 발생했습니다.</div>
            )}
            {!isDeliveriesError && (
              <>
                <DeliveryTable
                  deliveries={allDeliveries}
                  loading={isDeliveriesLoading && allDeliveries.length === 0}
                  totalDeliveriesCount={totalDeliveriesCount}
                />
                <div ref={loadMoreRef} className="py-4">
                  {isFetchingNextPage && (
                    <div className="flex justify-center items-center">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="ml-2 text-gray-600">더 많은 데이터를 불러오는 중...</span>
                    </div>
                  )}
                  {!hasNextPage && allDeliveries.length > 0 && (
                    <div className="text-center text-gray-500 py-4">모든 배달 내역을 불러왔습니다.</div>
                  )}
                </div>
              </>
            )}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
