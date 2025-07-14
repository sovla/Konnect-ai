'use client';

import { Map, useKakaoLoader, MapMarker } from 'react-kakao-maps-sdk';
import { useMapStore } from '../../store/mapStore';

interface KakaoMapProps {
  width?: string;
  height?: string;
  className?: string;
}

export default function KakaoMap({ width = '100%', height = '400px', className = '' }: KakaoMapProps) {
  // Zustand 상태
  const { center, zoom, setCenter, setZoom } = useMapStore();

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
      </Map>
    </div>
  );
}
