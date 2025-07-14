# React Query Hooks 구조 가이드

이 프로젝트의 React Query hooks는 상태별로 분류되어 관리됩니다.

## 📁 폴더 구조

```
app/hooks/
├── stats/              # 통계 관련 hooks
├── delivery/           # 배달 관련 hooks
├── rider/              # 라이더 관련 hooks
├── ai/                 # AI 예측 관련 hooks
├── announcement/       # 공지사항 관련 hooks
├── settings/           # 설정 관련 hooks
├── utils/              # 쿼리 유틸리티 hooks
├── index.ts            # 전체 export 관리
├── useAuth.ts          # 인증 관련 hooks
├── useDebounce.ts      # 디바운스 hooks
└── useMapInteraction.ts # 지도 상호작용 hooks
```

## 🎯 카테고리별 Hooks

### 📊 Stats (통계)

```typescript
import { useTodayStats, useAnalytics } from '@/app/hooks/stats';
// 또는
import { useTodayStats, useAnalytics } from '@/app/hooks';

// 오늘의 성과 데이터 (30초마다 자동 갱신)
const { data, isLoading } = useTodayStats();

// 수익 분석 데이터 (1시간간 fresh)
const { data, isLoading } = useAnalytics('weekly');
const { data, isLoading } = useAnalytics('monthly');
```

### 🚚 Delivery (배달)

```typescript
import { useDeliveries, useCompleteDelivery } from '@/app/hooks/delivery';

// 배달 내역 조회 (5분간 fresh)
const { data, isLoading } = useDeliveries({ date: '2024-01-01', limit: 10 });

// 배달 완료 mutation
const completeMutation = useCompleteDelivery();
completeMutation.mutate();
```

### 🏍️ Rider (라이더)

```typescript
import { useRiderProfile, useToggleRiderStatus } from '@/app/hooks/rider';

// 라이더 프로필 조회 (10분간 fresh)
const { data, isLoading } = useRiderProfile();

// 라이더 상태 변경 (온라인/오프라인)
const toggleMutation = useToggleRiderStatus();
toggleMutation.mutate();
```

### 🤖 AI (AI 예측)

```typescript
import { useAIPredictions } from '@/app/hooks/ai';

// AI 예측 데이터 (1분마다 갱신, 30초간 fresh)
const { data, isLoading } = useAIPredictions();
const { data, isLoading } = useAIPredictions('specific-type');
```

### 📢 Announcement (공지사항)

```typescript
import { useAnnouncements } from '@/app/hooks/announcement';

// 공지사항 조회 (5분간 fresh)
const { data, isLoading } = useAnnouncements();
const { data, isLoading } = useAnnouncements({ type: 'important', active: true });
```

### ⚙️ Settings (설정)

```typescript
import {
  useUserProfile,
  useRiderStats,
  useAccountStats,
  useAppSettings,
  useRiderSettings,
  useSettingsOverview,
  useUpdateProfile,
  useDeleteAccount,
  useUpdateAppSettings,
  useUpdateRiderSettings,
} from '@/app/hooks/settings';

// 프로필 설정 페이지용
const { data: profile } = useUserProfile();
const { data: stats } = useRiderStats();
const updateMutation = useUpdateProfile();

// 설정 오버뷰 페이지용
const { profileQuery, riderQuery, appQuery } = useSettingsOverview();

// 각종 설정 조회
const { data: accountStats } = useAccountStats();
const { data: appSettings } = useAppSettings();
const { data: riderSettings } = useRiderSettings();

// 설정 업데이트
const updateProfileMutation = useUpdateProfile();
const deleteAccountMutation = useDeleteAccount();
const updateAppMutation = useUpdateAppSettings();
const updateRiderMutation = useUpdateRiderSettings();
```

### 🛠️ Utils (유틸리티)

```typescript
import { useRefreshData, usePrefetchData } from '@/app/hooks/utils';

// 데이터 강제 새로고침
const { refreshTodayStats, refreshDeliveries, refreshAll } = useRefreshData();

// 데이터 프리페칭
const { prefetchDeliveries, prefetchAnalytics } = usePrefetchData();
```

## 📝 사용 방법

### 1. 개별 import

```typescript
// 특정 카테고리에서만 import
import { useTodayStats } from '@/app/hooks/stats';
import { useDeliveries } from '@/app/hooks/delivery';
```

### 2. 통합 import

```typescript
// 메인 index에서 모든 hooks import
import { useTodayStats, useDeliveries, useRiderProfile } from '@/app/hooks';
```

### 3. 레거시 호환성

기존 코드의 호환성을 위해 기존 import 방식도 지원됩니다:

```typescript
// 여전히 작동하지만 새로운 방식 사용 권장
import { useTodayStats, QUERY_KEYS } from '@/app/hooks';
```

## 🔧 Query Keys

각 카테고리별로 Query Keys가 분리되어 있습니다:

```typescript
import {
  STATS_QUERY_KEYS,
  DELIVERY_QUERY_KEYS,
  RIDER_QUERY_KEYS,
  AI_QUERY_KEYS,
  ANNOUNCEMENT_QUERY_KEYS,
  SETTINGS_QUERY_KEYS,
} from '@/app/hooks';

// 예시
STATS_QUERY_KEYS.TODAY_STATS; // 'todayStats'
DELIVERY_QUERY_KEYS.DELIVERIES; // 'deliveries'
RIDER_QUERY_KEYS.RIDER_PROFILE; // 'riderProfile'
```

## 🎯 Best Practices

1. **카테고리별 import 사용**: 관련있는 hooks만 가져와 번들 크기 최적화
2. **적절한 staleTime 설정**: 각 hook은 데이터 특성에 맞는 staleTime이 설정됨
3. **Mutation과 Query 조합**: 데이터 변경 후 자동으로 관련 쿼리들이 무효화됨
4. **Error Handling**: 모든 hooks에서 에러 처리가 포함됨

## 📊 데이터 갱신 주기

- **실시간 데이터** (오늘 통계): 30초마다 자동 갱신
- **AI 예측**: 1분마다 갱신
- **배달 내역, 공지사항**: 5분간 fresh
- **프로필 정보**: 10분간 fresh
- **분석 데이터**: 1시간간 fresh

## 🔄 Migration Guide

기존 코드에서 새로운 구조로 마이그레이션:

### Before

```typescript
import { useTodayStats, useDeliveries } from '@/app/hooks/useQueries';
```

### After

```typescript
import { useTodayStats, useDeliveries } from '@/app/hooks';
// 또는 더 명시적으로
import { useTodayStats } from '@/app/hooks/stats';
import { useDeliveries } from '@/app/hooks/delivery';
```
