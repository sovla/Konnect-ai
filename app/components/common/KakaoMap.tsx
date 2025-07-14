'use client';

import { Map, useKakaoLoader, MapMarker, Polygon, CustomOverlayMap } from 'react-kakao-maps-sdk';
import { useMapStore } from '../../store/mapStore';
import { useUIStore } from '../../store/uiStore';
import { useAIPredictions, useMapInteraction } from '../../hooks';
import { useMemo } from 'react';
import PolygonInfoPopup from '../map/PolygonInfoPopup';
import HeatmapInfoPopup from '../map/HeatmapInfoPopup';
import HeatmapOverlay from '../map/HeatmapOverlay';

interface KakaoMapProps {
  width?: string;
  height?: string;
  className?: string;
}

export default function KakaoMap({ width = '100%', height = '400px', className = '' }: KakaoMapProps) {
  // Zustand 상태
  const { center, zoom } = useMapStore();
  const { mapFilters } = useUIStore();

  // 지도 인터랙션 훅
  const {
    clickedPolygonInfo,
    clickedHeatmapInfo,
    handlePolygonClick,
    handleHeatmapClick,
    closePolygonInfo,
    closeHeatmapInfo,
    handleCenterChange,
    handleZoomChange,
  } = useMapInteraction();

  // 히트맵 데이터 조회
  const { data: heatmapResponse } = useAIPredictions('heatmap');
  const heatmapData = heatmapResponse?.data || [];

  // AI 예측 폴리곤 데이터 조회
  const { data: predictionsResponse } = useAIPredictions('predictions');
  const predictionsData = predictionsResponse?.data || [];

  // 현재 선택된 시간대의 폴리곤 데이터 필터링 (메모이제이션)
  const currentPolygons = useMemo(() => {
    return (
      predictionsData.find((prediction) => prediction.time === `${mapFilters.selectedTimeSlot}:00`)?.polygons || []
    );
  }, [predictionsData, mapFilters.selectedTimeSlot]);

  // 카카오맵 API 로더
  const [loading, error] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || '',
    libraries: ['services', 'clusterer', 'drawing'],
  });

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
        onCenterChanged={handleCenterChange}
        onZoomChanged={handleZoomChange}
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
              <HeatmapOverlay
                weight={point.weight}
                onClick={() =>
                  handleHeatmapClick({
                    id: point.id || `heatmap-${index}`,
                    lat: point.lat,
                    lng: point.lng,
                    recentOrders: point.recentOrders || 0,
                    avgWaitTime: point.avgWaitTime || 0,
                    hourlyTrend: point.hourlyTrend || '정보 없음',
                  })
                }
              />
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
          <PolygonInfoPopup
            name={clickedPolygonInfo.name}
            expectedCalls={clickedPolygonInfo.expectedCalls}
            avgFee={clickedPolygonInfo.avgFee}
            confidence={clickedPolygonInfo.confidence}
            reasons={clickedPolygonInfo.reasons}
            position={clickedPolygonInfo.position}
            onClose={closePolygonInfo}
          />
        )}

        {/* 히트맵 마커 클릭 정보 팝업 */}
        {clickedHeatmapInfo && (
          <HeatmapInfoPopup
            recentOrders={clickedHeatmapInfo.recentOrders}
            avgWaitTime={clickedHeatmapInfo.avgWaitTime}
            hourlyTrend={clickedHeatmapInfo.hourlyTrend}
            position={clickedHeatmapInfo.position}
            onClose={closeHeatmapInfo}
          />
        )}
      </Map>
    </div>
  );
}
