'use client';

import { useState } from 'react';
import DashboardCard from '@/app/components/common/DashboardCard';
import DeliveryTable from '@/app/components/common/DeliveryTable';
import { useDeliveries } from '@/app/hooks';
import { formatCurrency, getCurrentDate } from '@/app/utils';
import { CalendarDays, Package, Clock, TrendingUp } from 'lucide-react';

export default function HistoryPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'week' | 'month'>('all');

  // 배달 내역 데이터 조회
  const { data: deliveriesData, isLoading: isDeliveriesLoading } = useDeliveries({
    date: getCurrentDate().toISOString(),
    limit: 100,
  });

  const deliveries = deliveriesData?.success ? deliveriesData.data : [];

  // 요약 통계 계산
  const summaryStats = {
    totalDeliveries: deliveries.length,
    totalEarnings: deliveries.reduce((sum, delivery) => sum + delivery.earnings.total, 0),
    avgEarnings:
      deliveries.length > 0
        ? deliveries.reduce((sum, delivery) => sum + delivery.earnings.total, 0) / deliveries.length
        : 0,
    avgRating:
      deliveries.length > 0 ? deliveries.reduce((sum, delivery) => sum + delivery.rating, 0) / deliveries.length : 0,
  };

  // 기간별 데이터 필터링 (향후 구현용)
  const filteredDeliveries = deliveries; // 현재는 모든 데이터 표시

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">운행 이력</h1>
            <p className="text-gray-600 mt-1">과거 배달 내역을 조회하고 분석해보세요</p>
          </div>

          {/* 기간 필터 (향후 기능용) */}
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
              onClick={() => setSelectedPeriod('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
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
                <div className="text-2xl font-bold text-blue-600">{summaryStats.totalDeliveries}건</div>
                <div className="text-sm text-gray-500">전체 기간</div>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="총 수익">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(summaryStats.totalEarnings)}</div>
                <div className="text-sm text-gray-500">전체 기간</div>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="건당 평균 수익">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CalendarDays className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(Math.round(summaryStats.avgEarnings))}
                </div>
                <div className="text-sm text-gray-500">배달당 평균</div>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="평균 평점">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{summaryStats.avgRating.toFixed(1)}점</div>
                <div className="text-sm text-gray-500">고객 만족도</div>
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* 배달 내역 상세 테이블 */}
        <DashboardCard title="배달 내역 상세">
          <DeliveryTable deliveries={filteredDeliveries} loading={isDeliveriesLoading} />
        </DashboardCard>
      </div>
    </div>
  );
}
