import { useQueryClient } from '@tanstack/react-query';
import { getDeliveries, getAnalytics } from '@/app/apis';
import { STATS_QUERY_KEYS } from '../stats/useStatsQueries';
import { DELIVERY_QUERY_KEYS } from '../delivery/useDeliveryQueries';
import { AI_QUERY_KEYS } from '../ai/useAiQueries';
import { RIDER_QUERY_KEYS } from '../rider/useRiderQueries';
import { ANNOUNCEMENT_QUERY_KEYS } from '../announcement/useAnnouncementQueries';
import { SETTINGS_QUERY_KEYS } from '../settings/useSettingsQueries';

// 데이터 강제 새로고침을 위한 훅
export const useRefreshData = () => {
  const queryClient = useQueryClient();

  const refreshTodayStats = () => {
    queryClient.invalidateQueries({ queryKey: [STATS_QUERY_KEYS.TODAY_STATS] });
  };

  const refreshDeliveries = () => {
    queryClient.invalidateQueries({ queryKey: [DELIVERY_QUERY_KEYS.DELIVERIES] });
  };

  const refreshAIPredictions = () => {
    queryClient.invalidateQueries({ queryKey: [AI_QUERY_KEYS.AI_PREDICTIONS] });
  };

  const refreshRiderProfile = () => {
    queryClient.invalidateQueries({ queryKey: [RIDER_QUERY_KEYS.RIDER_PROFILE] });
  };

  const refreshAnnouncements = () => {
    queryClient.invalidateQueries({ queryKey: [ANNOUNCEMENT_QUERY_KEYS.ANNOUNCEMENTS] });
  };

  const refreshAnalytics = () => {
    queryClient.invalidateQueries({ queryKey: [STATS_QUERY_KEYS.ANALYTICS] });
  };

  const refreshSettings = () => {
    queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEYS.USER_PROFILE] });
    queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEYS.APP_SETTINGS] });
    queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEYS.RIDER_SETTINGS] });
  };

  const refreshAll = () => {
    queryClient.invalidateQueries();
  };

  return {
    refreshTodayStats,
    refreshDeliveries,
    refreshAIPredictions,
    refreshRiderProfile,
    refreshAnnouncements,
    refreshAnalytics,
    refreshSettings,
    refreshAll,
  };
};

// 캐시된 데이터 프리페칭을 위한 훅
export const usePrefetchData = () => {
  const queryClient = useQueryClient();

  const prefetchDeliveries = (params?: { date?: string; limit?: number }) => {
    queryClient.prefetchQuery({
      queryKey: [DELIVERY_QUERY_KEYS.DELIVERIES, params],
      queryFn: () => getDeliveries(params),
      staleTime: 1000 * 60 * 5,
    });
  };

  const prefetchAnalytics = (type?: 'weekly' | 'monthly') => {
    queryClient.prefetchQuery({
      queryKey: [STATS_QUERY_KEYS.ANALYTICS, type],
      queryFn: () => getAnalytics(type),
      staleTime: 1000 * 60 * 60,
    });
  };

  const prefetchTodayStats = () => {
    queryClient.prefetchQuery({
      queryKey: [STATS_QUERY_KEYS.TODAY_STATS],
      queryFn: () => import('@/app/apis').then((m) => m.getTodayStats()),
      staleTime: 0,
    });
  };

  const prefetchRiderProfile = () => {
    queryClient.prefetchQuery({
      queryKey: [RIDER_QUERY_KEYS.RIDER_PROFILE],
      queryFn: () => import('@/app/apis').then((m) => m.getRiderProfile()),
      staleTime: 1000 * 60 * 10,
    });
  };

  return {
    prefetchDeliveries,
    prefetchAnalytics,
    prefetchTodayStats,
    prefetchRiderProfile,
  };
};
