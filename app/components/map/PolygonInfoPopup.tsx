'use client';

import { CustomOverlayMap } from 'react-kakao-maps-sdk';
import { PredictionReason } from '../../types/dto';
import { Phone, DollarSign, BarChart, Lightbulb } from 'lucide-react';

interface HourlyPredictionInfo {
  hour: number;
  expectedCalls: number;
  avgFee: number;
  confidence: number;
}

interface PolygonInfoPopupProps {
  name: string;
  hourlyPredictions: HourlyPredictionInfo[];
  reasons?: PredictionReason[];
  position: { lat: number; lng: number };
  onClose: () => void;
}

export default function PolygonInfoPopup({
  name,
  hourlyPredictions,
  reasons,
  position,
  onClose,
}: PolygonInfoPopupProps) {
  return (
    <CustomOverlayMap position={position}>
      <div className="bg-white rounded-lg shadow-2xl border border-gray-100 p-4 w-[350px] text-gray-800">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-lg text-gray-900 pr-4">{name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            ✕
          </button>
        </div>

        <div className="space-y-2 text-sm">
          {hourlyPredictions
            .sort((a, b) => a.hour - b.hour)
            .map((pred) => (
              <div key={pred.hour} className="bg-gray-50/80 rounded-md p-3 border border-gray-200/50">
                <p className="font-bold text-blue-600 mb-2.5">
                  {String(pred.hour).padStart(2, '0')}:00 - {String(pred.hour + 1).padStart(2, '0')}:00
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <Phone className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      예상 콜 수:
                    </span>
                    <span className="font-semibold text-gray-900">{pred.expectedCalls}건</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <DollarSign className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      평균 배달료:
                    </span>
                    <span className="font-semibold text-gray-900">{pred.avgFee.toLocaleString()}원</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <BarChart className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      신뢰도:
                    </span>
                    <span className="font-semibold text-gray-900">{pred.confidence}%</span>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* AI 추천 이유 */}
        {reasons && reasons.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
              <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
              AI 추천 분석
            </h4>
            <div className="space-y-1.5 text-xs">
              {reasons.map((reason, index) => (
                <div key={index} className="bg-gray-50/80 rounded p-2 border border-gray-200/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-700">{reason.title}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                        reason.impact === 'high'
                          ? 'bg-red-100 text-red-800'
                          : reason.impact === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {reason.impact === 'high' ? '영향 높음' : reason.impact === 'medium' ? '영향 보통' : '영향 낮음'}
                    </span>
                  </div>
                  <p className="text-gray-600">{reason.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CustomOverlayMap>
  );
}
