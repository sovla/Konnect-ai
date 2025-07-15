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
  miniMode?: boolean; // 미니맵 모드 추가
  showCurrentLocation?: boolean; // 현재 위치 마커 표시 여부
}

export default function KakaoMap({
  width = '100%',
  height = '400px',
  className = '',
  miniMode = false,
  showCurrentLocation = true,
}: KakaoMapProps) {
  // Zustand 상태
  const { center, zoom } = useMapStore();
  const { mapFilters } = useUIStore();

  // 지도 인터랙션 훅 (미니맵 모드에서는 사용하지 않음)
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
    if (miniMode) {
      // 미니맵 모드에서는 현재 시간의 상위 3개 핫스팟만 표시
      const currentHour = new Date().getHours();
      const currentTimeSlot = `${currentHour}:00`;
      const currentPrediction = predictionsData.find((prediction) => prediction.time === currentTimeSlot);
      // 줌 레벨 조절
      // 현재 시간대의 데이터가 없으면 첫 번째 시간대의 데이터를 사용
      const fallbackPrediction = predictionsData.length > 0 ? predictionsData[0] : null;
      const prediction = currentPrediction || fallbackPrediction;
      return prediction?.polygons.slice(0, 3) || [];
    }
    return (
      predictionsData.find((prediction) => prediction.time === `${mapFilters.selectedTimeSlot}:00`)?.polygons || []
    );
  }, [predictionsData, mapFilters.selectedTimeSlot, miniMode]);

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
          {!miniMode && (
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
            >
              새로고침
            </button>
          )}
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
        level={miniMode ? zoom + 1 : zoom} // 미니맵은 조금 더 넓게 보기
        onCenterChanged={miniMode ? undefined : handleCenterChange} // 미니맵에서는 센터 변경 비활성화
        onZoomChanged={miniMode ? undefined : handleZoomChange} // 미니맵에서는 줌 변경 비활성화
        className="rounded-lg overflow-hidden shadow-sm border border-gray-200"
        draggable={!miniMode} // 미니맵에서는 드래그 비활성화
        zoomable={!miniMode} // 미니맵에서는 줌 비활성화
      >
        {/* 현재 위치 마커 */}
        {showCurrentLocation && (
          <MapMarker
            position={{
              lat: center.lat,
              lng: center.lng,
            }}
          />
        )}

        {/* 실시간 히트맵 표시 (미니맵에서는 표시하지 않음) */}
        {!miniMode &&
          mapFilters.showRealTimeHeatmap &&
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
                    hourlyTrend: point.hourlyTrend || 'empty',
                  })
                }
              />
            </CustomOverlayMap>
          ))}

        {/* AI 예측 폴리곤 표시 */}
        {(miniMode || mapFilters.showAIPredictions) &&
          currentPolygons.map((polygon, index) => (
            <Polygon
              key={`polygon-${index}`}
              path={polygon.coords.map(([lat, lng]) => ({ lat, lng }))}
              strokeWeight={miniMode ? 1 : 2}
              strokeColor="#10b981"
              strokeOpacity={0.8}
              fillColor="#10b981"
              fillOpacity={miniMode ? 0.3 : 0.2}
              onClick={miniMode ? undefined : (map, mouseEvent) => handlePolygonClick(polygon, mouseEvent)}
            />
          ))}

        {/* 미니맵에서는 팝업 표시하지 않음 */}
        {!miniMode && (
          <>
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
          </>
        )}
      </Map>

      {/* 미니맵 오버레이 정보 */}
      {miniMode && currentPolygons.length > 0 && (
        <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded px-2 py-1 text-xs font-medium text-gray-700 shadow-sm">
          🔥 {currentPolygons.length}개 핫스팟
        </div>
      )}
    </div>
  );
}
