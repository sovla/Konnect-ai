# 배달 데이터 자동 생성 API

테스트를 위한 임의의 배달 데이터를 생성하는 API와 UI 도구입니다.

## API 엔드포인트

### POST /api/deliveries/batch-generate

배달 데이터를 자동으로 생성합니다.

#### 요청 파라미터

```typescript
interface BatchGenerateRequest {
  riderId?: string; // 특정 라이더 ID (선택사항, 없으면 모든 라이더)
  count?: number; // 생성할 데이터 개수 (기본값: 10, 최대: 100)
  startDate?: string; // 시작 날짜 (YYYY-MM-DD 형식)
  endDate?: string; // 종료 날짜 (YYYY-MM-DD 형식)
  dateRange?: 'today' | 'week' | 'month'; // 날짜 범위 (기본값: 'week')
}
```

#### 응답

```typescript
interface BatchGenerateResponse {
  success: boolean;
  message: string;
  data: {
    totalCreated: number; // 생성된 데이터 개수
    targetRiders: number; // 대상 라이더 수
    dateRange: {
      start: string; // 실제 시작 날짜
      end: string; // 실제 종료 날짜
    };
  };
}
```

## API 사용 예제

### 1. 현재 라이더의 이번 주 데이터 10개 생성

```javascript
const response = await fetch('/api/deliveries/batch-generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    riderId: 'current-rider-id',
    count: 10,
    dateRange: 'week',
  }),
});
```

### 2. 모든 라이더의 오늘 데이터 5개씩 생성

```javascript
const response = await fetch('/api/deliveries/batch-generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    count: 5,
    dateRange: 'today',
  }),
});
```

### 3. 특정 기간의 데이터 생성

```javascript
const response = await fetch('/api/deliveries/batch-generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    count: 50,
  }),
});
```

## React 훅 사용법

### useDeliveryGenerate

```typescript
import { useDeliveryGenerate, deliveryGenerateHelpers } from '@/app/hooks/delivery';

function MyComponent() {
  const generateMutation = useDeliveryGenerate();

  const handleGenerate = () => {
    // 이번 주 데이터 20개 생성
    const request = deliveryGenerateHelpers.generateThisWeek(20);
    generateMutation.mutate(request);
  };

  return (
    <button onClick={handleGenerate} disabled={generateMutation.isPending}>
      {generateMutation.isPending ? '생성 중...' : '데이터 생성'}
    </button>
  );
}
```

### 편의 함수들

```typescript
// 특정 라이더의 데이터 생성
deliveryGenerateHelpers.generateForRider(riderId, 10, 'week');

// 모든 라이더의 데이터 생성
deliveryGenerateHelpers.generateForAllRiders(10, 'week');

// 특정 날짜 범위의 데이터 생성
deliveryGenerateHelpers.generateForDateRange('2024-01-01', '2024-01-31', 10);

// 오늘 데이터 생성
deliveryGenerateHelpers.generateToday(5);

// 이번 주 데이터 생성
deliveryGenerateHelpers.generateThisWeek(20);

// 이번 달 데이터 생성
deliveryGenerateHelpers.generateThisMonth(100);
```

## UI 도구 사용법

개발자 도구 페이지(`/settings/dev`)에서 배달 데이터 생성 UI를 사용할 수 있습니다.

### 기능

1. **빠른 생성**: 원클릭으로 미리 정의된 데이터 생성

   - 오늘 데이터 5개
   - 이번 주 데이터 20개
   - 이번 달 데이터 100개

2. **상세 설정**: 맞춤형 데이터 생성
   - 라이더 선택 (모든 라이더 또는 특정 라이더)
   - 생성 개수 설정 (1-100개)
   - 날짜 범위 설정 (오늘/이번주/이번달)
   - 사용자 지정 날짜 범위

## 생성되는 데이터 특징

### 주소 데이터

- 서울 30개 주요 지역의 실제 주소와 좌표
- 부산 50개 주요 지역의 실제 주소와 좌표 (해운대, 서면, 광안리, 센텀시티 등)
- 픽업/배송 주소는 서울/부산 전체에서 랜덤으로 선택

### 배달 시간

- 거리 기반 계산 (15분 ~ 45분)
- 오전 9시 ~ 오후 10시 사이 완료 시간

### 수익 계산

- 기본료: 3,000원 ~ 8,000원 (거리 기반)
- 프로모션 수익: 피크 시간대 보너스 (11-13시, 17-21시)
- 팁 수익: 20% 확률로 0 ~ 3,000원

### 평점

- 4.0 ~ 5.0 점
- 80% 확률로 4.5점 이상

## 주의사항

1. **인증 필요**: 로그인된 사용자만 API 사용 가능
2. **생성 제한**: 한 번에 최대 100개 데이터 생성
3. **데이터 품질**: 테스트용 임의 데이터이므로 실제 운영 데이터와 다를 수 있음
4. **성능**: 대량 데이터 생성 시 처리 시간이 소요될 수 있음

## 데이터 삭제

생성된 테스트 데이터를 삭제하려면 데이터베이스에서 직접 삭제하거나 별도의 삭제 API를 구현해야 합니다.

```sql
-- 특정 날짜 이후의 배달 데이터 삭제
DELETE FROM deliveries WHERE "createdAt" > '2024-01-01';

-- 모든 배달 데이터 삭제 (주의!)
DELETE FROM deliveries;
```
