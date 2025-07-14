'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardCard from '@/app/components/common/DashboardCard';
import { LineChart, DonutChart, BarChart } from '@/app/components/charts';
import { getAnalytics } from '@/app/apis';
import { formatCurrency } from '@/app/utils';
import { WeeklyStat, MonthlyAnalysis, DayOfWeekStat } from '@/app/types';

type AnalyticsType = 'weekly' | 'monthly';

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsType>('weekly');

  const {
    data: analyticsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['analytics', selectedPeriod],
    queryFn: () => getAnalytics(selectedPeriod),
  });

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">수익 분석</h1>

          {/* 기간 선택 버튼 */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedPeriod('weekly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === 'weekly' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              주간
            </button>
            <button
              onClick={() => setSelectedPeriod('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              월간
            </button>
          </div>
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <DashboardCard key={i} title="로딩 중...">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </DashboardCard>
            ))}
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <DashboardCard title="오류">
            <p className="text-red-600">데이터를 불러오는 중 오류가 발생했습니다.</p>
          </DashboardCard>
        )}

        {/* 데이터가 있을 때 */}
        {analyticsData?.success && (
          <>
            {selectedPeriod === 'weekly' && <WeeklyAnalytics data={analyticsData.data as WeeklyStat[]} />}
            {selectedPeriod === 'monthly' && <MonthlyAnalytics data={analyticsData.data as MonthlyAnalysis} />}
          </>
        )}
      </div>
    </div>
  );
}

// 주간 분석 컴포넌트
function WeeklyAnalytics({ data }: { data: WeeklyStat[] }) {
  const weeklyStats = data;

  if (!weeklyStats) return null;

  const totalEarnings = weeklyStats.reduce((sum: number, stat: WeeklyStat) => sum + stat.earnings, 0);
  const totalDeliveries = weeklyStats.reduce((sum: number, stat: WeeklyStat) => sum + stat.deliveries, 0);
  const avgDailyEarnings = totalEarnings / weeklyStats.length;
  const avgDailyDeliveries = totalDeliveries / weeklyStats.length;

  return (
    <div className="space-y-6">
      {/* 요약 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="총 수익">
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalEarnings)}</div>
          <div className="text-sm text-gray-500">지난 7일</div>
        </DashboardCard>

        <DashboardCard title="총 배달 건수">
          <div className="text-2xl font-bold text-green-600">{totalDeliveries}건</div>
          <div className="text-sm text-gray-500">지난 7일</div>
        </DashboardCard>

        <DashboardCard title="일평균 수익">
          <div className="text-2xl font-bold text-purple-600">{formatCurrency(Math.round(avgDailyEarnings))}</div>
          <div className="text-sm text-gray-500">하루 평균</div>
        </DashboardCard>

        <DashboardCard title="일평균 배달">
          <div className="text-2xl font-bold text-orange-600">{Math.round(avgDailyDeliveries)}건</div>
          <div className="text-sm text-gray-500">하루 평균</div>
        </DashboardCard>
      </div>

      {/* 차트 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="일별 수익 추이">
          <LineChart
            data={weeklyStats.map((stat: WeeklyStat) => ({
              날짜: new Date(stat.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
              수익: stat.earnings,
            }))}
            index="날짜"
            categories={['수익']}
            colors={['blue-600']}
            height="h-80"
          />
        </DashboardCard>

        <DashboardCard title="주간 배달 건수 추이">
          <LineChart
            data={weeklyStats.map((stat: WeeklyStat) => ({
              날짜: new Date(stat.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
              배달건수: stat.deliveries,
            }))}
            index="날짜"
            categories={['배달건수']}
            colors={['emerald-500']}
            valueFormatter={(value: number) => `${value}건`}
            height="h-80"
          />
        </DashboardCard>
      </div>
    </div>
  );
}

// 월간 분석 컴포넌트
function MonthlyAnalytics({ data }: { data: MonthlyAnalysis }) {
  const monthlyData = data;

  if (!monthlyData) return null;

  const { currentMonth, lastMonth, dayOfWeekStats } = monthlyData;

  return (
    <div className="space-y-6">
      {/* 요약 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="이번 달 총 수익">
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(currentMonth.totalEarnings)}</div>
          <div className="text-sm text-gray-500">목표 달성률: {currentMonth.goalProgress}%</div>
        </DashboardCard>

        <DashboardCard title="이번 달 배달 건수">
          <div className="text-2xl font-bold text-green-600">{currentMonth.totalDeliveries}건</div>
          <div className="text-sm text-gray-500">근무일: {currentMonth.workingDays}일</div>
        </DashboardCard>

        <DashboardCard title="일평균 수익">
          <div className="text-2xl font-bold text-purple-600">{formatCurrency(currentMonth.avgDailyEarnings)}</div>
          <div className="text-sm text-gray-500">이번 달 평균</div>
        </DashboardCard>

        <DashboardCard title="전월 대비">
          <div className="text-2xl font-bold text-orange-600">
            {((currentMonth.avgDailyEarnings / lastMonth.avgDailyEarnings - 1) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500">일평균 수익 기준</div>
        </DashboardCard>
      </div>

      {/* 수익 구성 */}
      <DashboardCard title="수익 구성">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-600">{formatCurrency(currentMonth.earningsBreakdown.base)}</div>
            <div className="text-sm text-gray-600">기본료</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(currentMonth.earningsBreakdown.promo)}
            </div>
            <div className="text-sm text-gray-600">프로모션</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-xl font-bold text-purple-600">
              {formatCurrency(currentMonth.earningsBreakdown.tip)}
            </div>
            <div className="text-sm text-gray-600">팁</div>
          </div>
        </div>
      </DashboardCard>

      {/* 차트 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="요일별 평균 수익">
          <BarChart
            data={dayOfWeekStats.map((stat: DayOfWeekStat) => ({
              요일: stat.day,
              평균수익: stat.avgEarnings,
            }))}
            index="요일"
            categories={['평균수익']}
            colors={['blue-600']}
            height="h-80"
          />
        </DashboardCard>

        <DashboardCard title="수익 구성 비율">
          <DonutChart
            data={[
              { name: '기본료', value: currentMonth.earningsBreakdown.base },
              { name: '프로모션', value: currentMonth.earningsBreakdown.promo },
              { name: '팁', value: currentMonth.earningsBreakdown.tip },
            ]}
            category="value"
            index="name"
            colors={['blue-600', 'emerald-500', 'violet-500']}
            height="h-80"
          />
        </DashboardCard>
      </div>
    </div>
  );
}
