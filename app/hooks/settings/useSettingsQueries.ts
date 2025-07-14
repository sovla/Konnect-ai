import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  RiderSettingsResponse,
  ProfileResponse,
  UserSettingsResponse,
  type UpdateProfileRequest,
  type UpdateRiderSettingsRequest,
  type UpdateUserSettingsRequest,
  type DeleteAccountRequest,
  type UserProfile,
  type UserSettings,
} from '@/app/types/dto';

// Query Keys
export const SETTINGS_QUERY_KEYS = {
  USER_PROFILE: 'userProfile',
  RIDER_STATS: 'riderStats',
  ACCOUNT_STATS: 'accountStats',
  APP_SETTINGS: 'appSettings',
  RIDER_SETTINGS: 'riderSettings',
  SETTINGS_OVERVIEW: 'settingsOverview',
} as const;

// 사용자 프로필 조회 (프로필 설정 페이지)
export const useUserProfile = () => {
  return useQuery({
    queryKey: [SETTINGS_QUERY_KEYS.USER_PROFILE],
    queryFn: async () => {
      const response = await fetch('/api/settings/profile');
      if (!response.ok) {
        throw new Error('프로필을 불러오는데 실패했습니다.');
      }
      const data: ProfileResponse = await response.json();
      return data.data?.user;
    },
  });
};

// 라이더 통계 조회
export const useRiderStats = () => {
  return useQuery({
    queryKey: [SETTINGS_QUERY_KEYS.RIDER_STATS],
    queryFn: async () => {
      const response = await fetch('/api/settings/rider');
      if (!response.ok) {
        throw new Error('통계를 불러오는데 실패했습니다.');
      }
      const data: RiderSettingsResponse = await response.json();
      return data.data?.riderStats;
    },
  });
};

// 계정 통계 조회
export const useAccountStats = () => {
  return useQuery({
    queryKey: [SETTINGS_QUERY_KEYS.ACCOUNT_STATS],
    queryFn: async () => {
      const response = await fetch('/api/settings/account');
      if (!response.ok) {
        throw new Error('계정 통계를 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      return data.data?.stats;
    },
  });
};

// 앱 설정 조회
export const useAppSettings = () => {
  return useQuery({
    queryKey: [SETTINGS_QUERY_KEYS.APP_SETTINGS],
    queryFn: async () => {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error('앱 설정을 불러오는데 실패했습니다.');
      }
      const data: UserSettingsResponse = await response.json();
      return data.data?.userSettings;
    },
  });
};

// 라이더 설정 조회
export const useRiderSettings = () => {
  return useQuery({
    queryKey: [SETTINGS_QUERY_KEYS.RIDER_SETTINGS],
    queryFn: async () => {
      const response = await fetch('/api/settings/rider');
      if (!response.ok) {
        throw new Error('라이더 설정을 불러오는데 실패했습니다.');
      }
      const data: RiderSettingsResponse = await response.json();
      return data.data?.riderProfile;
    },
  });
};

// 설정 개요 조회 (메인 설정 페이지)
export const useSettingsOverview = () => {
  return useQuery({
    queryKey: [SETTINGS_QUERY_KEYS.SETTINGS_OVERVIEW],
    queryFn: async () => {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error('설정 정보를 불러오는데 실패했습니다.');
      }
      return response.json() as Promise<UserSettingsResponse>;
    },
  });
};

// Mutations

// 프로필 업데이트
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      const response = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '프로필 업데이트에 실패했습니다.');
      }

      return response.json();
    },
    onSuccess: () => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEYS.USER_PROFILE] });
      queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEYS.SETTINGS_OVERVIEW] });
    },
  });
};

// 계정 삭제
export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: async (data: DeleteAccountRequest) => {
      const response = await fetch('/api/settings/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '계정 삭제에 실패했습니다.');
      }

      return response.json();
    },
  });
};

// 앱 설정 업데이트
export const useUpdateAppSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateUserSettingsRequest) => {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '앱 설정 업데이트에 실패했습니다.');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEYS.APP_SETTINGS] });
      queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEYS.SETTINGS_OVERVIEW] });
    },
  });
};

// 라이더 설정 업데이트
export const useUpdateRiderSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateRiderSettingsRequest) => {
      const response = await fetch('/api/settings/rider', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '라이더 설정 업데이트에 실패했습니다.');
      }

      return response.json();
    },
    onSuccess: () => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEYS.RIDER_SETTINGS] });
      queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEYS.RIDER_STATS] });
      queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEYS.SETTINGS_OVERVIEW] });
    },
  });
};

// 기존 타입들 (호환성을 위해 재내보내기)
export type { UserProfile, UserSettings };
