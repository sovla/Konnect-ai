'use client';

import { useEffect, useMemo } from 'react';
import { KakaoMap } from '../../components';
import { useUIStore } from '../../store/uiStore';
import { ToggleLeft, ToggleRight, Clock, Lightbulb } from 'lucide-react';
import { useAIPredictions } from '../../hooks';

export default function AIZonesPage() {
  const { mapFilters, toggleRealTimeHeatmap, toggleAIPredictions, setTimeSlot } = useUIStore();
  const { data: predictionsResponse } = useAIPredictions('predictions');

  const timeSlots = useMemo(() => {
    return [
      { start: 0, end: 3, label: '00-03시' },
      { start: 3, end: 6, label: '03-06시' },
      { start: 6, end: 9, label: '06-09시' },
      { start: 9, end: 12, label: '09-12시' },
      { start: 12, end: 15, label: '12-15시' },
      { start: 15, end: 18, label: '15-18시' },
      { start: 18, end: 21, label: '18-21시' },
      { start: 21, end: 24, label: '21-24시' },
    ];
  }, []);

  const availableTimeSlots = useMemo(() => {
    if (!predictionsResponse?.data) return [];
    const availableHours = new Set(
      predictionsResponse.data.filter((p) => p.polygons.length > 0).map((p) => parseInt(p.time.split(':')[0], 10)),
    );
    return timeSlots.filter((slot) => {
      for (let i = slot.start; i < slot.end; i++) {
        if (availableHours.has(i)) return true;
      }
      return false;
    });
  }, [predictionsResponse, timeSlots]);

  useEffect(() => {
    if (!mapFilters.showAIPredictions) {
      toggleAIPredictions();
    }
    if (mapFilters.selectedTimeSlot === null && availableTimeSlots.length > 0) {
      const currentHour = new Date().getHours();
      const defaultSlot =
        availableTimeSlots.find((slot) => currentHour >= slot.start && currentHour < slot.end) || availableTimeSlots[0];
      setTimeSlot(defaultSlot);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableTimeSlots]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 컨트롤 패널 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI 추천 운행 존</h1>
            <p className="mt-1 text-gray-600">
              실시간 주문 현황과 AI 예측 정보를 바탕으로 최적의 운행 지역을 찾아보세요.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-3 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p>
                <strong>AI 예측 폴리곤</strong>을 활성화하여 시간대별 추천 운행 지역을 확인하세요.{' '}
                <strong>실시간 히트맵</strong>을 함께 켜면 현재 주문 밀집도와 비교하며 더 효과적인 운행 계획을 세울 수
                있습니다.
              </p>
            </div>
          </div>

          {/* 필터 컨트롤 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <button onClick={toggleRealTimeHeatmap} className="flex items-center gap-2 text-sm font-medium">
                  {mapFilters.showRealTimeHeatmap ? (
                    <ToggleRight className="w-6 h-6 text-blue-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-400" />
                  )}
                  <span className={mapFilters.showRealTimeHeatmap ? 'text-gray-900' : 'text-gray-500'}>
                    실시간 히트맵
                  </span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={toggleAIPredictions} className="flex items-center gap-2 text-sm font-medium">
                  {mapFilters.showAIPredictions ? (
                    <ToggleRight className="w-6 h-6 text-blue-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-400" />
                  )}
                  <span className={mapFilters.showAIPredictions ? 'text-gray-900' : 'text-gray-500'}>
                    AI 예측 폴리곤
                  </span>
                </button>
              </div>
            </div>
            <div className="w-full  h-px sm:h-6 sm:w-px bg-gray-200"></div>
            {/* 시간대 슬라이더 */}
            {mapFilters.showAIPredictions && (
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-700 font-medium whitespace-nowrap">예측 시간:</span>
                <div className="flex gap-1 overflow-x-auto pb-1.5 -mb-1.5">
                  {timeSlots.map((slot) => {
                    const isAvailable = availableTimeSlots.some((s) => s.start === slot.start);
                    return (
                      <button
                        key={slot.label}
                        onClick={() => isAvailable && setTimeSlot(slot)}
                        disabled={!isAvailable}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all duration-200 ${
                          mapFilters.selectedTimeSlot?.start === slot.start
                            ? 'bg-blue-600 text-white shadow-md'
                            : isAvailable
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 지도 영역 */}
      <div className="flex-1 p-4 sm:p-6">
        <div className="h-full w-full bg-white rounded-lg shadow-sm overflow-hidden">
          <KakaoMap width="100%" height="100%" className="h-full w-full" />
        </div>
      </div>

      {/* 범례 */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-600">
          <span className="text-sm font-bold">범례:</span>
          {mapFilters.showAIPredictions && (
            <div className="flex items-center gap-4">
              <span className="font-medium">AI 예측:</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-green-500 bg-green-100 rounded"></div>
                <span>추천 운행 존</span>
              </div>
            </div>
          )}
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
        </div>
      </div>
    </div>
  );
}
