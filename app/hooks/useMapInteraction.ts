import { useState, useCallback, useRef } from 'react';
import { useMapStore } from '../store/mapStore';
import { PredictionReason } from '../types/dto';

interface HourlyPredictionInfo {
  hour: number;
  expectedCalls: number;
  avgFee: number;
  confidence: number;
}
export interface PolygonClickInfo {
  name: string;
  hourlyPredictions: HourlyPredictionInfo[];
  reasons?: PredictionReason[];
  position: { lat: number; lng: number };
}

interface HeatmapClickInfo {
  id: string;
  recentOrders: number;
  avgWaitTime: number;
  hourlyTrend: 'rising' | 'stable' | 'falling' | 'empty';
  position: { lat: number; lng: number };
}

export function useMapInteraction() {
  const { setCenter, setZoom } = useMapStore();

  // 팝업 상태 관리
  const [clickedPolygonInfo, setClickedPolygonInfo] = useState<PolygonClickInfo | null>(null);
  const [clickedHeatmapInfo, setClickedHeatmapInfo] = useState<HeatmapClickInfo | null>(null);

  // 디바운싱을 위한 타이머 ref
  const centerChangeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const zoomChangeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 디바운싱된 지도 이벤트 핸들러
  const handleCenterChange = useCallback(
    (map: kakao.maps.Map) => {
      if (centerChangeTimerRef.current) {
        clearTimeout(centerChangeTimerRef.current);
      }

      centerChangeTimerRef.current = setTimeout(() => {
        const newCenter = map.getCenter();
        setCenter(newCenter.getLat(), newCenter.getLng());
      }, 300);
    },
    [setCenter],
  );

  const handleZoomChange = useCallback(
    (map: kakao.maps.Map) => {
      if (zoomChangeTimerRef.current) {
        clearTimeout(zoomChangeTimerRef.current);
      }

      zoomChangeTimerRef.current = setTimeout(() => {
        const newLevel = map.getLevel();
        setZoom(newLevel);
      }, 200);
    },
    [setZoom],
  );

  // 폴리곤 클릭 이벤트 핸들러
  const handlePolygonClick = useCallback(
    (polygon: PolygonClickInfo, event: { latLng: { getLat: () => number; getLng: () => number } }) => {
      const clickPosition = event.latLng;
      setClickedPolygonInfo({
        name: polygon.name,
        hourlyPredictions: polygon.hourlyPredictions,
        reasons: polygon.reasons,
        position: {
          lat: clickPosition.getLat(),
          lng: clickPosition.getLng(),
        },
      });
      setClickedHeatmapInfo(null); // 다른 팝업 닫기
    },
    [],
  );

  // 히트맵 마커 클릭 이벤트 핸들러
  const handleHeatmapClick = useCallback(
    (heatmapPoint: {
      id: string;
      lat: number;
      lng: number;
      recentOrders: number;
      avgWaitTime: number;
      hourlyTrend: 'rising' | 'stable' | 'falling' | 'empty';
    }) => {
      setClickedHeatmapInfo({
        id: heatmapPoint.id,
        recentOrders: heatmapPoint.recentOrders,
        avgWaitTime: heatmapPoint.avgWaitTime,
        hourlyTrend: heatmapPoint.hourlyTrend,
        position: {
          lat: heatmapPoint.lat,
          lng: heatmapPoint.lng,
        },
      });
      setClickedPolygonInfo(null); // 다른 팝업 닫기
    },
    [],
  );

  // 팝업 닫기 핸들러
  const closePolygonInfo = useCallback(() => {
    setClickedPolygonInfo(null);
  }, []);

  const closeHeatmapInfo = useCallback(() => {
    setClickedHeatmapInfo(null);
  }, []);

  return {
    // 상태
    clickedPolygonInfo,
    clickedHeatmapInfo,

    // 이벤트 핸들러
    handlePolygonClick,
    handleHeatmapClick,
    closePolygonInfo,
    closeHeatmapInfo,

    // 지도 이벤트 핸들러
    handleCenterChange,
    handleZoomChange,
  };
}
