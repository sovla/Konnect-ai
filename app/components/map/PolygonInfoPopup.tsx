'use client';

import { CustomOverlayMap } from 'react-kakao-maps-sdk';

interface AIRecommendationReason {
  type: string;
  title: string;
  description: string;
  impact: string;
  confidence: number;
}

interface PolygonInfoPopupProps {
  name: string;
  expectedCalls: number;
  avgFee: number;
  confidence: number;
  reasons?: AIRecommendationReason[];
  position: { lat: number; lng: number };
  onClose: () => void;
}

export default function PolygonInfoPopup({
  name,
  expectedCalls,
  avgFee,
  confidence,
  reasons,
  position,
  onClose,
}: PolygonInfoPopupProps) {
  return (
    <CustomOverlayMap position={position}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[280px] max-w-[350px]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">{name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            ✕
          </button>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">예상 콜 수:</span>
            <span className="font-medium">{expectedCalls}건/시간</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">평균 배달료:</span>
            <span className="font-medium">{avgFee.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">신뢰도:</span>
            <span className="font-medium">{confidence}%</span>
          </div>
        </div>

        {/* AI 추천 이유 */}
        {reasons && reasons.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-900 mb-2">추천 이유</h4>
            <div className="space-y-2">
              {reasons.map((reason, index) => (
                <div key={index} className="text-xs bg-gray-50 rounded p-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-700">{reason.title}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs ${
                        reason.impact === 'high'
                          ? 'bg-red-100 text-red-700'
                          : reason.impact === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {reason.impact === 'high' ? '높음' : reason.impact === 'medium' ? '보통' : '낮음'}
                    </span>
                  </div>
                  <p className="text-gray-600">{reason.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            클릭한 위치: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
          </div>
        </div>
      </div>
    </CustomOverlayMap>
  );
}
