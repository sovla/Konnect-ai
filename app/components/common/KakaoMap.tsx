'use client';

import { Map, useKakaoLoader, MapMarker, Polygon, CustomOverlayMap } from 'react-kakao-maps-sdk';
import { useMapStore } from '../../store/mapStore';
import { useUIStore } from '../../store/uiStore';
import { useAIPredictions } from '../../hooks';
import { useState } from 'react';

interface KakaoMapProps {
  width?: string;
  height?: string;
  className?: string;
}

interface PolygonClickInfo {
  name: string;
  expectedCalls: number;
  avgFee: number;
  confidence: number;
  position: { lat: number; lng: number };
}

export default function KakaoMap({ width = '100%', height = '400px', className = '' }: KakaoMapProps) {
  // Zustand 상태
  const { center, zoom, setCenter, setZoom } = useMapStore();
  const { mapFilters } = useUIStore();

  // 폴리곤 클릭 정보 상태
  const [clickedPolygonInfo, setClickedPolygonInfo] = useState<PolygonClickInfo | null>(null);

  // 히트맵 데이터 조회
  const { data: heatmapResponse } = useAIPredictions('heatmap');
  const heatmapData = heatmapResponse?.data || [];

  // AI 예측 폴리곤 데이터 조회
  const { data: predictionsResponse } = useAIPredictions('predictions');
  const predictionsData = predictionsResponse?.data || [];

  // 현재 선택된 시간대의 폴리곤 데이터 필터링
  const currentPolygons =
    predictionsData.find((prediction) => prediction.time === `${mapFilters.selectedTimeSlot}:00`)?.polygons || [];

  // 카카오맵 API 로더
  const [loading, error] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || '',
    libraries: ['services', 'clusterer', 'drawing'],
  });

  // 히트맵 오버레이 컴포넌트
  const HeatmapOverlay = ({ weight }: { weight: number }) => {
    const size = Math.max(20, weight * 50); // 가중치에 따른 크기 조절
    const opacity = Math.max(0.3, weight); // 가중치에 따른 투명도 조절

    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          backgroundColor: weight > 0.7 ? '#ff4444' : weight > 0.4 ? '#ffaa00' : '#4488ff',
          opacity,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />
    );
  };

  // 폴리곤 클릭 이벤트 핸들러
  const handlePolygonClick = (
    polygon: { name: string; expectedCalls: number; avgFee: number; confidence: number },
    event: { latLng: { getLat: () => number; getLng: () => number } },
  ) => {
    const clickPosition = event.latLng;
    setClickedPolygonInfo({
      name: polygon.name,
      expectedCalls: polygon.expectedCalls,
      avgFee: polygon.avgFee,
      confidence: polygon.confidence,
      position: {
        lat: clickPosition.getLat(),
        lng: clickPosition.getLng(),
      },
    });
  };

  // 폴리곤 정보 팝업 닫기
  const closePolygonInfo = () => {
    setClickedPolygonInfo(null);
  };

  // 로딩 중
  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <div style={{ width, height }} className="flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">지도를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg ${className}`}
        style={{ width, height }}
      >
        <div className="text-center p-4">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-gray-600 text-sm">
            지도를 불러오는 중 오류가 발생했습니다.
            <br />
            API 키를 확인해주세요.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Map
        center={{
          lat: center.lat,
          lng: center.lng,
        }}
        style={{
          width,
          height,
        }}
        level={zoom}
        onCenterChanged={(map) => {
          const newCenter = map.getCenter();
          setCenter(newCenter.getLat(), newCenter.getLng());
        }}
        onZoomChanged={(map) => {
          const newLevel = map.getLevel();
          setZoom(newLevel);
        }}
        className="rounded-lg overflow-hidden shadow-sm border border-gray-200"
      >
        {/* 현재 위치 마커 (예시) */}
        <MapMarker
          position={{
            lat: center.lat,
            lng: center.lng,
          }}
        />

        {/* 실시간 히트맵 표시 */}
        {mapFilters.showRealTimeHeatmap &&
          heatmapData.map((point, index) => (
            <CustomOverlayMap key={`heatmap-${index}`} position={{ lat: point.lat, lng: point.lng }}>
              <HeatmapOverlay weight={point.weight} />
            </CustomOverlayMap>
          ))}

        {/* AI 예측 폴리곤 표시 */}
        {mapFilters.showAIPredictions &&
          currentPolygons.map((polygon, index) => (
            <Polygon
              key={`polygon-${index}`}
              path={polygon.coords.map(([lat, lng]) => ({ lat, lng }))}
              strokeWeight={2}
              strokeColor="#10b981"
              strokeOpacity={0.8}
              fillColor="#10b981"
              fillOpacity={0.2}
              onClick={(map, mouseEvent) => handlePolygonClick(polygon, mouseEvent)}
            />
          ))}

        {/* 폴리곤 클릭 정보 팝업 */}
        {clickedPolygonInfo && (
          <CustomOverlayMap position={clickedPolygonInfo.position}>
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[200px]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{clickedPolygonInfo.name}</h3>
                <button onClick={closePolygonInfo} className="text-gray-400 hover:text-gray-600 transition-colors">
                  ✕
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">예상 콜 수:</span>
                  <span className="font-medium">{clickedPolygonInfo.expectedCalls}건/시간</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">평균 배달료:</span>
                  <span className="font-medium">{clickedPolygonInfo.avgFee.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">신뢰도:</span>
                  <span className="font-medium">{clickedPolygonInfo.confidence}%</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  클릭한 위치: {clickedPolygonInfo.position.lat.toFixed(4)},{' '}
                  {clickedPolygonInfo.position.lng.toFixed(4)}
                </div>
              </div>
            </div>
          </CustomOverlayMap>
        )}
      </Map>
    </div>
  );
}
