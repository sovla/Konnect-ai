'use client';

import {
  DashboardCard,
  QueryWrapper,
  TodayStatsSkeleton,
  HotspotSkeleton,
  PredictionSkeleton,
  AnnouncementSkeleton,
  DashboardLayout,
  KakaoMap,
} from './components';
import { TrendingUp, MapPin, Clock, Bell } from 'lucide-react';
import { formatCurrency } from './utils/dateHelpers';
import { useAIPredictions } from '@/app/hooks/ai';
import { useTodayStats } from '@/app/hooks/stats';
import { useAnnouncements } from '@/app/hooks/announcement';

export default function Dashboard() {
  // API 데이터 훅들
  const todayStatsQuery = useTodayStats();
  const aiPredictionsQuery = useAIPredictions('predictions');
  const hourlyPredictionsQuery = useAIPredictions('hourly');
  const announcementsQuery = useAnnouncements({ active: true });

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">메인 대시보드</h1>
          <p className="text-gray-600">오늘도 좋은 하루 되세요, 김딜버님!</p>
        </div>

        {/* 4개 위젯 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 위젯 1: 오늘의 성과 */}
          <DashboardCard title="오늘의 성과" icon={TrendingUp}>
            <QueryWrapper
              query={todayStatsQuery}
              loadingMessage="성과 데이터 로딩 중..."
              errorMessage="성과 데이터를 불러올 수 없습니다"
              loadingSkeleton={<TodayStatsSkeleton />}
            >
              {(data) => (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">실시간 총수입</span>
                    <span className="text-2xl font-bold text-blue-600">{formatCurrency(data.data.totalEarnings)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">완료 건수</span>
                    <span className="text-lg font-semibold">{data.data.completedDeliveries}건</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">온라인 시간</span>
                    <span className="text-lg font-semibold">{data.data.onlineTime}</span>
                  </div>

                  {/* 일일 목표 달성률 */}
                  <div className="pt-2">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">일일 목표 달성률</span>
                      <span className="font-medium text-green-600">{data.data.goalProgress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${Math.min(data.data.goalProgress, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      건당 평균: {formatCurrency(data.data.avgEarningsPerDelivery)}
                    </p>
                  </div>
                </div>
              )}
            </QueryWrapper>
          </DashboardCard>

          {/* 위젯 2: AI 추천 핫스팟 */}
          <DashboardCard title="AI 추천 핫스팟" icon={MapPin}>
            <QueryWrapper
              query={aiPredictionsQuery}
              loadingMessage="핫스팟 데이터 로딩 중..."
              errorMessage="핫스팟 데이터를 불러올 수 없습니다"
              loadingSkeleton={<HotspotSkeleton />}
            >
              {(data) => (
                <div className="space-y-4">
                  {/* 카카오 미니맵 */}
                  <div className="h-32">
                    <KakaoMap
                      width="100%"
                      height="128px"
                      miniMode={true}
                      showCurrentLocation={true}
                      className="rounded-lg"
                    />
                  </div>
                  {/* 핫스팟 리스트 */}
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 mb-2">🔥 현재 시간대 AI 추천 핫스팟</p>
                    {data.data[0]?.polygons.slice(0, 2).map((polygon, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-2 rounded ${
                          index === 0 ? 'bg-red-50' : 'bg-orange-50'
                        }`}
                      >
                        <div>
                          <span className="text-sm font-medium">{polygon.name}</span>
                          <p className="text-xs text-gray-500">
                            예상 콜: {polygon.expectedCalls}건/시간 | 평균료: {formatCurrency(polygon.avgFee)}
                          </p>
                        </div>
                        <span className={`text-xs font-medium ${index === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                          {index === 0 ? 'HOT' : 'WARM'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </QueryWrapper>
          </DashboardCard>

          {/* 위젯 3: 시간대별 콜 예측 */}
          <DashboardCard title="시간대별 콜 예측" icon={Clock}>
            <QueryWrapper
              query={hourlyPredictionsQuery}
              loadingMessage="예측 데이터 로딩 중..."
              errorMessage="예측 데이터를 불러올 수 없습니다"
              loadingSkeleton={<PredictionSkeleton />}
            >
              {(data) => (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">지금부터 3시간 동안의 콜 예측</p>

                  <div className="space-y-3">
                    {data.data.slice(0, 3).map((prediction) => {
                      const level =
                        prediction.expectedCalls > 10 ? 'high' : prediction.expectedCalls > 6 ? 'medium' : 'low';
                      const levelText = level === 'high' ? '많음' : level === 'medium' ? '보통' : '적음';
                      const levelColor = level === 'high' ? 'green' : level === 'medium' ? 'yellow' : 'red';
                      const progressWidth = Math.min((prediction.expectedCalls / 15) * 100, 100);

                      return (
                        <div key={prediction.hour} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            {prediction.hour}:00 - {prediction.hour + 1}:00
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`bg-${levelColor}-500 h-2 rounded-full`}
                                style={{ width: `${progressWidth}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-medium text-${levelColor}-600`}>{levelText}</span>
                            <span className="text-xs text-gray-500 ml-1">({prediction.expectedCalls}건)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </QueryWrapper>
          </DashboardCard>

          {/* 위젯 4: 주요 공지 */}
          <DashboardCard title="주요 공지" icon={Bell}>
            <QueryWrapper
              query={announcementsQuery}
              loadingMessage="공지사항 로딩 중..."
              errorMessage="공지사항을 불러올 수 없습니다"
              loadingSkeleton={<AnnouncementSkeleton />}
            >
              {(data) => (
                <div className="space-y-3">
                  {data.data.slice(0, 3).map((announcement) => {
                    const bgColor =
                      announcement.type === 'promotion'
                        ? 'blue'
                        : announcement.type === 'incentive'
                        ? 'green'
                        : 'yellow';

                    return (
                      <div
                        key={announcement.id}
                        className={`p-3 bg-${bgColor}-50 border border-${bgColor}-200 rounded-lg`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 bg-${bgColor}-500 rounded-full mt-2`}></div>
                          <div className="flex-1">
                            <h4 className={`font-medium text-${bgColor}-900`}>{announcement.title}</h4>
                            <p className={`text-sm text-${bgColor}-700 mt-1`}>{announcement.content}</p>
                            <p className={`text-xs text-${bgColor}-600 mt-2`}>{announcement.endDate}까지</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </QueryWrapper>
          </DashboardCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
