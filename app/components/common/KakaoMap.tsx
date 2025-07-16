/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Map as KakaoMapComponent, useKakaoLoader, Polygon, CustomOverlayMap } from 'react-kakao-maps-sdk';
import { useMapStore } from '../../store/mapStore';
import { useUIStore } from '../../store/uiStore';
import { useAIPredictions, useMapInteraction } from '../../hooks';
import { useMemo } from 'react';
import PolygonInfoPopup from '../map/PolygonInfoPopup';
import HeatmapInfoPopup from '../map/HeatmapInfoPopup';
import HeatmapOverlay from '../map/HeatmapOverlay';
import { PredictionReason } from '../../types/dto';

interface KakaoMapProps {
  width?: string;
  height?: string;
  className?: string;
  miniMode?: boolean; // 미니맵 모드 추가
}

export default function KakaoMap({
  width = '100%',
  height = '400px',
  className = '',
  miniMode = false,
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
  const predictionsData = useMemo(() => {
    return predictionsResponse?.data || [];
  }, [predictionsResponse]);

  // 현재 선택된 시간대의 폴리곤 데이터 필터링 및 그룹화 (메모이제이션)
  const groupedPolygons = useMemo(() => {
    if (!mapFilters.selectedTimeSlot || !predictionsData) {
      return [];
    }
    const { start, end } = mapFilters.selectedTimeSlot;

    const filteredPredictions = predictionsData.filter((p) => {
      const hour = parseInt(p.time.split(':')[0], 10);
      return hour >= start && hour < end;
    });

    const polygonGroups = new Map<
      string,
      {
        coords: number[][];
        reasons: PredictionReason[];
        hourlyPredictions: { hour: number; expectedCalls: number; avgFee: number; confidence: number }[];
      }
    >();

    for (const prediction of filteredPredictions) {
      for (const polygon of prediction.polygons) {
        if (!polygonGroups.has(polygon.name)) {
          polygonGroups.set(polygon.name, {
            coords: polygon.coords,
            reasons:
              polygon.reasons?.map((reason) => ({
                type: reason.type,
                title: reason.title,
                description: reason.description,
                impact: reason.impact,
                confidence: reason.confidence,
              })) || [],
            hourlyPredictions: [],
          });
        }
        polygonGroups.get(polygon.name)!.hourlyPredictions.push({
          hour: parseInt(prediction.time.split(':')[0], 10),
          expectedCalls: polygon.expectedCalls,
          avgFee: polygon.avgFee,
          confidence: polygon.confidence,
        });
      }
    }

    return Array.from(polygonGroups.entries()).map(
      ([name, data]: [string, { coords: number[][]; reasons: PredictionReason[]; hourlyPredictions: any[] }]) => ({
        name,
        ...data,
      }),
    );
  }, [predictionsData, mapFilters.selectedTimeSlot]);

  // 미니맵용 폴리곤 데이터 (기존 로직 단순화)
  const miniMapPolygons = useMemo(() => {
    if (!predictionsData || predictionsData.length === 0) return [];
    const latestPrediction = predictionsData[predictionsData.length - 1];
    return latestPrediction.polygons.slice(0, 3);
  }, [predictionsData]);

  const currentPolygons = miniMode ? miniMapPolygons : groupedPolygons;

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
      <KakaoMapComponent
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
        {/* 현재 위치 마커 제거 */}

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
          currentPolygons
            .filter((polygon) => typeof polygon === 'object' && 'hourlyPredictions' in polygon)
            .map((polygon, index) => (
              <Polygon
                key={`polygon-${polygon.name}-${index}`}
                path={polygon.coords.map(([lat, lng]) => ({ lat, lng }))}
                strokeWeight={miniMode ? 1 : 2}
                strokeColor="#10b981"
                strokeOpacity={0.8}
                fillColor="#10b981"
                fillOpacity={miniMode ? 0.3 : 0.2}
                onClick={miniMode ? undefined : (_map, mouseEvent) => handlePolygonClick(polygon as any, mouseEvent)} // FIX: TypeError
              />
            ))}

        {/* 미니맵에서는 팝업 표시하지 않음 */}
        {!miniMode && (
          <>
            {/* 폴리곤 클릭 정보 팝업 */}
            {clickedPolygonInfo && (
              <PolygonInfoPopup
                name={clickedPolygonInfo.name}
                hourlyPredictions={clickedPolygonInfo.hourlyPredictions}
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
      </KakaoMapComponent>

      {/* 미니맵 오버레이 정보 */}
      {miniMode && currentPolygons.length > 0 && (
        <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded px-2 py-1 text-xs font-medium text-gray-700 shadow-sm">
          🔥 {currentPolygons.length}개 핫스팟
        </div>
      )}
    </div>
  );
}
