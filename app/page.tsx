'use client';

import { DashboardCard } from './components';
import { TrendingUp, MapPin, Clock, Bell } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">메인 대시보드</h1>
        <p className="text-gray-600">오늘도 좋은 하루 되세요, 김딜버님!</p>
      </div>

      {/* 4개 위젯 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 위젯 1: 오늘의 성과 */}
        <DashboardCard title="오늘의 성과" icon={TrendingUp}>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">실시간 총수입</span>
              <span className="text-2xl font-bold text-blue-600">₩112,500</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">완료 건수</span>
              <span className="text-lg font-semibold">25건</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">온라인 시간</span>
              <span className="text-lg font-semibold">06:30:45</span>
            </div>

            {/* 일일 목표 달성률 */}
            <div className="pt-2">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">일일 목표 달성률</span>
                <span className="font-medium text-green-600">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">목표까지 ₩37,500 남았습니다</p>
            </div>
          </div>
        </DashboardCard>

        {/* 위젯 2: AI 추천 핫스팟 */}
        <DashboardCard title="AI 추천 핫스팟" icon={MapPin}>
          <div className="space-y-4">
            <div className="bg-gray-100 h-32 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">카카오맵 미니맵</p>
                <p className="text-xs text-gray-400">추후 구현 예정</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                <span className="text-sm font-medium">해운대 센텀시티</span>
                <span className="text-xs text-red-600 font-medium">HOT</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                <span className="text-sm font-medium">서면 롯데백화점</span>
                <span className="text-xs text-orange-600 font-medium">WARM</span>
              </div>
            </div>
          </div>
        </DashboardCard>

        {/* 위젯 3: 시간대별 콜 예측 */}
        <DashboardCard title="시간대별 콜 예측" icon={Clock}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">지금부터 3시간 동안의 콜 예측</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">14:00 - 15:00</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-green-600">많음</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">15:00 - 16:00</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-yellow-600">보통</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">16:00 - 17:00</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-red-600">적음</span>
                </div>
              </div>
            </div>
          </div>
        </DashboardCard>

        {/* 위젯 4: 주요 공지 */}
        <DashboardCard title="주요 공지" icon={Bell}>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900">점심시간 프로모션 진행중!</h4>
                  <p className="text-sm text-blue-700 mt-1">12:00-14:00 기본료 +500원 추가 지급</p>
                  <p className="text-xs text-blue-600 mt-2">2시간 남음</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <h4 className="font-medium text-green-900">신규 배달존 오픈</h4>
                  <p className="text-sm text-green-700 mt-1">광안리 해변가 신규 오픈 기념 이벤트</p>
                  <p className="text-xs text-green-600 mt-2">7월 15일까지</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-900">정산 일정 안내</h4>
                  <p className="text-sm text-yellow-700 mt-1">이번 주 정산: 7월 18일 (목)</p>
                </div>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
