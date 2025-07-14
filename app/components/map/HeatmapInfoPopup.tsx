'use client';

import { CustomOverlayMap } from 'react-kakao-maps-sdk';

interface HeatmapInfoPopupProps {
  recentOrders: number;
  avgWaitTime: number;
  hourlyTrend: 'rising' | 'stable' | 'falling' | 'empty';
  position: { lat: number; lng: number };
  onClose: () => void;
}

export default function HeatmapInfoPopup({
  recentOrders,
  avgWaitTime,
  hourlyTrend,
  position,
  onClose,
}: HeatmapInfoPopupProps) {
  return (
    <CustomOverlayMap position={position}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[200px]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">실시간 주문 현황</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            ✕
          </button>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">최근 30분 주문:</span>
            <span className="font-medium">{recentOrders}건</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">평균 대기시간:</span>
            <span className="font-medium">{avgWaitTime}분</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">시간대 트렌드:</span>
            <span
              className={`font-medium ${
                hourlyTrend === 'rising'
                  ? 'text-red-600'
                  : hourlyTrend === 'stable'
                  ? 'text-orange-600'
                  : hourlyTrend === 'falling'
                  ? 'text-green-600'
                  : 'text-gray-600'
              }`}
            >
              {hourlyTrend === 'rising'
                ? '매우 증가'
                : hourlyTrend === 'stable'
                ? '안정'
                : hourlyTrend === 'falling'
                ? '감소'
                : '없음'}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-blue-600 font-medium">💡 이 지역은 지금 주문이 활발합니다</div>
        </div>
      </div>
    </CustomOverlayMap>
  );
}
