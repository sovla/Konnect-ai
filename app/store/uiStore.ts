import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createDateRange } from '../utils/dateHelpers';

interface FilterState {
  showRealTimeHeatmap: boolean;
  showAIPredictions: boolean;
  selectedTimeSlot: { start: number; end: number } | null; // 13-22시 범위, 4시간 단위
}

interface DateRangeState {
  startDate: string;
  endDate: string;
  preset: 'yesterday' | 'last7days' | 'thisMonth' | 'custom';
}

interface UIState {
  // 사이드바 상태
  sidebarOpen: boolean;

  // 지도 필터 상태
  mapFilters: FilterState;

  // 수익 분석 기간 선택
  dateRange: DateRangeState;

  // 로딩 상태
  isLoading: boolean;

  // 에러 상태
  error: string | null;

  // 모바일 뷰 상태
  isMobile: boolean;
}

interface UIActions {
  // 사이드바 토글
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // 지도 필터 액션
  toggleRealTimeHeatmap: () => void;
  toggleAIPredictions: () => void;
  setTimeSlot: (slot: { start: number; end: number } | null) => void;
  resetMapFilters: () => void;

  // 날짜 범위 액션
  setDateRange: (range: DateRangeState) => void;
  setPresetDateRange: (preset: DateRangeState['preset']) => void;

  // 상태 관리 액션
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setMobile: (mobile: boolean) => void;
}

export type UIStore = UIState & UIActions;

// 오늘 날짜를 기준으로 기본 날짜 범위 설정
const getDefaultDateRange = (): DateRangeState => {
  const range = createDateRange('yesterday');
  return {
    ...range,
    preset: 'yesterday',
  };
};

// 현재 시간에 해당하는 기본 시간 범위(4시간)를 설정
const getDefaultTimeSlot = (): { start: number; end: number } | null => {
  const currentHour = new Date().getHours();
  // 예시: 13-16, 17-20, 21-24시
  if (currentHour >= 0 && currentHour < 3) {
    return { start: 0, end: 3 };
  }
  if (currentHour >= 3 && currentHour < 6) {
    return { start: 3, end: 6 };
  }
  if (currentHour >= 6 && currentHour < 9) {
    return { start: 6, end: 9 };
  }
  if (currentHour >= 9 && currentHour < 12) {
    return { start: 9, end: 12 };
  }
  // 기본값 또는 다른 시간대 처리

  return { start: 13, end: 16 };
};

export const useUIStore = create<UIStore>()(
  devtools(
    (set) => ({
      // 초기 상태
      sidebarOpen: true,
      mapFilters: {
        showRealTimeHeatmap: true,
        showAIPredictions: true,
        selectedTimeSlot: null,
      },
      dateRange: getDefaultDateRange(),
      isLoading: false,
      error: null,
      isMobile: false,

      // 사이드바 액션
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // 지도 필터 액션
      toggleRealTimeHeatmap: () =>
        set((state) => ({
          mapFilters: {
            ...state.mapFilters,
            showRealTimeHeatmap: !state.mapFilters.showRealTimeHeatmap,
          },
        })),

      toggleAIPredictions: () =>
        set((state) => ({
          mapFilters: {
            ...state.mapFilters,
            showAIPredictions: !state.mapFilters.showAIPredictions,
          },
        })),

      setTimeSlot: (slot) =>
        set((state) => ({
          mapFilters: {
            ...state.mapFilters,
            selectedTimeSlot: slot,
          },
        })),

      resetMapFilters: () =>
        set(() => ({
          mapFilters: {
            showRealTimeHeatmap: true,
            showAIPredictions: true,
            selectedTimeSlot: getDefaultTimeSlot(),
          },
        })),

      // 날짜 범위 액션
      setDateRange: (range) => set({ dateRange: range }),

      setPresetDateRange: (preset) => {
        if (preset === 'custom') {
          return; // custom의 경우 변경하지 않음
        }

        const range = createDateRange(preset);
        set({
          dateRange: {
            ...range,
            preset,
          },
        });
      },

      // 상태 관리 액션
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setMobile: (mobile) => set({ isMobile: mobile }),
    }),
    {
      name: 'ui-store',
    },
  ),
);
