'use client';

import { useState } from 'react';
import { KakaoMap } from '../../components';
import { useUIStore } from '../../store/uiStore';
import { ToggleLeft, ToggleRight, MapPin, Clock, Zap } from 'lucide-react';

export default function AIZonesPage() {
  const [selectedTab, setSelectedTab] = useState<'realtime' | 'prediction'>('realtime');

  // 상태 관리
  const { mapFilters, toggleRealTimeHeatmap, toggleAIPredictions, setTimeSlot } = useUIStore();

  const timeSlots = [
    { hour: 13, label: '13:00' },
    { hour: 14, label: '14:00' },
    { hour: 15, label: '15:00' },
    { hour: 16, label: '16:00' },
    { hour: 17, label: '17:00' },
    { hour: 18, label: '18:00' },
    { hour: 19, label: '19:00' },
    { hour: 20, label: '20:00' },
    { hour: 21, label: '21:00' },
    { hour: 22, label: '22:00' },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI 추천 운행 존</h1>
            <p className="text-gray-600">실시간 주문 현황과 AI 예측 정보를 확인하세요</p>
          </div>

          {/* 탭 버튼 */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedTab('realtime')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTab === 'realtime' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MapPin className="w-4 h-4 inline-block mr-2" />
              실시간
            </button>
            <button
              onClick={() => setSelectedTab('prediction')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTab === 'prediction' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Zap className="w-4 h-4 inline-block mr-2" />
              AI 예측
            </button>
          </div>
        </div>
      </div>

      {/* 필터 컨트롤 */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* 필터 토글 */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button onClick={toggleRealTimeHeatmap} className="flex items-center gap-2 text-sm">
                {mapFilters.showRealTimeHeatmap ? (
                  <ToggleRight className="w-5 h-5 text-blue-500" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-gray-400" />
                )}
                <span className={mapFilters.showRealTimeHeatmap ? 'text-gray-900' : 'text-gray-500'}>
                  실시간 히트맵
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={toggleAIPredictions} className="flex items-center gap-2 text-sm">
                {mapFilters.showAIPredictions ? (
                  <ToggleRight className="w-5 h-5 text-blue-500" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-gray-400" />
                )}
                <span className={mapFilters.showAIPredictions ? 'text-gray-900' : 'text-gray-500'}>AI 예측 폴리곤</span>
              </button>
            </div>
          </div>

          {/* 시간대 슬라이더 */}
          {selectedTab === 'prediction' && (
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">시간대:</span>
              <div className="flex gap-1 overflow-x-auto">
                {timeSlots.map(({ hour, label }) => (
                  <button
                    key={hour}
                    onClick={() => setTimeSlot(hour)}
                    className={`px-3 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
                      mapFilters.selectedTimeSlot === hour
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 지도 영역 */}
      <div className="flex-1 p-6">
        <div className="h-full bg-white rounded-lg shadow-sm overflow-hidden">
          <KakaoMap width="100%" height="100%" className="h-full" />
        </div>
      </div>

      {/* 범례 */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex flex-wrap items-center gap-6 text-xs text-gray-600">
          {mapFilters.showRealTimeHeatmap && (
            <div className="flex items-center gap-4">
              <span className="font-medium">실시간 히트맵:</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded opacity-70"></div>
                <span>높음</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded opacity-70"></div>
                <span>보통</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded opacity-70"></div>
                <span>낮음</span>
              </div>
            </div>
          )}

          {mapFilters.showAIPredictions && (
            <div className="flex items-center gap-4">
              <span className="font-medium">AI 예측:</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-green-500 bg-green-100 rounded"></div>
                <span>추천 운행 존</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
