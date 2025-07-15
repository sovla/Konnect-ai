import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AIPrediction, HeatmapData, AIPolygon } from '../types';

interface MapState {
  // 지도 중심 좌표 (부산 중심가 기준)
  center: {
    lat: number;
    lng: number;
  };

  // 지도 줌 레벨
  zoom: number;

  // 현재 사용자 위치
  userLocation: {
    lat: number;
    lng: number;
  } | null;

  // AI 예측 데이터
  aiPredictions: AIPrediction[];

  // 실시간 히트맵 데이터
  heatmapData: HeatmapData[];

  // 선택된 폴리곤 정보
  selectedPolygon: AIPolygon | null;

  // 지도 인터랙션 상태
  isPolygonPopupOpen: boolean;

  // 지도 로딩 상태
  isMapLoading: boolean;
}

interface MapActions {
  // 지도 위치 및 줌 설정
  setCenter: (lat: number, lng: number) => void;
  setZoom: (zoom: number) => void;

  // 사용자 위치 설정
  setUserLocation: (lat: number, lng: number) => void;
  clearUserLocation: () => void;

  // AI 예측 데이터 관리
  setAIPredictions: (predictions: AIPrediction[]) => void;
  updatePredictionForTime: (time: string, prediction: AIPrediction) => void;

  // 히트맵 데이터 관리
  setHeatmapData: (data: HeatmapData[]) => void;
  addHeatmapPoint: (point: HeatmapData) => void;

  // 폴리곤 선택 및 팝업 관리
  selectPolygon: (polygon: AIPolygon) => void;
  clearSelectedPolygon: () => void;
  setPolygonPopupOpen: (open: boolean) => void;

  // 지도 상태 관리
  setMapLoading: (loading: boolean) => void;

  // 내 위치로 이동
  moveToUserLocation: () => void;

  // 지도 초기화
  resetMap: () => void;
}

export type MapStore = MapState & MapActions;

// 부산 해운대 중심 좌표
const DEFAULT_CENTER = {
  lat: 35.1596,
  lng: 129.1603,
};

export const useMapStore = create<MapStore>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      center: DEFAULT_CENTER,
      zoom: 7,
      userLocation: null,
      aiPredictions: [],
      heatmapData: [],
      selectedPolygon: null,
      isPolygonPopupOpen: false,
      isMapLoading: false,

      // 지도 위치 및 줌 설정
      setCenter: (lat, lng) => set({ center: { lat, lng } }),
      setZoom: (zoom) => set({ zoom }),

      // 사용자 위치 설정
      setUserLocation: (lat, lng) => set({ userLocation: { lat, lng } }),
      clearUserLocation: () => set({ userLocation: null }),

      // AI 예측 데이터 관리
      setAIPredictions: (predictions) => set({ aiPredictions: predictions }),

      updatePredictionForTime: (time, prediction) => {
        set((state) => ({
          aiPredictions: state.aiPredictions.map((p) => (p.time === time ? prediction : p)),
        }));
      },

      // 히트맵 데이터 관리
      setHeatmapData: (data) => set({ heatmapData: data }),

      addHeatmapPoint: (point) => {
        set((state) => ({
          heatmapData: [...state.heatmapData, point],
        }));
      },

      // 폴리곤 선택 및 팝업 관리
      selectPolygon: (polygon) => {
        set({
          selectedPolygon: polygon,
          isPolygonPopupOpen: true,
        });
      },

      clearSelectedPolygon: () => {
        set({
          selectedPolygon: null,
          isPolygonPopupOpen: false,
        });
      },

      setPolygonPopupOpen: (open) => {
        if (!open) {
          set({
            isPolygonPopupOpen: false,
            selectedPolygon: null,
          });
        } else {
          set({ isPolygonPopupOpen: true });
        }
      },

      // 지도 상태 관리
      setMapLoading: (loading) => set({ isMapLoading: loading }),

      // 내 위치로 이동
      moveToUserLocation: () => {
        const { userLocation } = get();
        if (userLocation) {
          set({
            center: userLocation,
            zoom: 16,
          });
        }
      },

      // 지도 초기화
      resetMap: () =>
        set({
          center: DEFAULT_CENTER,
          zoom: 14,
          selectedPolygon: null,
          isPolygonPopupOpen: false,
          isMapLoading: false,
        }),
    }),
    {
      name: 'map-store',
    },
  ),
);
