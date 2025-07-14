import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { toISOString } from '../utils/dateHelpers';
import { TodayStats, Announcement, HourlyPrediction } from '../types';

interface DashboardState {
  // 오늘의 성과 데이터
  todayStats: TodayStats | null;

  // 공지사항 데이터
  announcements: Announcement[];

  // 시간대별 콜 예측 데이터
  hourlyPredictions: HourlyPrediction[];

  // 마지막 업데이트 시간
  lastUpdated: string | null;

  // 자동 새로고침 설정
  autoRefresh: boolean;
  autoRefreshInterval: number; // milliseconds
}

interface DashboardActions {
  // 데이터 설정
  setTodayStats: (stats: TodayStats) => void;
  setAnnouncements: (announcements: Announcement[]) => void;
  setHourlyPredictions: (predictions: HourlyPrediction[]) => void;

  // 개별 데이터 업데이트
  updateTodayStats: (updates: Partial<TodayStats>) => void;
  addAnnouncement: (announcement: Announcement) => void;
  removeAnnouncement: (id: string) => void;

  // 마지막 업데이트 시간 갱신
  updateLastRefresh: () => void;

  // 자동 새로고침 설정
  setAutoRefresh: (enabled: boolean) => void;
  setAutoRefreshInterval: (interval: number) => void;

  // 전체 데이터 초기화
  resetDashboard: () => void;
}

export type DashboardStore = DashboardState & DashboardActions;

export const useDashboardStore = create<DashboardStore>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      todayStats: null,
      announcements: [],
      hourlyPredictions: [],
      lastUpdated: null,
      autoRefresh: true,
      autoRefreshInterval: 30000, // 30초

      // 데이터 설정 액션
      setTodayStats: (stats) => {
        set({ todayStats: stats });
        get().updateLastRefresh();
      },

      setAnnouncements: (announcements) => {
        // 우선순위 순으로 정렬 (high > medium > low)
        const sortedAnnouncements = [...announcements].sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

        set({ announcements: sortedAnnouncements });
        get().updateLastRefresh();
      },

      setHourlyPredictions: (predictions) => {
        set({ hourlyPredictions: predictions });
        get().updateLastRefresh();
      },

      // 개별 데이터 업데이트
      updateTodayStats: (updates) => {
        const currentStats = get().todayStats;
        if (currentStats) {
          set({
            todayStats: {
              ...currentStats,
              ...updates,
            },
          });
          get().updateLastRefresh();
        }
      },

      addAnnouncement: (announcement) => {
        set((state) => ({
          announcements: [announcement, ...state.announcements],
        }));
      },

      removeAnnouncement: (id) => {
        set((state) => ({
          announcements: state.announcements.filter((ann) => ann.id !== id),
        }));
      },

      // 마지막 업데이트 시간 갱신
      updateLastRefresh: () => {
        set({ lastUpdated: toISOString(new Date()) });
      },

      // 자동 새로고침 설정
      setAutoRefresh: (enabled) => set({ autoRefresh: enabled }),
      setAutoRefreshInterval: (interval) => set({ autoRefreshInterval: interval }),

      // 전체 데이터 초기화
      resetDashboard: () =>
        set({
          todayStats: null,
          announcements: [],
          hourlyPredictions: [],
          lastUpdated: null,
        }),
    }),
    {
      name: 'dashboard-store',
    },
  ),
);
