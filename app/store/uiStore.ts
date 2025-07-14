import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createDateRange, getCurrentHour } from '../utils/dateHelpers';

interface FilterState {
  showRealTimeHeatmap: boolean;
  showAIPredictions: boolean;
  selectedTimeSlot: number; // 13-22시 범위
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
  setTimeSlot: (slot: number) => void;
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

export const useUIStore = create<UIStore>()(
  devtools(
    (set) => ({
      // 초기 상태
      sidebarOpen: true,
      mapFilters: {
        showRealTimeHeatmap: true,
        showAIPredictions: true,
        selectedTimeSlot: getCurrentHour(), // 현재 시간으로 초기화
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
            selectedTimeSlot: getCurrentHour(),
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
